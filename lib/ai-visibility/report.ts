import { prisma } from "../prisma"
import { normalizeDomain, toDisplayCompanyName } from "./domain"
import { generateJson, generateText } from "./llm"
import {
  AI_VISIBILITY_STATUS,
  findReportByDomainOrSlug,
  upsertProcessingReport,
  markReportFailed,
} from "./repository"

const CACHE_DAYS = 30
const FETCH_TIMEOUT_MS = 15000

type Level = "high" | "medium" | "low"

type HomepageSignals = {
  metaTitle: string
  metaDescription: string
  ogSiteName: string
  headings: string[]
  cleanedText: string
  sourcePresence: number
}

type CategoryResponse = {
  category: string
  subcategories: string[]
  productDescription: string
}

type BuyerQueryEntry = {
  query: string
  likelyMentioned: boolean
}

type PipelineOutput = {
  companyName: string
  category: string
  competitors: string[]
  attributes: string[]
  perceptionTable: {
    brands: string[]
    associations: Record<string, Record<string, Level>>
  }
  buyerQueries: BuyerQueryEntry[]
  visibilityScore: number
  insights: {
    bullets: string[]
    subcategories: string[]
    productDescription: string
    sourceSignals: {
      metaTitlePresent: boolean
      metaDescriptionPresent: boolean
      headingCount: number
      sourcePresence: number
    }
    recommendedActions: string[]
  }
}

const MONOPOLY_OVERRIDES: Record<
  string,
  {
    companyName: string
    category: string
    subcategories: string[]
    productDescription: string
  }
> = {
  "google.com": {
    companyName: "Google Cloud",
    category: "Cloud Infrastructure",
    subcategories: ["cloud platform", "enterprise cloud services"],
    productDescription: "Google Cloud platform for enterprise infrastructure and data workloads",
  },
  "amazon.com": {
    companyName: "AWS",
    category: "Cloud Infrastructure",
    subcategories: ["cloud platform", "developer infrastructure"],
    productDescription: "Amazon Web Services cloud infrastructure and platform services",
  },
  "meta.com": {
    companyName: "Meta Advertising Platform",
    category: "Digital Advertising Platform",
    subcategories: ["ad targeting", "campaign measurement"],
    productDescription: "Advertising platform for audience targeting and performance campaigns",
  },
}

function stripTags(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractMetaContent(html: string, name: string, attribute: "name" | "property") {
  const regex = new RegExp(`<meta[^>]*${attribute}=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i")
  const reversedRegex = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${name}["'][^>]*>`, "i")
  return html.match(regex)?.[1]?.trim() || html.match(reversedRegex)?.[1]?.trim() || ""
}

function extractTitle(html: string) {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || ""
}

function extractHeadings(html: string) {
  const matches = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) || []
  return matches
    .map((item) => stripTags(item))
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20)
}

async function fetchHomepageSignals(domain: string): Promise<HomepageSignals> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(`https://${domain}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ReadableAIVisibilityBot/1.0",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Homepage request failed with status ${response.status}`)
    }

    const html = await response.text()
    const metaTitle = extractTitle(html)
    const metaDescription = extractMetaContent(html, "description", "name")
    const ogSiteName = extractMetaContent(html, "og:site_name", "property")
    const headings = extractHeadings(html)
    const cleanedText = stripTags(html).slice(0, 12000)

    let sourcePresence = 0
    if (metaTitle) sourcePresence += 25
    if (metaDescription) sourcePresence += 25
    if (headings.length >= 6) sourcePresence += 25
    if (cleanedText.length >= 1200) sourcePresence += 25

    return {
      metaTitle,
      metaDescription,
      ogSiteName,
      headings,
      cleanedText,
      sourcePresence,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

function withinCacheWindow(lastAnalyzedAt: Date) {
  const ageMs = Date.now() - lastAnalyzedAt.getTime()
  return ageMs < CACHE_DAYS * 24 * 60 * 60 * 1000
}

function pickCompanyName(signals: HomepageSignals, fallbackSlug: string, domain: string): string {
  const override = MONOPOLY_OVERRIDES[domain]
  if (override) {
    return override.companyName
  }

  if (signals.ogSiteName) {
    return signals.ogSiteName.trim()
  }

  if (signals.metaTitle) {
    const firstPart = signals.metaTitle.split(/[|:-]/)[0]?.trim()
    if (firstPart) {
      return firstPart
    }
  }

  return toDisplayCompanyName(fallbackSlug)
}

function sanitizeStringList(input: unknown, desiredLength?: number) {
  if (!Array.isArray(input)) {
    return [] as string[]
  }

  const cleaned = input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)

  if (typeof desiredLength === "number") {
    return cleaned.slice(0, desiredLength)
  }

  return cleaned
}

