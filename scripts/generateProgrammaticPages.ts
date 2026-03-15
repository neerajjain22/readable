import { Prisma, PrismaClient } from "@prisma/client"
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { generateSectionContent, type EntitySpecificityHints } from "../lib/llm.ts"
import { generateText } from "../lib/services/llm.ts"
import { TOP_AI_QUESTIONS_SYSTEM_PROMPT, buildTopAiQuestionsUserPrompt } from "../lib/ai/prompts/topAiQuestions.ts"
import { generateSlug } from "../lib/programmatic/generateSlug.ts"
import { generateTitle } from "../lib/programmatic/generateContent.ts"
import {
  buildSpecificityMetadata,
  getDeterministicEntitySpecificity,
  getUserDefinedEntitySpecificity,
  mergeEntitySpecificityProfiles,
  type PartialEntitySpecificity,
} from "../lib/programmatic/entitySpecificity.ts"
import { splitGuideSections } from "../lib/internalLinks/index.ts"
import { injectInternalLinks } from "../lib/internalLinks/injectInternalLinks.ts"
import { registerInternalLinkTarget } from "./registerInternalLinkTarget.ts"

const prisma = new PrismaClient()

const MAX_PAGES_PER_RUN = 20
const MAX_RETRIES_PER_SECTION = 3
const MAX_RETRIES_PER_SUMMARY = 3
const MAX_RETRIES_PER_WIDGET_SECTION = 2
const MIN_INTERNAL_LINKS = 3
const MIN_EXTERNAL_LINKS = 3
const EXTERNAL_LINK_TIMEOUT_MS = 8000
const SECTION_CHECKPOINT_VERSION = 1
const SECTION_CHECKPOINT_DIR = path.join(process.cwd(), ".cache", "programmatic-section-checkpoints")

type TemplateWithSections = {
  id: string
  name: string
  slugPattern: string
  contentTemplate: string
  sections: unknown
}

type EntityType = "cms" | "business_category"
type CalloutCta = "analyze" | "demo"

type GeneratorEntity = {
  id: string
  name: string
  slug: string
  type: string
  metadata?: unknown
}

type PromptEntity = {
  name: string
  slug: string
  metadata?: Record<string, unknown> | null
}

type WidgetId =
  | "AiCitationDistributionWidget"
  | "AiQueryDistributionWidget"
  | "AiContentPreferenceWidget"
  | "AiBuyerJourneyWidget"
  | "AiQuestionFrequencyWidget"
  | "AiQuestionRevealWidget"

type WidgetSelection = {
  selectedWidgets: WidgetId[]
}

type ResumeOptions = {
  enabled: boolean
  slug: string
  templateId: string
}

type SectionCheckpoint = {
  version: number
  slug: string
  templateId: string
  sectionTitles: string[]
  blocks: string[]
  updatedAt: string
}

const AEO_WIDGET_POOL: WidgetId[] = [
  "AiCitationDistributionWidget",
  "AiQueryDistributionWidget",
  "AiContentPreferenceWidget",
  "AiBuyerJourneyWidget",
  "AiQuestionFrequencyWidget",
]

function getArgValue(flag: string) {
  const arg = process.argv.find((entry) => entry.startsWith(`${flag}=`))
  if (!arg) {
    return undefined
  }

  const value = arg.slice(flag.length + 1).trim()
  return value.length > 0 ? value : undefined
}

function getSectionCheckpointPath(slug: string) {
  return path.join(SECTION_CHECKPOINT_DIR, `${slug}.json`)
}

async function clearSectionCheckpoint(slug: string) {
  try {
    await unlink(getSectionCheckpointPath(slug))
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
      throw error
    }
  }
}

function hasMatchingSections(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false
  }

  return a.every((item, index) => item === b[index])
}

async function readSectionCheckpoint(options: ResumeOptions | undefined, sectionTitles: string[]) {
  if (!options?.enabled) {
    return []
  }

  try {
    const raw = await readFile(getSectionCheckpointPath(options.slug), "utf8")
    const parsed = JSON.parse(raw) as Partial<SectionCheckpoint>

    if (
      parsed.version !== SECTION_CHECKPOINT_VERSION ||
      parsed.slug !== options.slug ||
      parsed.templateId !== options.templateId ||
      !Array.isArray(parsed.sectionTitles) ||
      !Array.isArray(parsed.blocks)
    ) {
      return []
    }

    const checkpointSectionTitles = parsed.sectionTitles
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
    if (!hasMatchingSections(checkpointSectionTitles, sectionTitles)) {
      return []
    }

    const rawBlocks = parsed.blocks
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .slice(0, sectionTitles.length)

    const blocks: string[] = []
    for (let index = 0; index < rawBlocks.length; index += 1) {
      const expectedPrefix = `## ${sectionTitles[index]}\n\n`
      if (!rawBlocks[index].startsWith(expectedPrefix)) {
        break
      }

      blocks.push(rawBlocks[index])
    }

    return blocks
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return []
    }

    throw error
  }
}

async function writeSectionCheckpoint(
  options: ResumeOptions | undefined,
  sectionTitles: string[],
  blocks: string[],
) {
  if (!options?.enabled) {
    return
  }

  await mkdir(SECTION_CHECKPOINT_DIR, { recursive: true })
  const payload: SectionCheckpoint = {
    version: SECTION_CHECKPOINT_VERSION,
    slug: options.slug,
    templateId: options.templateId,
    sectionTitles,
    blocks,
    updatedAt: new Date().toISOString(),
  }
  await writeFile(getSectionCheckpointPath(options.slug), JSON.stringify(payload), "utf8")
}

function getArticleSummary(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220)
}

function extractMarkdownLinks(content: string) {
  const links: Array<{ label: string; href: string }> = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match = regex.exec(content)
  while (match) {
    links.push({
      label: match[1].trim(),
      href: match[2].trim(),
    })
    match = regex.exec(content)
  }

  return links
}

