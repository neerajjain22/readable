import { prisma } from "../prisma"
import type { Prisma } from "@prisma/client"
import {
  ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT,
  RESPONSE_ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT,
  buildAttributeExtractionUserPrompt,
  buildResponseAttributeExtractionUserPrompt,
} from "../ai/prompts/attributeExtraction"
import { BUYER_QUERIES_SYSTEM_PROMPT, buildBuyerQueriesUserPrompt } from "../ai/prompts/buyerQueries"
import {
  CATEGORY_DETECTION_SYSTEM_PROMPT,
  buildCategoryDetectionUserPromptWithContext,
} from "../ai/prompts/categoryDetection"
import {
  COMPARISON_QUERIES_SYSTEM_PROMPT,
  buildComparisonQueriesUserPrompt,
} from "../ai/prompts/comparisonQueries"
import {
  COMPETITOR_VALIDATION_SYSTEM_PROMPT,
  COMPETITOR_DISCOVERY_SYSTEM_PROMPT,
  buildCompetitorDiscoveryUserPrompt,
  buildCompetitorValidationUserPrompt,
} from "../ai/prompts/competitorDiscovery"
import {
  CONTEXT_EXTRACTION_SYSTEM_PROMPT,
  buildContextExtractionUserPrompt,
} from "../ai/prompts/contextExtraction"
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
const QUERY_RESPONSE_CONCURRENCY = Number(process.env.AI_VISIBILITY_QUERY_CONCURRENCY || 4)
const ATTRIBUTE_ASSOCIATION_CONCURRENCY = Number(process.env.AI_VISIBILITY_ATTRIBUTE_CONCURRENCY || 4)
const activeGenerations = new Map<string, Promise<void>>()

function toPositiveNumber(input: number, fallback: number) {
  return Number.isFinite(input) && input > 0 ? input : fallback
}

const SAFE_HEARTBEAT_INTERVAL_MS = Math.round(toPositiveNumber(HEARTBEAT_INTERVAL_MS, 20000))
const SAFE_PROCESSING_STALE_SECONDS = Math.round(toPositiveNumber(PROCESSING_STALE_SECONDS, 75))
const SAFE_QUERY_RESPONSE_CONCURRENCY = Math.max(1, Math.round(toPositiveNumber(QUERY_RESPONSE_CONCURRENCY, 4)))
const SAFE_ATTRIBUTE_ASSOCIATION_CONCURRENCY = Math.max(
  1,
  Math.round(toPositiveNumber(ATTRIBUTE_ASSOCIATION_CONCURRENCY, 4)),
)

async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  concurrency: number,
  worker: (item: TInput, index: number) => Promise<TOutput>,
) {
  if (items.length === 0) {
    return [] as TOutput[]
  }

  const safeConcurrency = Math.max(1, Math.min(concurrency, items.length))
  const results = new Array<TOutput>(items.length)
  let cursor = 0

  async function runWorker() {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= items.length) {
        return
      }

      results[index] = await worker(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: safeConcurrency }, () => runWorker()))
  return results
}

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