async function detectCategory(domain: string, companySlug: string, signals: HomepageSignals): Promise<CategoryResponse> {
  const override = MONOPOLY_OVERRIDES[domain]
  if (override) {
    return {
      category: override.category,
      subcategories: override.subcategories,
      productDescription: override.productDescription,
    }
  }

  const result = await generateJson<CategoryResponse>([
    {
      role: "system",
      content:
        "You classify B2B and B2C software categories. Return valid JSON only. Do not include markdown fences.",
    },
    {
      role: "user",
      content: `Analyze this website content and determine the primary product category.\n\nReturn JSON:\n{"category":"","subcategories":[],"productDescription":""}\n\nWebsite content:\n${signals.cleanedText}`,
    },
  ])

  const category = (result.category || "Software").trim() || "Software"
  const subcategories = sanitizeStringList(result.subcategories, 5)
  const productDescription = (result.productDescription || "").trim()

  return {
    category,
    subcategories,
    productDescription,
  }
}

async function discoverCompetitors(category: string, companyName: string): Promise<string[]> {
  const list = await generateJson<string[]>([
    {
      role: "system",
      content:
        "Return only a JSON string array. Include recognized companies only. No commentary and no markdown fences.",
    },
    {
      role: "user",
      content: `List 5 well-known competitors in the ${category} category.`,
    },
  ])

  const normalized = sanitizeStringList(list)
  const filtered = normalized.filter((name) => name.toLowerCase() !== companyName.toLowerCase())
  return Array.from(new Set(filtered)).slice(0, 3)
}

async function extractAttributes(category: string): Promise<string[]> {
  const list = await generateJson<string[]>([
    {
      role: "system",
      content:
        "Return exactly 6 buyer comparison attributes as a JSON array of strings. No markdown fences.",
    },
    {
      role: "user",
      content: `List the most common attributes buyers use to compare vendors in the ${category} category.`,
    },
  ])

  const cleaned = sanitizeStringList(list, 6)

  if (cleaned.length === 6) {
    return cleaned
  }

  const fallback = [
    "Ease of Use",
    "Feature Depth",
    "Integrations",
    "Reliability",
    "Support Quality",
    "Pricing Transparency",
  ]

  return fallback
}

async function evaluateBrandAttributes(brandName: string, category: string, attributes: string[]): Promise<Record<string, Level>> {
  const runs: Record<string, Level>[] = []
  const allowed = new Set<Level>(["high", "medium", "low"])

  for (let i = 0; i < 3; i += 1) {
    const response = await generateJson<Record<string, string>>([
      {
        role: "system",
        content:
          "Return JSON only. Keys must exactly match provided attributes. Values must be one of: high, medium, low.",
      },
      {
        role: "user",
        content: `For the brand ${brandName} in the ${category} category, evaluate how strongly the following attributes are associated with the brand.\n\nAttributes:\n${attributes.join("\n")}\n\nReturn JSON like:\n{"Ease of Use":"high"}`,
      },
    ])

    const normalized: Record<string, Level> = {}
    for (const attribute of attributes) {
      const value = (response[attribute] || "").toLowerCase() as Level
      normalized[attribute] = allowed.has(value) ? value : "medium"
    }

    runs.push(normalized)
  }

  const majority: Record<string, Level> = {}

  for (const attribute of attributes) {
    const counts = { high: 0, medium: 0, low: 0 }

    for (const run of runs) {
      counts[run[attribute]] += 1
    }

    if (counts.high >= counts.medium && counts.high >= counts.low) {
      majority[attribute] = "high"
    } else if (counts.medium >= counts.high && counts.medium >= counts.low) {
      majority[attribute] = "medium"
    } else {
      majority[attribute] = "low"
    }
  }

  return majority
}