function countInternalLinks(content: string) {
  const links = extractMarkdownLinks(content)
  return links.filter((link) => link.href.startsWith("/")).length
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

function parseJsonObject(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```/, "").replace(/```$/, "").trim()
  const objectStart = cleaned.indexOf("{")
  const arrayStart = cleaned.indexOf("[")
  const start =
    objectStart === -1 ? arrayStart : arrayStart === -1 ? objectStart : Math.min(objectStart, arrayStart)
  if (start === -1) {
    return cleaned
  }

  return cleaned.slice(start)
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim().replace(/\s+/g, " ")
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const result: string[] = []

  for (const item of value) {
    const normalized = normalizeString(item)
    if (!normalized) {
      continue
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(normalized)
  }

  return result
}

function createSeededRandom(seed: string) {
  let state = 0
  for (let index = 0; index < seed.length; index += 1) {
    state = (state * 31 + seed.charCodeAt(index)) >>> 0
  }

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function pickWidgetCount(poolSize: number, random: () => number) {
  const target = random() < 0.5 ? 2 : 3
  return Math.max(1, Math.min(poolSize, target))
}

function pickWidgetsFromPool(pool: WidgetId[], random: () => number) {
  if (pool.length === 0) {
    return [] as WidgetId[]
  }

  const shuffled = [...pool]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled.slice(0, pickWidgetCount(pool.length, random))
}

function pickFixedCountFromPool(pool: WidgetId[], count: number, random: () => number) {
  if (pool.length === 0 || count <= 0) {
    return [] as WidgetId[]
  }

  const shuffled = [...pool]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function pickWidgetsForAeoGuide(random: () => number): WidgetId[] {
  const nonRevealCount = random() < 0.5 ? 1 : 2
  const nonRevealSelection = pickFixedCountFromPool(AEO_WIDGET_POOL, nonRevealCount, random)
  return ["AiQuestionRevealWidget", ...nonRevealSelection] as WidgetId[]
}

function normalizeDistribution(values: number[]) {
  const positive = values.map((value) => Math.max(1, Math.round(value)))
  const total = positive.reduce((sum, value) => sum + value, 0) || 1
  const scaled = positive.map((value) => Math.round((value / total) * 100))
  const scaledTotal = scaled.reduce((sum, value) => sum + value, 0)
  const delta = 100 - scaledTotal
  if (delta !== 0 && scaled.length > 0) {
    scaled[0] += delta
  }
  return scaled
}

function buildDistribution(count: number, random: () => number) {
  const raw = Array.from({ length: count }, () => 20 + random() * 80)
  return normalizeDistribution(raw)
}

function buildFallbackTopAiQuestions(entityName: string) {
  return [
    `What is the best ${entityName} platform?`,
    `How do ${entityName} platforms work?`,
    `${entityName} vs alternatives: what should buyers compare?`,
    `What APIs do ${entityName} platforms provide?`,
    `Which ${entityName} platforms support fintech integrations?`,
  ]
}

function normalizeTopAiQuestions(raw: unknown, entityName: string) {
  let candidateQuestions: unknown = []

  if (Array.isArray(raw)) {
    candidateQuestions = raw
  } else if (raw && typeof raw === "object" && "questions" in raw) {
    candidateQuestions = (raw as { questions?: unknown }).questions
  }

  const normalized = normalizeStringArray(candidateQuestions).map((question) => {
    return question.replace(/\s+/g, " ").trim()
  })

  const merged = [...normalized]
  for (const fallback of buildFallbackTopAiQuestions(entityName)) {
    if (merged.length >= 5) {
      break
    }

    if (!merged.some((item) => item.toLowerCase() === fallback.toLowerCase())) {
      merged.push(fallback)
    }
  }

  return merged.slice(0, 5)
}

async function generateTopAiQuestions(
  entityName: string,
  guideTopic: string,
  specificity: EntitySpecificityHints,
) {
  try {
    const response = await generateText(
      [
        {
          role: "system",
          content: TOP_AI_QUESTIONS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildTopAiQuestionsUserPrompt({
            entityName,
            guideTopic,
            specificNouns: specificity.specificNouns,
          }),
        },
      ],
      { model: "haiku", temperature: 0.2, maxTokens: 900 },
    )

    const parsed = JSON.parse(parseJsonObject(response)) as unknown
    return normalizeTopAiQuestions(parsed, entityName)
  } catch {
    return buildFallbackTopAiQuestions(entityName)
  }
}

async function validateExternalUrl(url: string) {
  if (!isHttpUrl(url)) {
    return false
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_LINK_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "ReadableGuideLinkValidator/1.0",
      },
    })

    if (response.status === 404 || response.status >= 500) {
      return false
    }

    return response.status < 400
  } catch {
    return false
  } finally {
    clearTimeout(timeoutId)
  }
}

function appendReadMoreSection(content: string, links: Array<{ title: string; href: string }>) {
  if (links.length === 0) {
    return content
  }

  const sectionLines = [
    "## Read more",
    ...links.map((item) => `- [${item.title}](${item.href})`),
  ]

  return `${content.trim()}\n\n${sectionLines.join("\n")}`.trim()
}

function appendSourcesSection(content: string, sources: Array<{ title: string; url: string }>) {
  if (sources.length === 0) {
    return content
  }

  const sectionLines = [
    "## Sources",
    ...sources.map((item) => `- [${item.title}](${item.url})`),
  ]

  return `${content.trim()}\n\n${sectionLines.join("\n")}`.trim()
}

function normalizeGuideTypography(content: string) {
  // Hard guard: never keep em dashes in generated guides.
  return content.replace(/—/g, ", ")
}

function getWidgetPoolForTemplate(template: TemplateWithSections) {
  if (isAeoTemplate(template)) {
    return AEO_WIDGET_POOL
  }

  return [] as WidgetId[]
}

function injectInlineExternalLinks(
  content: string,
  sources: Array<{ title: string; url: string }>,
  maxInlineLinks = 3,
) {
  if (!sources.length || maxInlineLinks <= 0) {
    return content
  }

  const existingUrls = new Set(
    extractMarkdownLinks(content)
      .map((link) => link.href.trim())
      .filter((href) => isHttpUrl(href)),
  )

  const sections = splitGuideSections(content)
  if (sections.length === 0) {
    return content
  }

  const rebuilt: string[] = []
  let sourceIndex = 0
  let inserted = 0

  for (const section of sections) {
    let sectionBody = section.body.trim()
    const isEligibleSection = !["faq", "summary"].includes(section.heading.trim().toLowerCase())

    if (isEligibleSection && inserted < maxInlineLinks) {
      while (sourceIndex < sources.length && inserted < maxInlineLinks) {
        const source = sources[sourceIndex]
        sourceIndex += 1

        if (existingUrls.has(source.url)) {
          continue
        }

        const paragraphs = splitParagraphs(sectionBody)
        if (paragraphs.length === 0) {
          continue
        }

        const readMoreLine = `Read more: [${source.title}](${source.url}).`
        paragraphs[0] = `${paragraphs[0]} ${readMoreLine}`.trim()
        sectionBody = paragraphs.join("\n\n")
        existingUrls.add(source.url)
        inserted += 1
        break
      }
    }

    rebuilt.push(`## ${section.heading}\n\n${sectionBody}`.trim())
  }

  return rebuilt.join("\n\n").trim()
}

