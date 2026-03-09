import { prisma } from "../prisma"
import {
  ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT,
  buildAttributeExtractionUserPrompt,
} from "../ai/prompts/attributeExtraction"
import { BUYER_QUERIES_SYSTEM_PROMPT, buildBuyerQueriesUserPrompt } from "../ai/prompts/buyerQueries"
import {
  CATEGORY_DETECTION_SYSTEM_PROMPT,
  buildCategoryDetectionUserPrompt,
} from "../ai/prompts/categoryDetection"
import {
  COMPARISON_QUERIES_SYSTEM_PROMPT,
  buildComparisonQueriesUserPrompt,
} from "../ai/prompts/comparisonQueries"
import {
  COMPETITOR_DISCOVERY_SYSTEM_PROMPT,
  buildCompetitorDiscoveryUserPrompt,
} from "../ai/prompts/competitorDiscovery"
import {
  buildInsightGenerationUserPrompt,
  buildOpportunityGenerationUserPrompt,
  buildRecommendationGenerationUserPrompt,
  INSIGHT_GENERATION_SYSTEM_PROMPT,
  OPPORTUNITY_GENERATION_SYSTEM_PROMPT,
  RECOMMENDATION_GENERATION_SYSTEM_PROMPT,
} from "../ai/prompts/insightGeneration"
import {
  AI_RESPONSE_COLLECTION_SYSTEM_PROMPT,
  ATTRIBUTE_ASSOCIATION_SYSTEM_PROMPT,
  buildAiResponseCollectionUserPrompt,
  buildAttributeAssociationUserPrompt,
} from "../ai/prompts/responseAnalysis"
import { normalizeDomain, toBrandSlug, toDisplayCompanyName, toQuerySlug } from "./domain"
import { generateJson, generateText } from "./llm"
import {
  AI_VISIBILITY_STATUS,
  claimNextProcessingReport,
  findReportByDomainOrSlug,
  markReportFailed,
  touchProcessingReport,
  upsertProcessingReport,
} from "./repository"

const CACHE_DAYS = 30
const FETCH_TIMEOUT_MS = 15000
const HEARTBEAT_INTERVAL_MS = Number(process.env.AI_VISIBILITY_HEARTBEAT_MS || 20000)
const PROCESSING_STALE_SECONDS = Number(process.env.AI_VISIBILITY_PROCESSING_STALE_SECONDS || 75)
const activeGenerations = new Map<string, Promise<void>>()

function toPositiveNumber(input: number, fallback: number) {
  return Number.isFinite(input) && input > 0 ? input : fallback
}

const SAFE_HEARTBEAT_INTERVAL_MS = Math.round(toPositiveNumber(HEARTBEAT_INTERVAL_MS, 20000))
const SAFE_PROCESSING_STALE_SECONDS = Math.round(toPositiveNumber(PROCESSING_STALE_SECONDS, 75))

function logStep(step: string, details: string, error?: unknown) {
  if (error) {
    console.error(`[ai-visibility] ${step} failed: ${details}`, error)
    return
  }

  console.info(`[ai-visibility] ${step}: ${details}`)
}

function fallbackAttributes() {
  return ["Ease of Use", "Automation", "Enterprise Capability", "Pricing", "Integrations", "Analytics"]
}

type HomepageSignals = {
  metaTitle: string
  metaDescription: string
  ogSiteName: string
  headings: string[]
  cleanedText: string
}

type CategoryResponse = {
  category: string
  subcategories: string[]
  productDescription: string
}

type QueryEvidence = {
  query: string
  querySlug: string
  response: string
  responseExcerpt: string
  targetMentioned: boolean
  competitorMentions: Record<string, boolean>
  attributeMentions: Record<string, boolean>
}

type AttributeEvidence = {
  attribute: string
  matchedCount: number
  totalMentions: number
  associationPercent: number
}

type CompetitorVisibilityItem = {
  brand: string
  mentions: number
  totalQueries: number
  visibilityPercent: number
}