async function generateBuyerQueries(category: string): Promise<string[]> {
  const list = await generateJson<string[]>([
    {
      role: "system",
      content:
        "Return exactly 10 buyer search queries as a JSON array of strings. No markdown fences and no commentary.",
    },
    {
      role: "user",
      content: `List 10 queries buyers might ask AI systems when searching for products in the ${category} category.`,
    },
  ])

  const cleaned = sanitizeStringList(list, 10)
  return cleaned.length === 10 ? cleaned : cleaned.slice(0, 10)
}

async function evaluateQueryMentions(companyName: string, category: string, queries: string[]): Promise<BuyerQueryEntry[]> {
  const results: BuyerQueryEntry[] = []

  for (const query of queries) {
    const raw = await generateText([
      {
        role: "system",
        content: "Return only true or false.",
      },
      {
        role: "user",
        content: `In the ${category} category, would ${companyName} likely appear in an AI recommendation for this buyer query: "${query}"?`,
      },
    ])

    results.push({
      query,
      likelyMentioned: /^true$/i.test(raw.trim()),
    })
  }

  return results
}

function levelToScore(level: Level): number {
  if (level === "high") return 100
  if (level === "medium") return 60
  return 25
}

function computeVisibilityScore(input: {
  companyAssociations: Record<string, Level>
  buyerQueries: BuyerQueryEntry[]
  sourcePresence: number
}) {
  const attributeScores = Object.values(input.companyAssociations).map(levelToScore)
  const attributeAssociations =
    attributeScores.length > 0
      ? attributeScores.reduce((sum, value) => sum + value, 0) / attributeScores.length
      : 0

  const mentions = input.buyerQueries.filter((item) => item.likelyMentioned).length
  const buyerQueryMentions = input.buyerQueries.length > 0 ? (mentions / input.buyerQueries.length) * 100 : 0

  const raw = attributeAssociations * 0.4 + buyerQueryMentions * 0.4 + input.sourcePresence * 0.2
  return Math.max(0, Math.min(100, Math.round(raw)))
}

async function generateInsights(payload: {
  companyName: string
  category: string
  companyAssociations: Record<string, Level>
  buyerQueries: BuyerQueryEntry[]
}) {
  const bullets = await generateJson<string[]>([
    {
      role: "system",
      content: "Return JSON array with exactly 3 concise bullet strings. No markdown fences.",
    },
    {
      role: "user",
      content: `Based on the following perception data generate 3 concise insights about how AI systems currently perceive the brand.\n\nBrand: ${payload.companyName}\nCategory: ${payload.category}\nAttribute associations: ${JSON.stringify(payload.companyAssociations)}\nBuyer query mentions: ${JSON.stringify(payload.buyerQueries)}`,
    },
  ])

  const recommendedActions = await generateJson<string[]>([
    {
      role: "system",
      content: "Return JSON array with exactly 3 concise action statements. No markdown fences.",
    },
    {
      role: "user",
      content: `Generate 3 recommended actions to improve ${payload.companyName}'s AI visibility in ${payload.category}. Base it on this data: ${JSON.stringify({
        companyAssociations: payload.companyAssociations,
        buyerQueries: payload.buyerQueries,
      })}`,
    },
  ])

  return {
    bullets: sanitizeStringList(bullets, 3),
    recommendedActions: sanitizeStringList(recommendedActions, 3),
  }
}