async function ensureMinimumInternalLinks(content: string, currentSlug: string) {
  const currentInternalCount = countInternalLinks(content)
  if (currentInternalCount >= MIN_INTERNAL_LINKS) {
    return content
  }

  const existingInternalLinks = new Set(
    extractMarkdownLinks(content)
      .map((link) => link.href)
      .filter((href) => href.startsWith("/")),
  )

  const candidates = await prisma.generatedPage.findMany({
    where: {
      slug: {
        not: currentSlug,
      },
      status: "published",
    },
    select: {
      slug: true,
      title: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
  })

  const needed = MIN_INTERNAL_LINKS - currentInternalCount
  const selected = candidates
    .map((item) => ({
      title: item.title,
      href: `/guides/${item.slug}`,
    }))
    .filter((item) => !existingInternalLinks.has(item.href))
    .slice(0, needed)

  const updated = appendReadMoreSection(content, selected)
  if (countInternalLinks(updated) < MIN_INTERNAL_LINKS) {
    throw new Error(`Failed internal link minimum for ${currentSlug}. Required ${MIN_INTERNAL_LINKS}.`)
  }

  return updated
}

async function generateValidatedExternalSources(
  title: string,
  summary: string,
  entityName: string,
  topic: string,
) {
  const fallbackSources = [
    {
      title: "Google Search: Creating helpful content",
      url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    },
    {
      title: "Google Search: Overview of Google crawlers",
      url: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers",
    },
    {
      title: "Schema.org Getting Started",
      url: "https://schema.org/docs/gs.html",
    },
  ]

  let llmSources: Array<{ title: string; url: string }> = []

  try {
    const prompt = `Generate 6 credible external source links for this guide.

Guide title: ${title}
Entity: ${entityName}
Topic: ${topic}
Summary: ${summary}

Rules:
- Return JSON only with this shape: {"sources":[{"title":"","url":""}]}
- Sources must be real and publicly accessible URLs
- Prefer official docs, standards bodies, or trusted industry publications
- No homepage-only links unless unavoidable
- No fictional or guessed URLs`

    const response = await generateText(
      [{ role: "user", content: prompt }],
      { model: "haiku", temperature: 0.1 },
    )
    const parsedRaw = JSON.parse(parseJsonObject(response)) as { sources?: Array<{ title?: string; url?: string }> }
    llmSources = (parsedRaw.sources || [])
      .map((item) => ({
        title: String(item.title || "").trim(),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.title.length > 0 && item.url.length > 0)
  } catch {
    llmSources = []
  }

  const combined = [...llmSources, ...fallbackSources]
  const seen = new Set<string>()
  const validated: Array<{ title: string; url: string }> = []

  for (const source of combined) {
    const normalized = source.url.trim()
    if (!normalized || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)

    const isValid = await validateExternalUrl(normalized)
    if (!isValid) {
      continue
    }

    validated.push({
      title: source.title,
      url: normalized,
    })

    if (validated.length >= MIN_EXTERNAL_LINKS) {
      break
    }
  }

  if (validated.length < MIN_EXTERNAL_LINKS) {
    throw new Error(`Failed external link minimum for ${entityName}. Required ${MIN_EXTERNAL_LINKS}.`)
  }

  return validated
}

async function suggestSpecificityWithLlm(
  entity: GeneratorEntity,
  topic: string,
): Promise<PartialEntitySpecificity | null> {
  const prompt = `Suggest concrete language that makes this audience/entity more specific in expert SEO writing.

Entity name: ${entity.name}
Entity slug: ${entity.slug}
Entity type: ${entity.type}
Guide topic: ${topic}

Return strict JSON only with this shape:
{
  "preferredLabel": "",
  "specificNouns": ["", ""],
  "avoidGenericNouns": ["", ""]
}

Rules:
- preferredLabel must be concise and specific
- specificNouns must be concrete role/audience nouns, 3-6 items
- avoidGenericNouns should include overly broad labels to avoid
- No markdown, no commentary`

  try {
    const response = await generateText(
      [{ role: "user", content: prompt }],
      { model: "haiku", temperature: 0.2 },
    )
    const parsedRaw = JSON.parse(parseJsonObject(response)) as {
      preferredLabel?: unknown
      specificNouns?: unknown
      avoidGenericNouns?: unknown
    }

    return {
      preferredLabel: normalizeString(parsedRaw.preferredLabel) || undefined,
      specificNouns: normalizeStringArray(parsedRaw.specificNouns),
      avoidGenericNouns: normalizeStringArray(parsedRaw.avoidGenericNouns),
    }
  } catch {
    return null
  }
}

function normalizeTemplateSections(template: TemplateWithSections): string[] {
  if (Array.isArray(template.sections)) {
    const sectionList = template.sections.filter((value): value is string => typeof value === "string")
    if (sectionList.length > 0) {
      return sectionList
    }
  }

  const staticSections = template.contentTemplate
    .split("## ")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.split("\n")[0]?.trim())
    .filter((value): value is string => Boolean(value))

  if (staticSections.length > 0) {
    return staticSections
  }

  throw new Error("Template has no sections to generate")
}

function shouldInsertCalloutForHeading(heading: string) {
  const normalized = heading.trim().toLowerCase()
  return normalized !== "introduction" && normalized !== "faq" && normalized !== "summary"
}

function normalizeForComparison(input: string) {
  return input
    .toLowerCase()
    .replace(/[`*_#[\]()>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function splitParagraphs(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
}

const GENERIC_SECTION_PHRASES = [
  "in today's digital landscape",
  "as technology continues to evolve",
  "in the modern business world",
  "it is important to note",
  "in conclusion",
]

function hasPracticalMarker(content: string) {
  return (
    /\b(for example|for instance|e\.g\.|example:|in practice|recommend|should|steps?|checklist)\b/i.test(content) ||
    /\bif\b[\s\S]{0,80}\bthen\b/i.test(content)
  )
}

function hasDecisionRuleMarker(content: string) {
  return (
    /\bif\b[\s\S]{0,100}\b(prioritize|choose|select|avoid|then)\b/i.test(content) ||
    /\bwhen\b[\s\S]{0,100}\b(prioritize|choose|select|avoid)\b/i.test(content)
  )
}

function hasInformationGainMarker(content: string) {
  return /\b(non-obvious|tradeoff|common mistake|pitfall|in practice|counterintuitive)\b/i.test(content)
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function hasSpecificNounMention(content: string, specificity?: EntitySpecificityHints) {
  const specificNouns = specificity?.specificNouns || []
  if (specificNouns.length === 0) {
    return true
  }

  const normalized = content.toLowerCase()
  return specificNouns.some((noun) => normalized.includes(noun.toLowerCase()))
}

function hasGenericNounOveruse(content: string, specificity?: EntitySpecificityHints) {
  const avoided = specificity?.avoidGenericNouns || []
  if (avoided.length === 0) {
    return false
  }

  let totalMatches = 0
  for (const phrase of avoided) {
    const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, "gi")
    totalMatches += content.match(regex)?.length || 0
  }

  return totalMatches >= 3
}

function needsQualityRetry(content: string, specificity?: EntitySpecificityHints) {
  const normalized = normalizeForComparison(content)
  if (!normalized) {
    return true
  }

  const hasGenericBoilerplate = GENERIC_SECTION_PHRASES.some((phrase) => normalized.includes(phrase))
  if (hasGenericBoilerplate) {
    return true
  }

  if (!hasPracticalMarker(content)) {
    return true
  }

  if (!hasDecisionRuleMarker(content)) {
    return true
  }

  if (!hasInformationGainMarker(content)) {
    return true
  }

  if (!hasSpecificNounMention(content, specificity)) {
    return true
  }

  if (hasGenericNounOveruse(content, specificity) && !hasSpecificNounMention(content, specificity)) {
    return true
  }

  return false
}

function isInvalidInsightSummary(summary: string) {
  const normalized = summary.toLowerCase().trim()
  if (!normalized) {
    return true
  }

  return (
    normalized.includes("i don't see a paragraph") ||
    normalized.includes("i do not see a paragraph") ||
    normalized.includes("could you please share the paragraph") ||
    normalized.includes("once you do, i'll help identify") ||
    normalized.includes("once you do, i will help identify")
  )
}

function getSubstantiveParagraph(content: string, heading: string) {
  const paragraphs = splitParagraphs(content)
  const normalizedHeading = normalizeForComparison(heading)

  for (const paragraph of paragraphs) {
    const normalizedParagraph = normalizeForComparison(paragraph)
    if (!normalizedParagraph) {
      continue
    }

    if (normalizedParagraph === normalizedHeading) {
      continue
    }

    const wordCount = normalizedParagraph.split(" ").filter(Boolean).length
    if (wordCount < 8) {
      continue
    }

    return paragraph
  }

  return ""
}

function stripExistingCallouts(content: string) {
  return content.replace(/<CalloutBox[\s\S]*?\/>\s*/g, "").trim()
}

function escapeMdxAttributeValue(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function decodeMdxAttributeValue(input: string) {
  return input
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
}

function buildWidgetSelectionMetadataComment(selection: WidgetSelection) {
  return `{/* readable-widget-pool:${JSON.stringify(selection)} */}`
}

function isWidgetId(value: unknown): value is WidgetId {
  return (
    value === "AiCitationDistributionWidget" ||
    value === "AiQueryDistributionWidget" ||
    value === "AiContentPreferenceWidget" ||
    value === "AiBuyerJourneyWidget" ||
    value === "AiQuestionFrequencyWidget" ||
    value === "AiQuestionRevealWidget"
  )
}

function parseWidgetSelectionFromContent(content: string) {
  const jsxMatch = content.match(/\{\/\*\s*readable-widget-pool:([\s\S]*?)\*\/\}/)
  const htmlMatch = content.match(/<!--\s*readable-widget-pool:([\s\S]*?)-->/)
  const raw = jsxMatch?.[1] || htmlMatch?.[1]
  if (!raw) {
    return [] as WidgetId[]
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WidgetSelection>
    if (!Array.isArray(parsed.selectedWidgets)) {
      return [] as WidgetId[]
    }

    const deduped: WidgetId[] = []
    for (const widgetId of parsed.selectedWidgets) {
      if (!isWidgetId(widgetId)) {
        continue
      }
      if (!deduped.includes(widgetId)) {
        deduped.push(widgetId)
      }
    }
    return deduped
  } catch {
    return [] as WidgetId[]
  }
}

function normalizeAeoWidgetSelection(selectedWidgets: WidgetId[]): WidgetId[] {
  const nonReveal = selectedWidgets.filter((widgetId) => widgetId !== "AiQuestionRevealWidget" && AEO_WIDGET_POOL.includes(widgetId))
  const uniqueNonReveal = Array.from(new Set(nonReveal)).slice(0, 2) as WidgetId[]
  return ["AiQuestionRevealWidget", ...uniqueNonReveal] as WidgetId[]
}

function buildAiCitationDistributionData(seedKey: string) {
  const random = createSeededRandom(`${seedKey}:citation`)
  const [documentation, comparison, blog, product, forums] = buildDistribution(5, random)
  return { documentation, comparison, blog, product, forums }
}

function buildAiQueryLabelsForEntity(entityName: string) {
  const normalizedEntity = normalizeString(entityName) || "this market"
  return [
    `Best ${normalizedEntity} options`,
    `${normalizedEntity} comparisons`,
    `${normalizedEntity} integration questions`,
    `How ${normalizedEntity} works`,
    `${normalizedEntity} pricing questions`,
  ]
}

function buildAiQueryDistributionData(seedKey: string, entityName: string) {
  const random = createSeededRandom(`${seedKey}:query`)
  const [bestPlatform, comparisons, integrations, howItWorks, pricing] = buildDistribution(5, random)
  const values = [bestPlatform, comparisons, integrations, howItWorks, pricing]
  const labels = buildAiQueryLabelsForEntity(entityName)
  return {
    entityName,
    rows: labels.map((label, index) => ({
      label,
      value: values[index] || 0,
    })),
    bestPlatform,
    comparisons,
    integrations,
    howItWorks,
    pricing,
  }
}

function buildAiContentPreferenceLabelsForEntity(entityName: string) {
  const normalizedEntity = normalizeString(entityName) || "this market"
  return [
    `${normalizedEntity} documentation`,
    `${normalizedEntity} comparison pages`,
    `${normalizedEntity} FAQ sections`,
    `${normalizedEntity} blog posts`,
    `${normalizedEntity} landing pages`,
  ]
}

function buildAiContentPreferenceData(seedKey: string, entityName: string) {
  const random = createSeededRandom(`${seedKey}:content`)
  const [documentation, comparisonPages, faqSections, blogPosts, landingPages] = buildDistribution(5, random)
  const values = [documentation, comparisonPages, faqSections, blogPosts, landingPages]
  const labels = buildAiContentPreferenceLabelsForEntity(entityName)
  return {
    entityName,
    rows: labels.map((label, index) => ({
      label,
      value: values[index] || 0,
    })),
    documentation,
    comparisonPages,
    faqSections,
    blogPosts,
    landingPages,
  }
}

function buildAiBuyerJourneyData(seedKey: string) {
  const random = createSeededRandom(`${seedKey}:journey`)
  const overview = 88 + Math.round(random() * 12)
  const compare = Math.max(45, overview - (8 + Math.round(random() * 16)))
  const integrations = Math.max(30, compare - (8 + Math.round(random() * 14)))
  const shortlist = Math.max(20, integrations - (6 + Math.round(random() * 12)))
  return { overview, compare, integrations, shortlist }
}

function buildAiQuestionFrequencyData(seedKey: string, questionCount: number) {
  const random = createSeededRandom(`${seedKey}:frequency`)
  const values = buildDistribution(Math.max(1, questionCount), random)
  return values.slice(0, questionCount).sort((a, b) => b - a)
}

function buildWidgetPromptContext(widgetId: WidgetId, entityName: string, topAiQuestions: string[], seedKey: string) {
  if (widgetId === "AiQuestionRevealWidget") {
    return JSON.stringify(
      {
        entityName,
        questions: topAiQuestions,
      },
      null,
      2,
    )
  }

  if (widgetId === "AiCitationDistributionWidget") {
    return JSON.stringify(buildAiCitationDistributionData(seedKey), null, 2)
  }

  if (widgetId === "AiQueryDistributionWidget") {
    return JSON.stringify(buildAiQueryDistributionData(seedKey, entityName), null, 2)
  }

  if (widgetId === "AiContentPreferenceWidget") {
    return JSON.stringify(buildAiContentPreferenceData(seedKey, entityName), null, 2)
  }

  if (widgetId === "AiBuyerJourneyWidget") {
    return JSON.stringify(buildAiBuyerJourneyData(seedKey), null, 2)
  }

  return JSON.stringify(
    {
      entityName,
      questions: topAiQuestions,
      frequencies: buildAiQuestionFrequencyData(seedKey, topAiQuestions.length),
    },
    null,
    2,
  )
}

function buildWidgetTag(widgetId: WidgetId, entityName: string, topAiQuestions: string[], seedKey: string) {
  if (widgetId === "AiQuestionRevealWidget") {
    const questionsJson = JSON.stringify(topAiQuestions)
    return `<AiQuestionRevealWidget entityName="${escapeMdxAttributeValue(entityName)}" questionsJson="${escapeMdxAttributeValue(questionsJson)}" />`
  }

  if (widgetId === "AiCitationDistributionWidget") {
    const dataJson = JSON.stringify(buildAiCitationDistributionData(seedKey))
    return `<AiCitationDistributionWidget dataJson="${escapeMdxAttributeValue(dataJson)}" />`
  }

  if (widgetId === "AiQueryDistributionWidget") {
    const dataJson = JSON.stringify(buildAiQueryDistributionData(seedKey, entityName))
    return `<AiQueryDistributionWidget dataJson="${escapeMdxAttributeValue(dataJson)}" />`
  }

  if (widgetId === "AiContentPreferenceWidget") {
    const dataJson = JSON.stringify(buildAiContentPreferenceData(seedKey, entityName))
    return `<AiContentPreferenceWidget dataJson="${escapeMdxAttributeValue(dataJson)}" />`
  }

  if (widgetId === "AiBuyerJourneyWidget") {
    const dataJson = JSON.stringify(buildAiBuyerJourneyData(seedKey))
    return `<AiBuyerJourneyWidget dataJson="${escapeMdxAttributeValue(dataJson)}" />`
  }

  const questionsJson = JSON.stringify(topAiQuestions)
  const frequenciesJson = JSON.stringify(buildAiQuestionFrequencyData(seedKey, topAiQuestions.length))
  return `<AiQuestionFrequencyWidget questionsJson="${escapeMdxAttributeValue(questionsJson)}" frequenciesJson="${escapeMdxAttributeValue(frequenciesJson)}" />`
}

function buildAiQueryDistributionWidgetTag(entityName: string, seedKey: string) {
  const dataJson = JSON.stringify(buildAiQueryDistributionData(seedKey, entityName))
  return `<AiQueryDistributionWidget dataJson="${escapeMdxAttributeValue(dataJson)}" />`
}

function replaceAiQueryDistributionWidgetTag(content: string, entityName: string, seedKey: string) {
  if (!content.includes("<AiQueryDistributionWidget")) {
    return content
  }

  const replacementTag = buildAiQueryDistributionWidgetTag(entityName, seedKey)
  return content.replace(/<AiQueryDistributionWidget\b[\s\S]*?\/>/g, replacementTag)
}

function buildAiContentPreferenceWidgetTag(entityName: string, seedKey: string) {
  const dataJson = JSON.stringify(buildAiContentPreferenceData(seedKey, entityName))
  return `<AiContentPreferenceWidget dataJson="${escapeMdxAttributeValue(dataJson)}" />`
}

function replaceAiContentPreferenceWidgetTag(content: string, entityName: string, seedKey: string) {
  if (!content.includes("<AiContentPreferenceWidget")) {
    return content
  }

  const replacementTag = buildAiContentPreferenceWidgetTag(entityName, seedKey)
  return content.replace(/<AiContentPreferenceWidget\b[\s\S]*?\/>/g, replacementTag)
}

function stripExistingWidgetPoolTags(content: string) {
  const withoutMetadata = content
    .replace(/<!--\s*readable-widget-pool:[\s\S]*?-->\s*/g, "")
    .replace(/\{\/\*\s*readable-widget-pool:[\s\S]*?\*\/\}\s*/g, "")

  const sections = splitGuideSections(withoutMetadata)
  if (sections.length === 0) {
    return withoutMetadata
      .replace(
        /<(AiCitationDistributionWidget|AiQueryDistributionWidget|AiContentPreferenceWidget|AiBuyerJourneyWidget|AiQuestionFrequencyWidget|AiQuestionRevealWidget)\b[\s\S]*?\/>\s*/g,
        "",
      )
      .replace(/\{\/\*\s*readable-widget-section:[\s\S]*?\*\/\}\s*/g, "")
      .trim()
  }

  return sections
    .map((section) => {
      if (section.body.includes("readable-widget-section:")) {
        return ""
      }

      const cleanedBody = section.body
        .replace(/\{\/\*\s*readable-widget-section:[\s\S]*?\*\/\}\s*/g, "")
        .replace(
          /<(AiCitationDistributionWidget|AiQueryDistributionWidget|AiContentPreferenceWidget|AiBuyerJourneyWidget|AiQuestionFrequencyWidget|AiQuestionRevealWidget)\b[\s\S]*?\/>\s*/g,
          "",
        )
        .trim()
      return `## ${section.heading}\n\n${cleanedBody}`.trim()
    })
    .filter(Boolean)
    .join("\n\n")
    .trim()
}

function extractTopQuestionsFromContent(content: string) {
  const match = content.match(/questionsJson=\"([^\"]+)\"/)
  if (!match?.[1]) {
    return []
  }

  try {
    const decoded = decodeMdxAttributeValue(match[1])
    const parsed = JSON.parse(decoded) as unknown
    if (Array.isArray(parsed)) {
      return normalizeStringArray(parsed).slice(0, 5)
    }

    if (parsed && typeof parsed === "object" && "questions" in parsed) {
      return normalizeStringArray((parsed as { questions?: unknown }).questions).slice(0, 5)
    }

    return []
  } catch {
    return []
  }
}

function getWidgetDisplayName(widgetId: WidgetId) {
  if (widgetId === "AiQuestionRevealWidget") return "Top AI Questions Reveal"
  if (widgetId === "AiCitationDistributionWidget") return "AI Citation Distribution"
  if (widgetId === "AiQueryDistributionWidget") return "AI Query Distribution"
  if (widgetId === "AiContentPreferenceWidget") return "AI Content Preference"
  if (widgetId === "AiBuyerJourneyWidget") return "AI Buyer Journey"
  return "AI Question Frequency"
}

function getWidgetSectionFallbackTitle(widgetId: WidgetId, entityName: string) {
  if (widgetId === "AiQuestionRevealWidget") return `Top buyer questions AI gets about ${entityName}`
  if (widgetId === "AiCitationDistributionWidget") return `Where AI finds answers in ${entityName}`
  if (widgetId === "AiQueryDistributionWidget") return `How buyers frame ${entityName} questions in AI chat`
  if (widgetId === "AiContentPreferenceWidget") return `Content formats AI trusts for ${entityName}`
  if (widgetId === "AiBuyerJourneyWidget") return `How AI influences the ${entityName} buyer journey`
  return `Most frequent AI prompts in ${entityName} research`
}

function getWidgetSectionFallbackDescription(widgetId: WidgetId, entityName: string, topAiQuestions: string[]) {
  const questionReference = topAiQuestions.slice(0, 2).join(" and ")
  const insight =
    widgetId === "AiQuestionRevealWidget"
      ? "What this means: buyer language drives AI recall and brand mention probability."
      : "What this means: focused content patterns increase retrieval confidence in assistant answers."
  const action = questionReference
    ? `Teams can learn where coverage is thin and improve pages for prompts like ${questionReference}.`
    : `Teams can learn where coverage is thin and strengthen pages buyers evaluate most.`

  return [
    `This widget summarizes how AI interprets ${entityName} research behavior by showing practical distribution signals teams can act on across content, questions, and evaluation stages.`,
    insight,
    action,
  ].join("\n\n")
}

function normalizeGeneratedWidgetSectionTitle(title: string, fallbackTitle: string) {
  const normalized = normalizeString(title).replace(/^#+\s*/, "").replace(/^"+|"+$/g, "")
  if (!normalized) {
    return fallbackTitle
  }
  return normalized.slice(0, 110)
}

function normalizeGeneratedWidgetSectionDescription(description: string, fallbackDescription: string) {
  const withoutHeadings = description
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s.+$/gm, "")
    .trim()

  if (!withoutHeadings) {
    return fallbackDescription
  }

  const paragraphs = withoutHeadings
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean)
  const candidate =
    paragraphs.length >= 2
      ? paragraphs.join("\n\n")
      : withoutHeadings
          .split(/(?<=[.?!])\s+/)
          .map((sentence) => sentence.trim())
          .filter(Boolean)
          .reduce<string[]>((acc, sentence, index) => {
            const bucket = Math.floor(index / 2)
            if (!acc[bucket]) {
              acc[bucket] = sentence
            } else {
              acc[bucket] = `${acc[bucket]} ${sentence}`.trim()
            }
            return acc
          }, [])
          .join("\n\n")

  const words = candidate.replace(/\n/g, " ").split(/\s+/).filter(Boolean).length
  if (words < 50 || words > 75) {
    return fallbackDescription
  }

  return candidate
}

async function generateWidgetSectionCopy(
  widgetId: WidgetId,
  entityName: string,
  topAiQuestions: string[],
  widgetContext: string,
) {
  const fallbackTitle = getWidgetSectionFallbackTitle(widgetId, entityName)
  const fallbackDescription = getWidgetSectionFallbackDescription(widgetId, entityName, topAiQuestions)
  const prompt = `Generate a section title and markdown description for an AI visibility guide widget.

Entity: ${entityName}
Widget: ${getWidgetDisplayName(widgetId)}
Widget data/context:
${widgetContext}

Requirements:
- Return strict JSON only: {"title":"","description":""}
- Title: 6-12 words, specific, clear, no quotes
- Description: 50-75 words total
- Description must be valid markdown with short paragraphs (2-3 small paragraphs)
- Explain what the widget is showing using the provided widget data/context
- Include one very short "what this means" insight (10-15 words max)
- Include what teams can learn/do from this insight
- Keep wording concrete and practical (no buzzwords)
- Do not use em dash
`

  for (let attempt = 1; attempt <= MAX_RETRIES_PER_WIDGET_SECTION; attempt += 1) {
    try {
      const raw = await generateText([{ role: "user", content: prompt }], {
        model: "haiku",
        temperature: 0.2,
        maxTokens: 800,
      })
      const parsed = JSON.parse(parseJsonObject(raw)) as { title?: unknown; description?: unknown }
      const title = normalizeGeneratedWidgetSectionTitle(String(parsed.title || ""), fallbackTitle)
      const description = normalizeGeneratedWidgetSectionDescription(String(parsed.description || ""), fallbackDescription)
      return { title, description }
    } catch (error) {
      if (attempt === MAX_RETRIES_PER_WIDGET_SECTION) {
        return { title: fallbackTitle, description: fallbackDescription }
      }
      await new Promise((resolve) => setTimeout(resolve, 350 * attempt))
    }
  }

  return { title: fallbackTitle, description: fallbackDescription }
}

async function injectWidgetPool(
  content: string,
  entityName: string,
  topAiQuestions: string[],
  selectedWidgets: WidgetId[],
  seedKey: string,
) {
  if (selectedWidgets.length === 0) {
    return content
  }

  const sections = splitGuideSections(content)
  if (sections.length === 0) {
    return content
  }

  const widgetSectionBlocks: string[] = []
  for (let index = 0; index < selectedWidgets.length; index += 1) {
    const widgetId = selectedWidgets[index]
    const slotSeedKey = `${seedKey}:slot-${index}`
    const widgetTag = buildWidgetTag(widgetId, entityName, topAiQuestions, slotSeedKey)
    const widgetContext = buildWidgetPromptContext(widgetId, entityName, topAiQuestions, slotSeedKey)
    const copy = await generateWidgetSectionCopy(widgetId, entityName, topAiQuestions, widgetContext)
    const sectionMarker = `{/* readable-widget-section:${widgetId} */}`
    widgetSectionBlocks.push(`## ${copy.title}\n\n${sectionMarker}\n\n${widgetTag}\n\n${copy.description}`.trim())
  }

  const baseSections = sections
    .map((section) => `## ${section.heading}\n\n${section.body.trim()}`)
    .filter(Boolean)

  const insertionIndex = Math.min(2, baseSections.length)
  const sectionContent = [
    ...baseSections.slice(0, insertionIndex),
    ...widgetSectionBlocks,
    ...baseSections.slice(insertionIndex),
  ]
    .join("\n\n")
    .trim()

  const metadataComment = buildWidgetSelectionMetadataComment({ selectedWidgets })
  return `${metadataComment}\n\n${sectionContent}`.trim()
}

function insertCallout(sectionContent: string, paragraphToAnchor: string, summary: string, cta: CalloutCta) {
  if (!paragraphToAnchor) {
    return sectionContent.trim()
  }

  const paragraphs = splitParagraphs(sectionContent)
  if (paragraphs.length === 0) {
    return sectionContent.trim()
  }

  const anchorIndex = paragraphs.findIndex(
    (paragraph) => normalizeForComparison(paragraph) === normalizeForComparison(paragraphToAnchor),
  )
  if (anchorIndex < 0) {
    return sectionContent.trim()
  }

  const calloutBlock = `<CalloutBox summary="${escapeMdxAttributeValue(summary)}" cta="${cta}" />`
  const rebuilt: string[] = []

  for (let index = 0; index < paragraphs.length; index += 1) {
    rebuilt.push(paragraphs[index])
    if (index === anchorIndex) {
      rebuilt.push(calloutBlock)
    }
  }

  return rebuilt.join("\n\n").trim()
}

async function summarizeParagraph(paragraph: string) {
  const prompt = `Summarize the following paragraph into a single key insight (25–35 words).
Focus on the most important takeaway.
Do not repeat the heading.

Paragraph:
${paragraph}`

  return generateText([{ role: "user", content: prompt }], { model: "haiku", temperature: 0.3 })
}

async function summarizeWithRetry(paragraph: string) {
  for (let attempt = 1; attempt <= MAX_RETRIES_PER_SUMMARY; attempt += 1) {
    try {
      const summary = await summarizeParagraph(paragraph)
      if (isInvalidInsightSummary(summary)) {
        return null
      }
      return summary
    } catch (error) {
      if (attempt === MAX_RETRIES_PER_SUMMARY) {
        console.warn(`Skipping callout summary due to repeated failures: ${(error as Error)?.message || "unknown error"}`)
        return null
      }
    }
  }

  return null
}

async function generateWithRetry(
  topic: string,
  sectionTitle: string,
  entity: PromptEntity,
  specificity: EntitySpecificityHints,
) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES_PER_SECTION; attempt += 1) {
    try {
      return await generateSectionContent(topic, sectionTitle, entity, specificity)
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES_PER_SECTION) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
      }
    }
  }

  throw new Error(
    `Failed generating section '${sectionTitle}' for '${entity.name}': ${lastError?.message || "unknown error"}`,
  )
}