function defaultTableAttributes() {
  return ["Ease of use", "Integrations", "Pricing", "Customer support"]
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

type CompanyContext = {
  companyName: string
  industryCategory: string
  subCategory: string
  businessModel: string
  targetCustomerSegment: string
  primaryGeography: string
  companyScale: string
}

const GENERIC_CATEGORY_VALUES = new Set([
  "software",
  "saas",
  "technology",
  "tech",
  "digital platform",
  "platform",
  "business software",
])

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

type StageUpdateWriter = (stage: string, data: Prisma.AiVisibilityReportUpdateInput) => Promise<void>

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

function isBrandMentionedInEvidence(evidence: QueryEvidence, brand: string, isTargetBrand = false) {
  if (isTargetBrand) {
    return evidence.targetMentioned
  }

  if (brand in evidence.competitorMentions) {
    return evidence.competitorMentions[brand] === true
  }

  return mentionDetected(evidence.response, brand)
}

function uniqueByNormalized(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = normalizeForMatch(value)
    if (!normalized || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    result.push(value)
  }

  return result
}

function normalizeBrandName(raw: string) {
  const value = raw.trim()
  if (!value) return ""

  const normalized = normalizeForMatch(value)
  const aliases: Record<string, string> = {
    "meta platforms": "Meta",
    meta: "Meta",
    "twitter x": "Twitter",
    "x twitter": "Twitter",
    twitter: "Twitter",
    x: "Twitter",
  }

  if (aliases[normalized]) {
    return aliases[normalized]
  }

  const cleaned = value.replace(/\s+/g, " ").replace(/\s*\/\s*/g, " / ").trim()
  return cleaned
}

function isInvalidBrandToken(raw: string) {
  const normalized = normalizeForMatch(raw)
  if (!normalized) return true

  const blocked = new Set([
    "you",
    "i",
    "we",
    "they",
    "our",
    "your",
    "their",
    "it",
    "them",
    "here",
    "there",
    "this",
    "that",
    "these",
    "those",
    "company",
    "platform",
    "product",
    "service",
    "solution",
    "brand",
    "vendor",
    "tool",
    "tools",
    "app",
    "apps",
    "software",
    "website",
  ])

  if (blocked.has(normalized)) {
    return true
  }

  // Filter out short non-brand stopwords that may slip through LLM outputs.
  if (normalized.length <= 2) {
    return true
  }

  return false
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function extractBrandMentionsFromResponses(
  responses: string[],
  companyName: string,
  fallbackCompetitors: string[],
): string[] {
  const targetNorm = normalizeForMatch(companyName)
  const knownCandidates = uniqueByNormalized(fallbackCompetitors.map(normalizeBrandName)).filter(
    (brand) => normalizeForMatch(brand) !== targetNorm,
  )

  const mentionCounts = new Map<string, number>()
  for (const candidate of knownCandidates) {
    mentionCounts.set(candidate, 0)
  }

  const titleCasePattern = /\b[A-Z][A-Za-z0-9&.+-]*(?:\s+[A-Z][A-Za-z0-9&.+-]*){0,2}\b/g

  for (const response of responses) {
    const text = String(response || "")
    if (!text.trim()) continue

    const inferredMatches = text.match(titleCasePattern) || []
    for (const rawMatch of inferredMatches) {
      const candidate = normalizeBrandName(rawMatch)
      const norm = normalizeForMatch(candidate)
      const words = norm.split(" ").filter(Boolean)
      if (words.length === 0 || words.length > 4) continue
      if (norm === targetNorm) continue
      if (["ai", "api", "crm", "saas", "software", "platform"].includes(norm)) continue
      if (!/^[a-z0-9&.+\-\s]+$/.test(norm)) continue

      const current = mentionCounts.get(candidate) || 0
      mentionCounts.set(candidate, current + 1)
    }

    for (const candidate of knownCandidates) {
      if (mentionDetected(text, candidate)) {
        const current = mentionCounts.get(candidate) || 0
        mentionCounts.set(candidate, current + 1)
      }
    }
  }

  const ranked = Array.from(mentionCounts.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)

  const selected = uniqueByNormalized(
    ranked.filter((brand) => normalizeForMatch(brand) !== targetNorm),
  ).slice(0, 3)

  if (selected.length < 3) {
    const fallback = uniqueByNormalized(
      fallbackCompetitors
        .map(normalizeBrandName)
        .filter((brand) => normalizeForMatch(brand) !== targetNorm),
    ).slice(0, 3)

    return fallback
  }

  return selected
}

function normalizeAttributeLabel(raw: string) {
  const value = raw.trim()
  if (!value) return ""
  const normalized = normalizeForMatch(value)

  if (normalized.includes("easy") || normalized.includes("user friendly") || normalized.includes("ease of use")) {
    return "Ease of use"
  }

  if (
    normalized.includes("reporting") ||
    normalized.includes("analytics") ||
    normalized.includes("dashboard")
  ) {
    return "Reporting & analytics"
  }

  if (normalized.includes("integration") || normalized.includes("ecosystem")) {
    return "Integrations"
  }

  if (normalized.includes("pricing") || normalized.includes("cost")) {
    return "Pricing"
  }

  if (normalized.includes("support") || normalized.includes("customer service")) {
    return "Customer support"
  }

  if (normalized.includes("automation")) {
    return "Automation"
  }

  if (normalized.includes("collaboration")) {
    return "Team collaboration"
  }

  const words = value
    .replace(/[^A-Za-z0-9\s&/+-]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 4)

  if (words.length < 2) {
    return ""
  }

  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
}

async function extractAttributesFromResponses(category: string, responses: string[]) {
  if (responses.length === 0) {
    return [] as string[]
  }

  try {
    const response = await generateJson<{ attributes?: string[] } | string[]>([
      { role: "system", content: RESPONSE_ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: buildResponseAttributeExtractionUserPrompt(category, responses.slice(0, 40)) },
    ])

    const extracted = parseListFromObjectOrArray(response, "attributes", 24)
    const normalized = extracted.map(normalizeAttributeLabel).filter(Boolean)
    const counts = new Map<string, number>()

    for (const attribute of normalized) {
      counts.set(attribute, (counts.get(attribute) || 0) + 1)
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([attribute]) => attribute)
      .slice(0, 6)
  } catch (error) {
    logStep("extractAttributesFromResponses", "response-based extraction failed", error)
    return []
  }
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
    const firstPart = signals.metaTitle.split(/[|:\-–—]/)[0]?.trim()
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

function clampToPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}

function averagePercent(values: number[]) {
  if (values.length === 0) return 0
  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
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
  const candidates = [`https://${domain}`, `https://www.${domain}`]
  let lastError: unknown = null

  for (const candidateUrl of candidates) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const response = await fetch(candidateUrl, {
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
      const cleanedText = stripTags(html).slice(0, 12000)

      return {
        metaTitle: extractTitle(html),
        metaDescription: extractMetaContent(html, "description", "name"),
        ogSiteName: extractMetaContent(html, "og:site_name", "property"),
        headings: extractHeadings(html),
        cleanedText,
      }
    } catch (error) {
      lastError = error
      logStep("fetchHomepageSignals", `candidate failed for ${candidateUrl}`, error)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  logStep("fetchHomepageSignals", `all candidates failed for ${domain}; using fallback signals`, lastError)
  const fallbackSlug = domain.split(".")[0] || "company"
  const fallbackName = toDisplayCompanyName(fallbackSlug)
  return {
    metaTitle: fallbackName,
    metaDescription: "",
    ogSiteName: "",
    headings: [],
    cleanedText: `${fallbackName} official website`,
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
      {
        role: "user",
        content: buildCategoryDetectionUserPromptWithContext({
          cleanedHomepageText: signals.cleanedText,
          industryCategory: "Software",
          subCategory: "",
          businessModel: "SaaS platform",
          targetCustomerSegment: "Business buyers",
          primaryGeography: "Global",
          companyScale: "Mid-market company",
        }),
      },
    ])

    const category = (response.category || "").trim()
    if (!category || GENERIC_CATEGORY_VALUES.has(category.toLowerCase())) {
      throw new Error("Category detection returned empty or overly generic category")
    }

    return {
      category,
      subcategories: sanitizeStringList(response.subcategories, 5),
      productDescription: (response.productDescription || "").trim(),
    }
  } catch (error) {
    logStep("detectCategory", "category detection failed", error)
    throw new Error("Category detection failed")
  }
}

async function extractCompanyContext(
  signals: HomepageSignals,
  fallbackCompanyName: string,
): Promise<CompanyContext> {
  try {
    const response = await generateJson<Partial<CompanyContext>>([
      { role: "system", content: CONTEXT_EXTRACTION_SYSTEM_PROMPT },
      { role: "user", content: buildContextExtractionUserPrompt(signals.cleanedText) },
    ])

    return {
      companyName: (response.companyName || fallbackCompanyName).trim() || fallbackCompanyName,
      industryCategory: (response.industryCategory || "Software").trim() || "Software",
      subCategory: (response.subCategory || "").trim(),
      businessModel: (response.businessModel || "SaaS platform").trim() || "SaaS platform",
      targetCustomerSegment: (response.targetCustomerSegment || "Business buyers").trim() || "Business buyers",
      primaryGeography: (response.primaryGeography || "Global").trim() || "Global",
      companyScale: (response.companyScale || "Mid-market company").trim() || "Mid-market company",
    }
  } catch (error) {
    logStep("extractCompanyContext", "using fallback company context", error)
    return {
      companyName: fallbackCompanyName,
      industryCategory: "Software",
      subCategory: "",
      businessModel: "SaaS platform",
      targetCustomerSegment: "Business buyers",
      primaryGeography: "Global",
      companyScale: "Mid-market company",
    }
  }
}

async function detectCategoryWithContext(domain: string, signals: HomepageSignals, context: CompanyContext): Promise<CategoryResponse> {
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
      {
        role: "user",
        content: buildCategoryDetectionUserPromptWithContext({
          cleanedHomepageText: signals.cleanedText,
          industryCategory: context.industryCategory,
          subCategory: context.subCategory,
          businessModel: context.businessModel,
          targetCustomerSegment: context.targetCustomerSegment,
          primaryGeography: context.primaryGeography,
          companyScale: context.companyScale,
        }),
      },
    ])

    const category = (response.category || context.subCategory || "").trim()
    if (!category || GENERIC_CATEGORY_VALUES.has(category.toLowerCase())) {
      throw new Error("Category detection returned empty or overly generic category")
    }

    return {
      category,
      subcategories: sanitizeStringList(response.subcategories, 5),
      productDescription: (response.productDescription || "").trim(),
    }
  } catch (error) {
    logStep("detectCategoryWithContext", "category detection failed", error)
    throw new Error("Category detection failed")
  }
}