type PipelineOutput = {
  companyName: string
  category: string
  competitors: string[]
  attributes: string[]
  buyerQueries: Array<{
    query: string
    querySlug: string
    brandMentioned: boolean
    responseExcerpt: string
    brandVisibility: Array<{ brand: string; brandSlug: string; visibilityPercent: number }>
    attributeMentions: Array<{ attribute: string; mentionPercent: number }>
    relatedQueries: Array<{ query: string; querySlug: string }>
    relatedGuides: Array<{ title: string; href: string }>
  }>
  comparisonQueries: Array<{
    query: string
    querySlug: string
    brandMentioned: boolean
    responseExcerpt: string
    brandVisibility: Array<{ brand: string; brandSlug: string; visibilityPercent: number }>
    attributeMentions: Array<{ attribute: string; mentionPercent: number }>
    relatedQueries: Array<{ query: string; querySlug: string }>
    relatedGuides: Array<{ title: string; href: string }>
  }>
  perceptionEvidence: {
    target: AttributeEvidence[]
    competitors: Array<{ brand: string; attributes: AttributeEvidence[] }>
    counts: {
      totalBuyerQueries: number
      targetBuyerMentions: number
      totalComparisonQueries: number
      targetComparisonMentions: number
      totalMentionsAcrossAllQueries: number
    }
  }
  competitorVisibility: CompetitorVisibilityItem[]
  aiResponseSamples: Array<{ query: string; excerpt: string }>
  visibilityScore: number
  insights: string[]
  opportunities: string[]
  recommendations: string[]
  perceptionTable: {
    brands: string[]
    associations: Record<string, Record<string, "high" | "medium" | "low">>
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

function sanitizeStringList(input: unknown, desiredLength?: number) {
  if (!Array.isArray(input)) {
    return [] as string[]
  }

  const cleaned = input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)

  const unique = Array.from(new Set(cleaned))

  if (typeof desiredLength === "number") {
    return unique.slice(0, desiredLength)
  }

  return unique
}

function parseListFromObjectOrArray(input: unknown, key: string, max: number) {
  if (Array.isArray(input)) {
    return sanitizeStringList(input, max)
  }

  if (input && typeof input === "object") {
    const value = (input as Record<string, unknown>)[key]
    return sanitizeStringList(value, max)
  }

  return [] as string[]
}

function withinCacheWindow(lastAnalyzedAt: Date) {
  const ageMs = Date.now() - lastAnalyzedAt.getTime()
  return ageMs < CACHE_DAYS * 24 * 60 * 60 * 1000
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

function mentionDetected(response: string, brand: string) {
  const responseNorm = ` ${normalizeForMatch(response)} `
  const brandNorm = normalizeForMatch(brand)

  if (!brandNorm) {
    return false
  }

  return responseNorm.includes(` ${brandNorm} `)
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

function toPercentage(numerator: number, denominator: number) {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 100)
}

function toAssociationLabel(percent: number): "high" | "medium" | "low" {
  if (percent >= 60) return "high"
  if (percent >= 30) return "medium"
  return "low"
}

function extractExcerpt(response: string, brand: string) {
  const normalizedBrand = normalizeForMatch(brand)
  const sentences = response.split(/(?<=[.!?])\s+/).filter(Boolean)

  const best =
    sentences.find((sentence) => normalizeForMatch(sentence).includes(normalizedBrand)) || sentences[0] || response

  return best.slice(0, 220)
}

function detectAttributeMentions(response: string, attributes: string[]) {
  const result: Record<string, boolean> = {}
  for (const attribute of attributes) {
    result[attribute] = mentionDetected(response, attribute)
  }
  return result
}

async function fetchHomepageSignals(domain: string): Promise<HomepageSignals> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(`https://${domain}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ReadableAIVisibilityBot/2.0",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Homepage request failed with status ${response.status}`)
    }

    const html = await response.text()
    return {
      metaTitle: extractTitle(html),
      metaDescription: extractMetaContent(html, "description", "name"),
      ogSiteName: extractMetaContent(html, "og:site_name", "property"),
      headings: extractHeadings(html),
      cleanedText: stripTags(html).slice(0, 12000),
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

async function detectCategory(domain: string, signals: HomepageSignals): Promise<CategoryResponse> {
  const override = MONOPOLY_OVERRIDES[domain]
  if (override) {
    return {
      category: override.category,
      subcategories: override.subcategories,
      productDescription: override.productDescription,
    }
  }

  try {
    const response = await generateJson<CategoryResponse>([
      { role: "system", content: CATEGORY_DETECTION_SYSTEM_PROMPT },
      { role: "user", content: buildCategoryDetectionUserPrompt(signals.cleanedText) },
    ])

    return {
      category: (response.category || "Software").trim() || "Software",
      subcategories: sanitizeStringList(response.subcategories, 5),
      productDescription: (response.productDescription || "").trim(),
    }
  } catch (error) {
    logStep("detectCategory", "using fallback category", error)
    return {
      category: "Software",
      subcategories: [],
      productDescription: "",
    }
  }
}

async function discoverCompetitors(category: string, companyName: string): Promise<string[]> {
  try {
    const response = await generateJson<string[]>([
      { role: "system", content: COMPETITOR_DISCOVERY_SYSTEM_PROMPT },
      { role: "user", content: buildCompetitorDiscoveryUserPrompt(category) },
    ])

    return sanitizeStringList(response)
      .filter((brand) => normalizeForMatch(brand) !== normalizeForMatch(companyName))
      .slice(0, 3)
  } catch (error) {
    logStep("discoverCompetitors", "using empty competitor fallback", error)
    return []
  }
}

async function extractAttributes(category: string): Promise<string[]> {
  try {
    const response = await generateJson<string[]>([
      { role: "system", content: ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: buildAttributeExtractionUserPrompt(category) },
    ])

    const attributes = sanitizeStringList(response, 6)
    if (attributes.length === 6) {
      return attributes
    }
  } catch (error) {
    logStep("extractAttributes", "using default attribute fallback", error)
  }

  return fallbackAttributes()
}

async function generateBuyerQueries(category: string): Promise<string[]> {
  let queries: string[] = []

  try {
    const response = await generateJson<string[]>([
      { role: "system", content: BUYER_QUERIES_SYSTEM_PROMPT },
      { role: "user", content: buildBuyerQueriesUserPrompt(category) },
    ])
    queries = sanitizeStringList(response, 12)
    if (queries.length === 12) {
      return queries
    }
  } catch (error) {
    logStep("generateBuyerQueries", "using fallback query set", error)
  }

  const fallbacks = [
    `best ${category} software`,
    `${category} software for startups`,
    `${category} software for enterprises`,
    `${category} tools with strong integrations`,
    `${category} software with analytics`,
    `${category} alternatives`,
    `${category} platform for small teams`,
    `${category} software pricing comparison`,
    `${category} tools with automation`,
    `${category} software with enterprise support`,
    `${category} software for fast-growing teams`,
    `${category} software for technical teams`,
  ]

  return sanitizeStringList([...queries, ...fallbacks], 12)
}

async function generateComparisonQueries(targetBrand: string, competitors: string[]): Promise<string[]> {
  let queries: string[] = []
  try {
    const response = await generateJson<string[]>([
      { role: "system", content: COMPARISON_QUERIES_SYSTEM_PROMPT },
      { role: "user", content: buildComparisonQueriesUserPrompt(targetBrand, competitors) },
    ])
    queries = sanitizeStringList(response)
  } catch (error) {
    logStep("generateComparisonQueries", "using fallback comparison queries", error)
  }

  const fallback: string[] = []

  for (const competitor of competitors) {
    fallback.push(`${targetBrand} vs ${competitor}`)
    fallback.push(`${competitor} vs ${targetBrand}`)
  }

  fallback.push(`best alternatives to ${targetBrand}`)
  fallback.push(`${targetBrand} competitors`)
  fallback.push(`${targetBrand} vs top competitors`)
  fallback.push(`tools like ${targetBrand}`)
  fallback.push(`${targetBrand} pricing vs alternatives`)
  fallback.push(`best ${targetBrand} alternatives for enterprises`)
  fallback.push(`best ${targetBrand} alternatives for startups`)
  fallback.push(`${targetBrand} compared with category leaders`)

  return sanitizeStringList([...queries, ...fallback], 12).slice(0, 12)
}

async function collectAiResponses(
  category: string,
  targetBrand: string,
  competitors: string[],
  attributes: string[],
  queries: string[],
): Promise<QueryEvidence[]> {
  const results: QueryEvidence[] = []

  for (const query of queries) {
    let response = ""
    try {
      response = await generateText([
        { role: "system", content: AI_RESPONSE_COLLECTION_SYSTEM_PROMPT },
        { role: "user", content: buildAiResponseCollectionUserPrompt(query, category) },
      ])
    } catch (error) {
      logStep("collectAiResponses", `query failed, storing empty response for "${query}"`, error)
    }

    const competitorMentions: Record<string, boolean> = {}
    for (const competitor of competitors) {
      competitorMentions[competitor] = mentionDetected(response, competitor)
    }

    results.push({
      query,
      querySlug: toQuerySlug(query),
      response,
      responseExcerpt: extractExcerpt(response, targetBrand),
      targetMentioned: mentionDetected(response, targetBrand),
      competitorMentions,
      attributeMentions: detectAttributeMentions(response, attributes),
    })
  }

  return results
}

async function detectAttributeAssociations(
  brand: string,
  attributes: string[],
  evidences: QueryEvidence[],
): Promise<AttributeEvidence[]> {
  const brandMentions = evidences.filter((item) =>
    brand === "__target__" ? item.targetMentioned : item.competitorMentions[brand] === true,
  )

  if (brandMentions.length === 0) {
    return attributes.map((attribute) => ({
      attribute,
      matchedCount: 0,
      totalMentions: 0,
      associationPercent: 0,
    }))
  }

  const counters = Object.fromEntries(attributes.map((attribute) => [attribute, 0])) as Record<string, number>

  for (const evidence of brandMentions) {
    let response: Record<string, boolean> = {}
    try {
      response = await generateJson<Record<string, boolean>>([
        { role: "system", content: ATTRIBUTE_ASSOCIATION_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildAttributeAssociationUserPrompt(
            evidence.response,
            brand === "__target__" ? "target brand" : brand,
            attributes,
          ),
        },
      ])
    } catch (error) {
      logStep("detectAttributeAssociations", `association parse failed for brand "${brand}"`, error)
    }

    for (const attribute of attributes) {
      if (response[attribute] === true) {
        counters[attribute] += 1
      }
    }
  }

  return attributes.map((attribute) => ({
    attribute,
    matchedCount: counters[attribute],
    totalMentions: brandMentions.length,
    associationPercent: toPercentage(counters[attribute], brandMentions.length),
  }))
}

function buildPerceptionTable(
  companyName: string,
  competitors: string[],
  targetEvidence: AttributeEvidence[],
  competitorEvidence: Array<{ brand: string; attributes: AttributeEvidence[] }>,
) {
  const associations: Record<string, Record<string, "high" | "medium" | "low">> = {
    [companyName]: {},
  }

  for (const row of targetEvidence) {
    associations[companyName][row.attribute] = toAssociationLabel(row.associationPercent)
  }

  for (const competitor of competitorEvidence) {
    associations[competitor.brand] = {}
    for (const row of competitor.attributes) {
      associations[competitor.brand][row.attribute] = toAssociationLabel(row.associationPercent)
    }
  }

  return {
    brands: [companyName, ...competitors],
    associations,
  }
}

function buildRelatedGuides(category: string) {
  return [
    { title: `How to influence AI recommendations in ${category}`, href: "/resources/guides/ai-search-field-guide" },
    { title: "Creating AI-friendly comparison pages", href: "/guides" },
    { title: "Optimizing product pages for AI search", href: "/guides" },
  ]
}

function buildQueryVisibilitySnapshot(
  evidence: QueryEvidence,
  targetBrand: string,
  competitors: string[],
): Array<{ brand: string; brandSlug: string; visibilityPercent: number }> {
  const rows = [
    {
      brand: targetBrand,
      brandSlug: toBrandSlug(targetBrand),
      visibilityPercent: evidence.targetMentioned ? 100 : 0,
    },
    ...competitors.map((brand) => ({
      brand,
      brandSlug: toBrandSlug(brand),
      visibilityPercent: evidence.competitorMentions[brand] ? 100 : 0,
    })),
  ]

  return rows.sort((a, b) => b.visibilityPercent - a.visibilityPercent)
}

function buildQueryAttributeSnapshot(evidence: QueryEvidence, attributes: string[]) {
  return attributes.map((attribute) => ({
    attribute,
    mentionPercent: evidence.attributeMentions[attribute] ? 100 : 0,
  }))
}

async function runPipeline(domain: string, companySlug: string): Promise<PipelineOutput> {
  logStep("runPipeline", `start for ${domain}`)
  const homepage = await fetchHomepageSignals(domain)
  const companyName = pickCompanyName(homepage, companySlug, domain)
  logStep("runPipeline", `company identified as ${companyName}`)
  const categoryResult = await detectCategory(domain, homepage)
  const competitors = await discoverCompetitors(categoryResult.category, companyName)
  const attributes = await extractAttributes(categoryResult.category)
  logStep("runPipeline", `category=${categoryResult.category}, competitors=${competitors.length}, attributes=${attributes.length}`)

  const buyerQueries = await generateBuyerQueries(categoryResult.category)
  const comparisonQueries = await generateComparisonQueries(companyName, competitors)
  logStep("runPipeline", `buyerQueries=${buyerQueries.length}, comparisonQueries=${comparisonQueries.length}`)

  const buyerEvidence = await collectAiResponses(
    categoryResult.category,
    companyName,
    competitors,
    attributes,
    buyerQueries,
  )
  const comparisonEvidence = await collectAiResponses(
    categoryResult.category,
    companyName,
    competitors,
    attributes,
    comparisonQueries,
  )
  logStep("runPipeline", `responses collected buyer=${buyerEvidence.length}, comparison=${comparisonEvidence.length}`)

  const allEvidence = [...buyerEvidence, ...comparisonEvidence]

  const targetBuyerMentions = buyerEvidence.filter((item) => item.targetMentioned).length
  const targetComparisonMentions = comparisonEvidence.filter((item) => item.targetMentioned).length

  const targetAttributes = await detectAttributeAssociations("__target__", attributes, allEvidence)
  const competitorAttributes = await Promise.all(
    competitors.map(async (brand) => ({
      brand,
      attributes: await detectAttributeAssociations(brand, attributes, allEvidence),
    })),
  )

  const competitorVisibility: CompetitorVisibilityItem[] = [companyName, ...competitors].map((brand) => {
    const mentions = allEvidence.filter((item) =>
      brand === companyName ? item.targetMentioned : item.competitorMentions[brand] === true,
    ).length

    return {
      brand,
      mentions,
      totalQueries: allEvidence.length,
      visibilityPercent: toPercentage(mentions, allEvidence.length),
    }
  })

  const visibilityScore = toPercentage(targetBuyerMentions, buyerEvidence.length)

  const aiResponseSamples = allEvidence
    .filter((item) => item.targetMentioned)
    .slice(0, 3)
    .map((item) => ({
      query: item.query,
      excerpt: extractExcerpt(item.response, companyName),
    }))

  const fallbackSample = {
    query: buyerEvidence[0]?.query || "",
    excerpt: buyerEvidence[0]?.response?.slice(0, 220) || "",
  }

  while (aiResponseSamples.length < 3 && fallbackSample.query) {
    aiResponseSamples.push(fallbackSample)
  }

  let insightsResponse: { insights?: string[] } | string[] = []
  let opportunitiesResponse: { opportunities?: string[] } | string[] = []
  let recommendationsResponse: { recommendations?: string[] } | string[] = []

  try {
    insightsResponse = await generateJson<{ insights?: string[] } | string[]>([
      { role: "system", content: INSIGHT_GENERATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildInsightGenerationUserPrompt(companyName, competitors, buyerEvidence, comparisonEvidence),
      },
    ])
  } catch (error) {
    logStep("insightGeneration", "fallback insights applied", error)
  }

  try {
    opportunitiesResponse = await generateJson<{ opportunities?: string[] } | string[]>([
      { role: "system", content: OPPORTUNITY_GENERATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildOpportunityGenerationUserPrompt(companyName, {
          competitorVisibility,
          buyerEvidence,
          comparisonEvidence,
        }),
      },
    ])
  } catch (error) {
    logStep("opportunityGeneration", "fallback opportunities applied", error)
  }

  try {
    recommendationsResponse = await generateJson<{ recommendations?: string[] } | string[]>([
      { role: "system", content: RECOMMENDATION_GENERATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildRecommendationGenerationUserPrompt(companyName, {
          category: categoryResult.category,
          competitorVisibility,
          targetAttributes,
        }),
      },
    ])
  } catch (error) {
    logStep("recommendationGeneration", "fallback recommendations applied", error)
  }

  const insights = parseListFromObjectOrArray(insightsResponse, "insights", 3)
  const opportunities = parseListFromObjectOrArray(opportunitiesResponse, "opportunities", 3)
  const recommendations = parseListFromObjectOrArray(recommendationsResponse, "recommendations", 3)

  const safeInsights =
    insights.length > 0
      ? insights
      : [
          `${companyName} appears in ${toPercentage(targetBuyerMentions, buyerEvidence.length)}% of buyer-intent AI responses.`,
          `AI assistants most frequently associate ${companyName} with ${attributes[0] || "core category features"}.`,
          `Competitive presence varies across comparison queries, creating differentiated positioning opportunities.`,
        ]

  const safeOpportunities =
    opportunities.length > 0
      ? opportunities
      : [
          `Increase coverage for high-intent category queries where competitors are mentioned without ${companyName}.`,
          `Strengthen comparison-page narratives versus ${competitors[0] || "top alternatives"} to improve assistant recall.`,
          `Expand citation-ready pages around ${attributes[0] || "core use cases"} and ${attributes[1] || "buyer criteria"}.`,
        ]

  const safeRecommendations =
    recommendations.length > 0
      ? recommendations
      : [
          `Publish dedicated comparison pages targeting queries such as \"${companyName} vs ${competitors[0] || "alternative"}\".`,
          `Tighten category positioning statements across homepage, docs, and product pages for consistent AI retrieval.`,
          `Build citation-focused proof pages with benchmarks, integrations, and pricing clarity for assistant grounding.`,
        ]

  const relatedGuides = buildRelatedGuides(categoryResult.category)
  const buildRelatedQueryLinks = (all: QueryEvidence[], currentSlug: string) =>
    all
      .filter((item) => item.querySlug !== currentSlug)
      .slice(0, 4)
      .map((item) => ({ query: item.query, querySlug: item.querySlug }))

  logStep("runPipeline", `completed for ${domain} with score=${visibilityScore}`)

  return {
    companyName,
    category: categoryResult.category,
    competitors,
    attributes,
    buyerQueries: buyerEvidence.map((item) => ({
      query: item.query,
      querySlug: item.querySlug,
      brandMentioned: item.targetMentioned,
      responseExcerpt: item.responseExcerpt,
      brandVisibility: buildQueryVisibilitySnapshot(item, companyName, competitors),
      attributeMentions: buildQueryAttributeSnapshot(item, attributes),
      relatedQueries: buildRelatedQueryLinks([...buyerEvidence, ...comparisonEvidence], item.querySlug),
      relatedGuides,
    })),
    comparisonQueries: comparisonEvidence.map((item) => ({
      query: item.query,
      querySlug: item.querySlug,
      brandMentioned: item.targetMentioned,
      responseExcerpt: item.responseExcerpt,
      brandVisibility: buildQueryVisibilitySnapshot(item, companyName, competitors),
      attributeMentions: buildQueryAttributeSnapshot(item, attributes),
      relatedQueries: buildRelatedQueryLinks([...buyerEvidence, ...comparisonEvidence], item.querySlug),
      relatedGuides,
    })),
    perceptionEvidence: {
      target: targetAttributes,
      competitors: competitorAttributes,
      counts: {
        totalBuyerQueries: buyerEvidence.length,
        targetBuyerMentions,
        totalComparisonQueries: comparisonEvidence.length,
        targetComparisonMentions,
        totalMentionsAcrossAllQueries: targetBuyerMentions + targetComparisonMentions,
      },
    },
    competitorVisibility,
    aiResponseSamples,
    visibilityScore,
    insights: safeInsights,
    opportunities: safeOpportunities,
    recommendations: safeRecommendations,
    perceptionTable: buildPerceptionTable(companyName, competitors, targetAttributes, competitorAttributes),
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
      buyerQueries: payload.buyerQueries,
      comparisonQueries: payload.comparisonQueries,
      perceptionEvidence: payload.perceptionEvidence,
      competitorVisibility: payload.competitorVisibility,
      aiResponseSamples: payload.aiResponseSamples,
      insights: payload.insights,
      opportunities: payload.opportunities,
      recommendations: payload.recommendations,
      perceptionTable: payload.perceptionTable,
      status: AI_VISIBILITY_STATUS.COMPLETED,
      lastAnalyzedAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

async function scheduleAiVisibilityGeneration(input: {
  reportId: string
  domain: string
  companySlug: string
}, options?: { waitForCompletion?: boolean }) {
  const key = input.companySlug
  const existingTask = activeGenerations.get(key)
  if (existingTask) {
    if (options?.waitForCompletion) {
      await existingTask
    }

    return false
  }

  const task = (async () => {
    const heartbeat = setInterval(() => {
      void touchProcessingReport(input.reportId).catch((error) => {
        logStep("heartbeat", `failed to touch processing report ${input.reportId}`, error)
      })
    }, SAFE_HEARTBEAT_INTERVAL_MS)

    try {
      await touchProcessingReport(input.reportId)
      const output = await runPipeline(input.domain, input.companySlug)
      await finalizeReport(input.reportId, output)
    } catch (error) {
      await markReportFailed(input.reportId)
      logStep("generateAiVisibilityReport", `failed for ${input.domain}`, error)
    } finally {
      clearInterval(heartbeat)
      activeGenerations.delete(key)
    }
  })()

  activeGenerations.set(key, task)

  if (options?.waitForCompletion) {
    await task
  } else {
    void task
  }

  return true
}

export function isAiVisibilityGenerationActive(companySlug: string) {
  return activeGenerations.has(companySlug)
}

export function getAiVisibilityProcessingStaleSeconds() {
  return SAFE_PROCESSING_STALE_SECONDS
}

export async function processQueuedAiVisibilityReports(options?: {
  companySlug?: string
  maxReports?: number
  force?: boolean
}) {
  const requestedMax = options?.maxReports ?? 1
  const maxReports = Math.min(Math.max(requestedMax, 1), 3)
  const staleBefore = new Date(Date.now() - SAFE_PROCESSING_STALE_SECONDS * 1000)
  const processedSlugs: string[] = []

  for (let index = 0; index < maxReports; index += 1) {
    const claimed = await claimNextProcessingReport({
      companySlug: options?.companySlug,
      staleBefore,
      ignoreStaleWindow: Boolean(options?.force && options?.companySlug),
    })

    if (!claimed) {
      break
    }

    await scheduleAiVisibilityGeneration(
      {
        reportId: claimed.id,
        domain: claimed.domain,
        companySlug: claimed.companySlug,
      },
      { waitForCompletion: true },
    )

    processedSlugs.push(claimed.companySlug)

    if (options?.companySlug) {
      break
    }
  }

  return {
    processed: processedSlugs.length,
    processedSlugs,
  }
}

export async function generateAiVisibilityReport(domainInput: string, options?: { forceRefresh?: boolean }) {
  const { domain, companySlug } = normalizeDomain(domainInput)
  const existing = await findReportByDomainOrSlug(domain, companySlug)
  const forceRefresh = Boolean(options?.forceRefresh)

  if (existing?.status === AI_VISIBILITY_STATUS.PROCESSING) {
    const startedGeneration = await scheduleAiVisibilityGeneration({
      reportId: existing.id,
      domain: existing.domain,
      companySlug: existing.companySlug,
    })

    return {
      report: existing,
      companySlug: existing.companySlug,
      cached: false,
      startedGeneration,
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

  const startedGeneration = await scheduleAiVisibilityGeneration({
    reportId: processing.id,
    domain: processing.domain,
    companySlug: processing.companySlug,
  })

  return {
    report: processing,
    companySlug,
    cached: false,
    startedGeneration,
  }
}