async function buildMdxForEntity(
  template: TemplateWithSections,
  entity: PromptEntity,
  specificity: EntitySpecificityHints,
  resumeOptions?: ResumeOptions,
) {
  const sections = normalizeTemplateSections(template)
  const resolvedSectionTitles = sections.map((section) => generateTitle(section, entity))
  const blocks = await readSectionCheckpoint(resumeOptions, resolvedSectionTitles)
  const topic = generateTitle(template.name, entity)

  if (resumeOptions?.enabled && blocks.length > 0) {
    console.log(`Resuming section generation: ${entity.slug} (${blocks.length}/${sections.length} sections complete)`)
  }

  for (let index = blocks.length; index < sections.length; index += 1) {
    const section = sections[index]
    const resolvedSectionTitle = resolvedSectionTitles[index]
    console.log(`Generating section: ${entity.slug} -> ${resolvedSectionTitle}`)
    let sectionBody = await generateWithRetry(topic, resolvedSectionTitle, entity, specificity)
    let trimmedBody = sectionBody.trim()

    if (needsQualityRetry(trimmedBody, specificity)) {
      console.log(`Retrying generic section once: ${entity.slug} -> ${resolvedSectionTitle}`)
      sectionBody = await generateWithRetry(topic, resolvedSectionTitle, entity, specificity)
      trimmedBody = sectionBody.trim()
    }

    if (!shouldInsertCalloutForHeading(resolvedSectionTitle)) {
      blocks.push(`## ${resolvedSectionTitle}\n\n${trimmedBody}`)
      await writeSectionCheckpoint(resumeOptions, resolvedSectionTitles, blocks)
      continue
    }

    const summarySourceParagraph = getSubstantiveParagraph(trimmedBody, resolvedSectionTitle)
    if (!summarySourceParagraph) {
      blocks.push(`## ${resolvedSectionTitle}\n\n${trimmedBody}`)
      await writeSectionCheckpoint(resumeOptions, resolvedSectionTitles, blocks)
      continue
    }

    const summary = await summarizeWithRetry(summarySourceParagraph)
    if (!summary) {
      blocks.push(`## ${resolvedSectionTitle}\n\n${trimmedBody}`)
      await writeSectionCheckpoint(resumeOptions, resolvedSectionTitles, blocks)
      continue
    }

    const cta: CalloutCta = index % 2 === 0 ? "analyze" : "demo"
    const bodyWithCallout = insertCallout(trimmedBody, summarySourceParagraph, summary, cta)
    blocks.push(`## ${resolvedSectionTitle}\n\n${bodyWithCallout}`)
    await writeSectionCheckpoint(resumeOptions, resolvedSectionTitles, blocks)
  }

  return blocks.join("\n\n")
}