async function runPipeline(domain: string, companySlug: string): Promise<PipelineOutput> {
  const signals = await fetchHomepageSignals(domain)
  const companyName = pickCompanyName(signals, companySlug, domain)
  const categoryResult = await detectCategory(domain, companySlug, signals)
  const competitors = await discoverCompetitors(categoryResult.category, companyName)
  const attributes = await extractAttributes(categoryResult.category)

  const brands = [companyName, ...competitors]
  const associations: Record<string, Record<string, Level>> = {}

  for (const brand of brands) {
    associations[brand] = await evaluateBrandAttributes(brand, categoryResult.category, attributes)
  }

  const queries = await generateBuyerQueries(categoryResult.category)
  const buyerQueries = await evaluateQueryMentions(companyName, categoryResult.category, queries)

  const visibilityScore = computeVisibilityScore({
    companyAssociations: associations[companyName] || {},
    buyerQueries,
    sourcePresence: signals.sourcePresence,
  })

  const insights = await generateInsights({
    companyName,
    category: categoryResult.category,
    companyAssociations: associations[companyName] || {},
    buyerQueries,
  })

  return {
    companyName,
    category: categoryResult.category,
    competitors,
    attributes,
    perceptionTable: {
      brands,
      associations,
    },
    buyerQueries,
    visibilityScore,
    insights: {
      bullets: insights.bullets,
      recommendedActions: insights.recommendedActions,
      subcategories: categoryResult.subcategories,
      productDescription: categoryResult.productDescription,
      sourceSignals: {
        metaTitlePresent: Boolean(signals.metaTitle),
        metaDescriptionPresent: Boolean(signals.metaDescription),
        headingCount: signals.headings.length,
        sourcePresence: signals.sourcePresence,
      },
    },
  }
}

async function finalizeReport(reportId: string, payload: PipelineOutput) {
  await prisma.aiVisibilityReport.update({
    where: { id: reportId },
    data: {
      companyName: payload.companyName,
      category: payload.category,
      visibilityScore: payload.visibilityScore,
      competitors: payload.competitors,
      attributes: payload.attributes,
      perceptionTable: payload.perceptionTable,
      buyerQueries: payload.buyerQueries,
      insights: payload.insights,
      status: AI_VISIBILITY_STATUS.COMPLETED,
      lastAnalyzedAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

export async function generateAiVisibilityReport(domainInput: string, options?: { forceRefresh?: boolean }) {
  const { domain, companySlug } = normalizeDomain(domainInput)
  const existing = await findReportByDomainOrSlug(domain, companySlug)
  const forceRefresh = Boolean(options?.forceRefresh)

  if (existing?.status === AI_VISIBILITY_STATUS.PROCESSING) {
    return {
      report: existing,
      companySlug: existing.companySlug,
      cached: false,
      startedGeneration: false,
    }
  }

  if (
    existing?.status === AI_VISIBILITY_STATUS.COMPLETED &&
    withinCacheWindow(existing.lastAnalyzedAt) &&
    !forceRefresh
  ) {
    return {
      report: existing,
      companySlug: existing.companySlug,
      cached: true,
      startedGeneration: false,
    }
  }

  const processing = await upsertProcessingReport({
    domain,
    companySlug,
    companyName: existing?.companyName || toDisplayCompanyName(companySlug),
  })

  try {
    const output = await runPipeline(processing.domain, processing.companySlug)
    await finalizeReport(processing.id, output)
  } catch {
    await markReportFailed(processing.id)
    throw new Error("Report generation failed")
  }

  const completed = await findReportByDomainOrSlug(domain, companySlug)
  if (!completed) {
    throw new Error("Report could not be loaded after generation")
  }

  return {
    report: completed,
    companySlug,
    cached: false,
    startedGeneration: true,
  }
}