async function discoverCompetitors(
  category: string,
  companyName: string,
  context: CompanyContext,
): Promise<string[]> {
  try {
    const response = await generateJson<string[]>([
      { role: "system", content: COMPETITOR_DISCOVERY_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildCompetitorDiscoveryUserPrompt({
          category,
          companyName,
          subCategory: context.subCategory || category,
          businessModel: context.businessModel,
          targetCustomerSegment: context.targetCustomerSegment,
          primaryGeography: context.primaryGeography,
          companyScale: context.companyScale,
        }),
      },
    ])

    const candidates = sanitizeStringList(response)
      .filter((brand) => normalizeForMatch(brand) !== normalizeForMatch(companyName))
      .filter((brand) => !isInvalidBrandToken(brand))
      .slice(0, 5)

    if (candidates.length === 0) {
      return []
    }

    try {
      const validation = await generateJson<{ validCompetitors?: string[] }>([
        { role: "system", content: COMPETITOR_VALIDATION_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildCompetitorValidationUserPrompt({
            targetCompany: companyName,
            category,
            subCategory: context.subCategory || category,
            businessModel: context.businessModel,
            targetCustomerSegment: context.targetCustomerSegment,
            primaryGeography: context.primaryGeography,
            companyScale: context.companyScale,
            competitors: candidates,
          }),
        },
      ])

      return sanitizeStringList(validation.validCompetitors, 5)
        .filter((brand) => normalizeForMatch(brand) !== normalizeForMatch(companyName))
        .filter((brand) => !isInvalidBrandToken(brand))
        .slice(0, 3)
    } catch (error) {
      logStep("discoverCompetitors", "validation failed, using candidate list", error)
      return candidates.slice(0, 3)
    }
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

async function generateBuyerQueries(category: string, context: CompanyContext): Promise<string[]> {
  let queries: string[] = []

  try {
    const response = await generateJson<string[]>([
      { role: "system", content: BUYER_QUERIES_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildBuyerQueriesUserPrompt({
          category,
          subCategory: context.subCategory || category,
          businessModel: context.businessModel,
          targetCustomerSegment: context.targetCustomerSegment,
          primaryGeography: context.primaryGeography,
        }),
      },
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

async function generateComparisonQueries(
  targetBrand: string,
  competitors: string[],
  category: string,
  context: CompanyContext,
): Promise<string[]> {
  let queries: string[] = []
  try {
    const response = await generateJson<string[]>([
      { role: "system", content: COMPARISON_QUERIES_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildComparisonQueriesUserPrompt({
          targetBrand,
          competitors,
          category,
          subCategory: context.subCategory || category,
          primaryGeography: context.primaryGeography,
          targetCustomerSegment: context.targetCustomerSegment,
        }),
      },
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
  return mapWithConcurrency(
    queries,
    SAFE_QUERY_RESPONSE_CONCURRENCY,
    async (query): Promise<QueryEvidence> => {
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

    return {
      query,
      querySlug: toQuerySlug(query),
      response,
      responseExcerpt: extractExcerpt(response, targetBrand),
      targetMentioned: mentionDetected(response, targetBrand),
      competitorMentions,
      attributeMentions: detectAttributeMentions(response, attributes),
    }
    },
  )
}

async function detectAttributeAssociations(
  brand: string,
  attributes: string[],
  evidences: QueryEvidence[],
): Promise<AttributeEvidence[]> {
  const brandMentions = evidences.filter((item) =>
    brand === "__target__" ? item.targetMentioned : isBrandMentionedInEvidence(item, brand),
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

  const associationResponses = await mapWithConcurrency(
    brandMentions,
    SAFE_ATTRIBUTE_ASSOCIATION_CONCURRENCY,
    async (evidence): Promise<Record<string, boolean>> => {
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

    return response
    },
  )

  for (const response of associationResponses) {
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
      visibilityPercent: isBrandMentionedInEvidence(evidence, brand) ? 100 : 0,
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

function buildInitialQueryRows(queries: string[]) {
  return queries.map((query) => ({
    query,
    querySlug: toQuerySlug(query),
    brandMentioned: false,
    responseExcerpt: "",
    brandVisibility: [],
    attributeMentions: [],
    relatedQueries: [],
    relatedGuides: [],
  }))
}

async function runPipeline(
  domain: string,
  companySlug: string,
  onStageUpdate?: StageUpdateWriter,
): Promise<PipelineOutput> {
  async function persistStage(stage: string, data: Prisma.AiVisibilityReportUpdateInput) {
    if (!onStageUpdate) {
      return
    }

    try {
      await onStageUpdate(stage, data)
    } catch (error) {
      logStep("runPipeline", `stage persistence failed at ${stage}`, error)
    }
  }

  logStep("runPipeline", `start for ${domain}`)
  const homepage = await fetchHomepageSignals(domain)
  const fallbackCompanyName = pickCompanyName(homepage, companySlug, domain)
  const companyContext = await extractCompanyContext(homepage, fallbackCompanyName)
  const companyName = (companyContext.companyName || fallbackCompanyName).trim() || fallbackCompanyName
  logStep("runPipeline", `company identified as ${companyName}`)
  const categoryResult = await detectCategoryWithContext(domain, homepage, companyContext)
  await persistStage("category", {
    companyName,
    category: categoryResult.category,
  })
  const initialCompetitors = await discoverCompetitors(categoryResult.category, companyName, companyContext)
  const initialAttributes = await extractAttributes(categoryResult.category)
  logStep("runPipeline", `category=${categoryResult.category}, initialCompetitors=${initialCompetitors.length}, initialAttributes=${initialAttributes.length}`)

  const buyerQueries = await generateBuyerQueries(categoryResult.category, companyContext)
  const comparisonQueries = await generateComparisonQueries(companyName, initialCompetitors, categoryResult.category, companyContext)
  logStep("runPipeline", `buyerQueries=${buyerQueries.length}, comparisonQueries=${comparisonQueries.length}`)
  await persistStage("queries", {
    buyerQueries: buildInitialQueryRows(buyerQueries),
    comparisonQueries: buildInitialQueryRows(comparisonQueries),
  })

  const buyerEvidence = await collectAiResponses(
    categoryResult.category,
    companyName,
    initialCompetitors,
    initialAttributes,
    buyerQueries,
  )
  const comparisonEvidence = await collectAiResponses(
    categoryResult.category,
    companyName,
    initialCompetitors,
    initialAttributes,
    comparisonQueries,
  )
  logStep("runPipeline", `responses collected buyer=${buyerEvidence.length}, comparison=${comparisonEvidence.length}`)
  await persistStage("responses", {
    buyerQueries: buyerEvidence.map((item) => ({
      query: item.query,
      querySlug: item.querySlug,
      brandMentioned: item.targetMentioned,
      responseExcerpt: item.responseExcerpt,
      brandVisibility: [],
      attributeMentions: [],
      relatedQueries: [],
      relatedGuides: [],
    })),
    comparisonQueries: comparisonEvidence.map((item) => ({
      query: item.query,
      querySlug: item.querySlug,
      brandMentioned: item.targetMentioned,
      responseExcerpt: item.responseExcerpt,
      brandVisibility: [],
      attributeMentions: [],
      relatedQueries: [],
      relatedGuides: [],
    })),
  })

  const allEvidence = [...buyerEvidence, ...comparisonEvidence]
  const allResponseTexts = allEvidence.map((item) => item.response).filter((item) => item.trim().length > 0)
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
  await persistStage("responseSamples", {
    aiResponseSamples,
  })

  const responseDerivedCompetitors = extractBrandMentionsFromResponses(allResponseTexts, companyName, initialCompetitors)
  const responseDerivedAttributes = await extractAttributesFromResponses(categoryResult.category, allResponseTexts)
  let attributes = uniqueByNormalized(responseDerivedAttributes.map(normalizeAttributeLabel).filter(Boolean)).slice(0, 6)

  if (attributes.length < 4) {
    const merged = uniqueByNormalized([
      ...attributes,
      ...initialAttributes.map(normalizeAttributeLabel).filter(Boolean),
      ...defaultTableAttributes(),
    ])
    attributes = merged.slice(0, Math.max(4, Math.min(6, merged.length)))
  }

  if (attributes.length < 4) {
    attributes = defaultTableAttributes()
  }

  const mergedCompetitors = uniqueByNormalized([
    ...responseDerivedCompetitors,
    ...initialCompetitors.map(normalizeBrandName),
  ])
    .filter((brand) => normalizeForMatch(brand) !== normalizeForMatch(companyName))
    .filter((brand) => !isInvalidBrandToken(brand))
    .slice(0, 3)

  const finalizedCompetitors =
    initialCompetitors.length >= 3
      ? mergedCompetitors
      : uniqueByNormalized([
          ...responseDerivedCompetitors,
          ...mergedCompetitors,
          ...initialCompetitors.map(normalizeBrandName),
        ])
          .filter((brand) => normalizeForMatch(brand) !== normalizeForMatch(companyName))
          .filter((brand) => !isInvalidBrandToken(brand))
          .slice(0, 3)

  logStep("runPipeline", `selected competitors=${finalizedCompetitors.join(", ") || "none"}, attributes=${attributes.join(", ")}`)

  const targetBuyerMentions = buyerEvidence.filter((item) => item.targetMentioned).length
  const targetComparisonMentions = comparisonEvidence.filter((item) => item.targetMentioned).length

  const targetAttributes = await detectAttributeAssociations("__target__", attributes, allEvidence)
  const competitorAttributes = await Promise.all(
    finalizedCompetitors.map(async (brand) => ({
      brand,
      attributes: await detectAttributeAssociations(brand, attributes, allEvidence),
    })),
  )

  const competitorVisibility: CompetitorVisibilityItem[] = [companyName, ...finalizedCompetitors].map((brand) => {
    const mentions = allEvidence.filter((item) =>
      brand === companyName ? item.targetMentioned : isBrandMentionedInEvidence(item, brand),
    ).length

    return {
      brand,
      mentions,
      totalQueries: allEvidence.length,
      visibilityPercent: toPercentage(mentions, allEvidence.length),
    }
  })

  const targetAllMentions = allEvidence.filter((item) => item.targetMentioned).length
  const queryPresence = toPercentage(targetAllMentions, allEvidence.length)
  const attributeStrength = Math.round(averagePercent(targetAttributes.map((row) => row.associationPercent)))

  const targetVisibilityPercent = competitorVisibility.find((row) => row.brand === companyName)?.visibilityPercent || 0
  const topCompetitorVisibility = finalizedCompetitors.length
    ? Math.max(
        ...competitorVisibility
          .filter((row) => row.brand !== companyName)
          .map((row) => row.visibilityPercent),
      )
    : 0
  const competitiveParity = finalizedCompetitors.length
    ? clampToPercent(50 + (targetVisibilityPercent - topCompetitorVisibility))
    : 50

  let visibilityScore = Math.round(
    0.45 * queryPresence +
      0.35 * attributeStrength +
      0.2 * competitiveParity,
  )

  if (allEvidence.length < 8) {
    visibilityScore = Math.round(visibilityScore * 0.85)
  }

  visibilityScore = clampToPercent(visibilityScore)
  await persistStage("attributes-and-visibility", {
    competitors: finalizedCompetitors,
    attributes,
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
    visibilityScore,
  })

  let insightsResponse: { insights?: string[] } | string[] = []
  let opportunitiesResponse: { opportunities?: string[] } | string[] = []
  let recommendationsResponse: { recommendations?: string[] } | string[] = []

  try {
    insightsResponse = await generateJson<{ insights?: string[] } | string[]>([
      { role: "system", content: INSIGHT_GENERATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildInsightGenerationUserPrompt(companyName, finalizedCompetitors, buyerEvidence, comparisonEvidence),
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
          `Strengthen comparison-page narratives versus ${finalizedCompetitors[0] || "top alternatives"} to improve assistant recall.`,
          `Expand citation-ready pages around ${attributes[0] || "core use cases"} and ${attributes[1] || "buyer criteria"}.`,
        ]

  const safeRecommendations =
    recommendations.length > 0
      ? recommendations
      : [
          `Publish dedicated comparison pages targeting queries such as \"${companyName} vs ${finalizedCompetitors[0] || "alternative"}\".`,
          `Tighten category positioning statements across homepage, docs, and product pages for consistent AI retrieval.`,
          `Build citation-focused proof pages with benchmarks, integrations, and pricing clarity for assistant grounding.`,
        ]
  await persistStage("insights", {
    insights: safeInsights,
    opportunities: safeOpportunities,
    recommendations: safeRecommendations,
  })

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
    competitors: finalizedCompetitors,
    attributes,
    buyerQueries: buyerEvidence.map((item) => ({
      query: item.query,
      querySlug: item.querySlug,
      brandMentioned: item.targetMentioned,
      responseExcerpt: item.responseExcerpt,
      brandVisibility: buildQueryVisibilitySnapshot(item, companyName, finalizedCompetitors),
      attributeMentions: buildQueryAttributeSnapshot(item, attributes),
      relatedQueries: buildRelatedQueryLinks([...buyerEvidence, ...comparisonEvidence], item.querySlug),
      relatedGuides,
    })),
    comparisonQueries: comparisonEvidence.map((item) => ({
      query: item.query,
      querySlug: item.querySlug,
      brandMentioned: item.targetMentioned,
      responseExcerpt: item.responseExcerpt,
      brandVisibility: buildQueryVisibilitySnapshot(item, companyName, finalizedCompetitors),
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
    perceptionTable: buildPerceptionTable(companyName, finalizedCompetitors, targetAttributes, competitorAttributes),
  }
}

async function persistPipelineStage(reportId: string, data: Prisma.AiVisibilityReportUpdateInput) {
  await prisma.aiVisibilityReport.update({
    where: { id: reportId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })
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
      const output = await runPipeline(input.domain, input.companySlug, async (stage, data) => {
        await persistPipelineStage(input.reportId, data)
        logStep("persistPipelineStage", `${stage} saved for ${input.companySlug}`)
      })
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