async function refreshExistingCallouts(slugFilter?: string) {
  const pages = await prisma.generatedPage.findMany({
    where: slugFilter
      ? {
          slug: slugFilter,
        }
      : undefined,
    orderBy: {
      updatedAt: "desc",
    },
  })

  let updatedCount = 0
  let skippedCount = 0

  for (const page of pages) {
    const withoutCallouts = stripExistingCallouts(page.content)
    const sections = splitGuideSections(withoutCallouts)

    if (sections.length === 0) {
      skippedCount += 1
      continue
    }

    const rebuiltSections: string[] = []

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index]
      const sectionBody = section.body.trim()
      if (!shouldInsertCalloutForHeading(section.heading) || !sectionBody) {
        rebuiltSections.push(`## ${section.heading}\n\n${sectionBody}`)
        continue
      }

      const summarySourceParagraph = getSubstantiveParagraph(sectionBody, section.heading)
      if (!summarySourceParagraph) {
        rebuiltSections.push(`## ${section.heading}\n\n${sectionBody}`)
        continue
      }

      const summary = await summarizeWithRetry(summarySourceParagraph)
      if (!summary) {
        rebuiltSections.push(`## ${section.heading}\n\n${sectionBody}`)
        continue
      }

      const cta: CalloutCta = index % 2 === 0 ? "analyze" : "demo"
      const bodyWithCallout = insertCallout(sectionBody, summarySourceParagraph, summary, cta)
      rebuiltSections.push(`## ${section.heading}\n\n${bodyWithCallout}`)
    }

    const updatedContent = rebuiltSections.join("\n\n").trim()

    if (!updatedContent || updatedContent === page.content.trim()) {
      skippedCount += 1
      continue
    }

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        content: page.content,
      },
    })

    await prisma.generatedPage.update({
      where: { id: page.id },
      data: {
        content: updatedContent,
      },
    })

    updatedCount += 1
    console.log(`Refreshed callouts for page: ${page.slug}`)
  }

  console.log(`Callout refresh completed. Updated ${updatedCount} pages, skipped ${skippedCount} pages.`)
}

function isAeoTemplate(template: TemplateWithSections) {
  const aggregate = `${template.slugPattern} ${template.name}`.toLowerCase()
  return aggregate.includes("aeo for") || aggregate.includes("aeo-for")
}

function selectWidgetsForGuide(
  template: TemplateWithSections,
  slug: string,
  entityName: string,
  topAiQuestions: string[],
): WidgetId[] {
  const seedKey = `${template.id}:${slug}:${entityName}:${topAiQuestions.join("|")}`
  const random = createSeededRandom(seedKey)

  if (isAeoTemplate(template)) {
    return pickWidgetsForAeoGuide(random)
  }

  const pool = getWidgetPoolForTemplate(template)
  if (pool.length === 0) {
    return [] as WidgetId[]
  }

  return pickWidgetsFromPool(pool, random)
}

async function applyWidgetPoolToContent(
  content: string,
  template: TemplateWithSections,
  slug: string,
  entityName: string,
  topAiQuestions: string[],
) {
  const fromMetadata = parseWidgetSelectionFromContent(content)
  const selectedWidgets = isAeoTemplate(template)
    ? (fromMetadata.length > 0 ? normalizeAeoWidgetSelection(fromMetadata) : selectWidgetsForGuide(template, slug, entityName, topAiQuestions))
    : (fromMetadata.length > 0 ? fromMetadata : selectWidgetsForGuide(template, slug, entityName, topAiQuestions))

  if (selectedWidgets.length === 0) {
    return content
  }

  const cleanContent = stripExistingWidgetPoolTags(content)
  const seedKey = `${template.id}:${slug}:${entityName}`
  return injectWidgetPool(cleanContent, entityName, topAiQuestions, selectedWidgets, seedKey)
}

function inferEntityTypeFromTemplate(template: TemplateWithSections): EntityType {
  const aggregate = `${template.slugPattern} ${template.name} ${template.contentTemplate}`.toLowerCase()

  if (
    aggregate.includes("{cms}") ||
    aggregate.includes(" cms ") ||
    aggregate.startsWith("cms ") ||
    aggregate.endsWith(" cms")
  ) {
    return "cms"
  }

  return "business_category"
}

async function resolveEntityTypeForTemplate(template: TemplateWithSections): Promise<EntityType> {
  const existingPage = await prisma.generatedPage.findFirst({
    where: {
      templateId: template.id,
    },
    include: {
      entity: {
        select: {
          type: true,
        },
      },
    },
  })

  const existingType = existingPage?.entity?.type
  if (existingType === "cms" || existingType === "business_category") {
    return existingType
  }

  return inferEntityTypeFromTemplate(template)
}

async function backfillWidgetPool(
  templateFilter?: string,
  slugFilter?: string,
  entityFilter?: string,
) {
  const pages = await prisma.generatedPage.findMany({
    where: {
      ...(slugFilter ? { slug: slugFilter } : {}),
      ...(entityFilter
        ? {
            entity: {
              OR: [{ slug: entityFilter }, { name: entityFilter }],
            },
          }
        : {}),
    },
    include: {
      template: true,
      entity: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  let updatedCount = 0
  let skippedCount = 0

  for (const page of pages) {
    const template = page.template as TemplateWithSections
    if (!isAeoTemplate(template)) {
      skippedCount += 1
      continue
    }

    if (templateFilter && template.slugPattern !== templateFilter && template.name !== templateFilter) {
      skippedCount += 1
      continue
    }

    const entity = page.entity as GeneratorEntity
    const userSpecificity = getUserDefinedEntitySpecificity(entity.metadata)
    const deterministicSpecificity = getDeterministicEntitySpecificity(entity)
    const specificity = mergeEntitySpecificityProfiles(userSpecificity, deterministicSpecificity)

    const topAiQuestionsFromContent = extractTopQuestionsFromContent(page.content)
    const topAiQuestions =
      topAiQuestionsFromContent.length > 0
        ? topAiQuestionsFromContent.slice(0, 5)
        : await generateTopAiQuestions(specificity.preferredLabel, page.title, specificity)

    const contentWithWidgets = await applyWidgetPoolToContent(
      page.content,
      template,
      page.slug,
      specificity.preferredLabel,
      topAiQuestions,
    )
    const nextContent = normalizeGuideTypography(contentWithWidgets)

    if (!nextContent || nextContent.trim() === page.content.trim()) {
      skippedCount += 1
      continue
    }

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        content: page.content,
      },
    })

    await prisma.generatedPage.update({
      where: { id: page.id },
      data: {
        content: nextContent,
      },
    })

    updatedCount += 1
    console.log(`Backfilled widget pool for page: ${page.slug}`)
  }

  console.log(`Widget pool backfill completed. Updated ${updatedCount} pages, skipped ${skippedCount} pages.`)
}

async function backfillAiQueryDistributionWidget(
  templateFilter?: string,
  slugFilter?: string,
  entityFilter?: string,
) {
  const pages = await prisma.generatedPage.findMany({
    where: {
      ...(slugFilter ? { slug: slugFilter } : {}),
      ...(entityFilter
        ? {
            entity: {
              OR: [{ slug: entityFilter }, { name: entityFilter }],
            },
          }
        : {}),
      content: {
        contains: "<AiQueryDistributionWidget",
      },
    },
    include: {
      template: true,
      entity: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  let updatedCount = 0
  let skippedCount = 0

  for (const page of pages) {
    const template = page.template as TemplateWithSections
    if (!isAeoTemplate(template)) {
      skippedCount += 1
      continue
    }

    if (templateFilter && template.slugPattern !== templateFilter && template.name !== templateFilter) {
      skippedCount += 1
      continue
    }

    const entity = page.entity as GeneratorEntity
    const userSpecificity = getUserDefinedEntitySpecificity(entity.metadata)
    const deterministicSpecificity = getDeterministicEntitySpecificity(entity)
    const specificity = mergeEntitySpecificityProfiles(userSpecificity, deterministicSpecificity)
    const seedKey = `${template.id}:${page.slug}:${specificity.preferredLabel}`
    const nextContent = normalizeGuideTypography(
      replaceAiQueryDistributionWidgetTag(page.content, specificity.preferredLabel, seedKey),
    )

    if (!nextContent || nextContent.trim() === page.content.trim()) {
      skippedCount += 1
      continue
    }

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        content: page.content,
      },
    })

    await prisma.generatedPage.update({
      where: { id: page.id },
      data: {
        content: nextContent,
      },
    })

    updatedCount += 1
    console.log(`Backfilled AI query distribution widget for page: ${page.slug}`)
  }

  console.log(`AI query distribution widget backfill completed. Updated ${updatedCount} pages, skipped ${skippedCount} pages.`)
}

async function backfillAiContentPreferenceWidget(
  templateFilter?: string,
  slugFilter?: string,
  entityFilter?: string,
) {
  const pages = await prisma.generatedPage.findMany({
    where: {
      ...(slugFilter ? { slug: slugFilter } : {}),
      ...(entityFilter
        ? {
            entity: {
              OR: [{ slug: entityFilter }, { name: entityFilter }],
            },
          }
        : {}),
      content: {
        contains: "<AiContentPreferenceWidget",
      },
    },
    include: {
      template: true,
      entity: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  let updatedCount = 0
  let skippedCount = 0

  for (const page of pages) {
    const template = page.template as TemplateWithSections
    if (!isAeoTemplate(template)) {
      skippedCount += 1
      continue
    }

    if (templateFilter && template.slugPattern !== templateFilter && template.name !== templateFilter) {
      skippedCount += 1
      continue
    }

    const entity = page.entity as GeneratorEntity
    const userSpecificity = getUserDefinedEntitySpecificity(entity.metadata)
    const deterministicSpecificity = getDeterministicEntitySpecificity(entity)
    const specificity = mergeEntitySpecificityProfiles(userSpecificity, deterministicSpecificity)
    const seedKey = `${template.id}:${page.slug}:${specificity.preferredLabel}`
    const nextContent = normalizeGuideTypography(
      replaceAiContentPreferenceWidgetTag(page.content, specificity.preferredLabel, seedKey),
    )

    if (!nextContent || nextContent.trim() === page.content.trim()) {
      skippedCount += 1
      continue
    }

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        content: page.content,
      },
    })

    await prisma.generatedPage.update({
      where: { id: page.id },
      data: {
        content: nextContent,
      },
    })

    updatedCount += 1
    console.log(`Backfilled AI content preference widget for page: ${page.slug}`)
  }

  console.log(`AI content preference widget backfill completed. Updated ${updatedCount} pages, skipped ${skippedCount} pages.`)
}

async function main() {
  const refreshCalloutsOnly = process.argv.includes("--refresh-callouts")
  const backfillWidgetPoolOnly = process.argv.includes("--backfill-widget-pool")
  const backfillAiQueryWidgetOnly = process.argv.includes("--backfill-ai-query-widget")
  const backfillAiContentWidgetOnly = process.argv.includes("--backfill-ai-content-widget")
  const regenerateExisting = process.argv.includes("--regenerate-existing")
  const resumeGeneration = process.argv.includes("--resume")
  const slugFilter = getArgValue("--slug")
  const templateFilter = getArgValue("--template")
  const entityFilter = getArgValue("--entity")

  if (refreshCalloutsOnly) {
    await refreshExistingCallouts(slugFilter)
    return
  }

  if (backfillWidgetPoolOnly) {
    await backfillWidgetPool(templateFilter, slugFilter, entityFilter)
    return
  }

  if (backfillAiQueryWidgetOnly) {
    await backfillAiQueryDistributionWidget(templateFilter, slugFilter, entityFilter)
    return
  }

  if (backfillAiContentWidgetOnly) {
    await backfillAiContentPreferenceWidget(templateFilter, slugFilter, entityFilter)
    return
  }

  const allTemplates = (await prisma.template.findMany({
    orderBy: [{ createdAt: "desc" }, { version: "desc" }],
  })) as TemplateWithSections[]

  const templates = templateFilter
    ? allTemplates.filter((template) => template.slugPattern === templateFilter || template.name === templateFilter)
    : allTemplates

  if (templates.length === 0) {
    throw new Error("No template found. Seed template data first.")
  }

  let generatedCount = 0
  let regeneratedCount = 0
  let skippedCount = 0

  for (const template of templates) {
    const entityType = await resolveEntityTypeForTemplate(template)
    const baseEntities = await prisma.entity.findMany({
      where: { type: entityType },
      orderBy: { name: "asc" },
      take: MAX_PAGES_PER_RUN,
    })
    const entities = entityFilter
      ? baseEntities.filter((entity) => entity.slug === entityFilter || entity.name === entityFilter)
      : baseEntities

    if (entities.length === 0) {
      console.log(`Skipping template ${template.slugPattern}: no ${entityType} entities found`)
      continue
    }

    console.log(`Processing template: ${template.name} (${template.slugPattern}) with ${entityType} entities`)

    for (const entity of entities as GeneratorEntity[]) {
      const slug = generateSlug(template.slugPattern, entity.name, entity.slug)
      const existing = await prisma.generatedPage.findUnique({ where: { slug } })
      if (existing && !regenerateExisting) {
        skippedCount += 1
        console.log(`Skipping existing page: ${slug}`)
        continue
      }

      const userSpecificity = getUserDefinedEntitySpecificity(entity.metadata)
      const deterministicSpecificity = getDeterministicEntitySpecificity(entity)
      const shouldUseLlmSpecificity =
        !userSpecificity.preferredLabel ||
        (userSpecificity.specificNouns?.length || 0) < 2 ||
        (userSpecificity.avoidGenericNouns?.length || 0) === 0
      const llmSpecificity = shouldUseLlmSpecificity
        ? await suggestSpecificityWithLlm(entity, template.name)
        : null
      const specificity = mergeEntitySpecificityProfiles(userSpecificity, deterministicSpecificity, llmSpecificity)
      const specificityMetadata = buildSpecificityMetadata(entity.metadata, specificity)

      await prisma.entity.update({
        where: { id: entity.id },
        data: {
          metadata: specificityMetadata as Prisma.InputJsonValue,
        },
      })

      const promptEntity: PromptEntity = {
        name: specificity.preferredLabel,
        slug: entity.slug,
        metadata: specificityMetadata,
      }

      const title = generateTitle(template.name, promptEntity)
      const rawContent = await buildMdxForEntity(template, promptEntity, specificity, {
        enabled: resumeGeneration,
        slug,
        templateId: template.id,
      })
      await registerInternalLinkTarget(slug, title, getArticleSummary(rawContent), prisma)
      const contentWithInternalInjection = await injectInternalLinks(rawContent, { excludeSlug: slug, maxLinks: 6 })
      const contentWithInternalMinimum = await ensureMinimumInternalLinks(contentWithInternalInjection, slug)
      const externalSources = await generateValidatedExternalSources(
        title,
        getArticleSummary(contentWithInternalMinimum),
        specificity.preferredLabel,
        template.name,
      )
      const contentWithInlineExternal = injectInlineExternalLinks(contentWithInternalMinimum, externalSources, 3)
      const shouldInjectAiQuestions = isAeoTemplate(template)
      const topAiQuestions = shouldInjectAiQuestions
        ? await generateTopAiQuestions(specificity.preferredLabel, title, specificity)
        : []
      const contentWithWidgets =
        shouldInjectAiQuestions && topAiQuestions.length > 0
          ? await applyWidgetPoolToContent(
              contentWithInlineExternal,
              template,
              slug,
              specificity.preferredLabel,
              topAiQuestions,
            )
          : contentWithInlineExternal
      const withSources = appendSourcesSection(contentWithWidgets, externalSources)
      const content = normalizeGuideTypography(withSources)

      if (existing) {
        await prisma.pageVersion.create({
          data: {
            pageId: existing.id,
            content: existing.content,
          },
        })

        await prisma.generatedPage.update({
          where: { id: existing.id },
          data: {
            title,
            content,
            status: existing.status,
            templateId: template.id,
            entityId: entity.id,
          },
        })

        regeneratedCount += 1
        console.log(`Regenerated existing page: ${slug}`)
      } else {
        const page = await prisma.generatedPage.create({
          data: {
            slug,
            title,
            content,
            status: "draft",
            templateId: template.id,
            entityId: entity.id,
          },
        })

        await prisma.pageVersion.create({
          data: {
            pageId: page.id,
            content: page.content,
          },
        })

        generatedCount += 1
        console.log(`Generated draft page: ${slug}`)
      }

      if (resumeGeneration) {
        await clearSectionCheckpoint(slug)
      }
    }
  }

  console.log(
    `Processed ${templates.length} templates. Generated ${generatedCount} draft pages, regenerated ${regeneratedCount} existing pages, and skipped ${skippedCount} existing pages.`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
