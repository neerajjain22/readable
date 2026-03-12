import { PrismaClient } from "@prisma/client"
import { generateSectionContent } from "../lib/llm.ts"
import { generateText } from "../lib/services/llm.ts"
import { generateSlug } from "../lib/programmatic/generateSlug.ts"
import { generateTitle } from "../lib/programmatic/generateContent.ts"
import { splitGuideSections } from "../lib/internalLinks/index.ts"
import { injectInternalLinks } from "../lib/internalLinks/injectInternalLinks.ts"
import { registerInternalLinkTarget } from "./registerInternalLinkTarget.ts"

const prisma = new PrismaClient()

const MAX_PAGES_PER_RUN = 20
const MAX_RETRIES_PER_SECTION = 3
const MAX_RETRIES_PER_SUMMARY = 3
const MIN_INTERNAL_LINKS = 3
const MIN_EXTERNAL_LINKS = 3
const EXTERNAL_LINK_TIMEOUT_MS = 8000

type TemplateWithSections = {
  id: string
  name: string
  slugPattern: string
  contentTemplate: string
  sections: unknown
}

type EntityType = "cms" | "business_category"
type CalloutCta = "analyze" | "demo"

function getArgValue(flag: string) {
  const arg = process.argv.find((entry) => entry.startsWith(`${flag}=`))
  if (!arg) {
    return undefined
  }

  const value = arg.slice(flag.length + 1).trim()
  return value.length > 0 ? value : undefined
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

function replaceTokens(input: string, entity: { name: string; slug: string }) {
  return input
    .replaceAll("{CMS}", entity.name)
    .replaceAll("{entity}", entity.name)
    .replaceAll("{ENTITY}", entity.name)
    .replaceAll("{cms}", entity.name)
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

function needsQualityRetry(content: string) {
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

async function generateWithRetry(topic: string, sectionTitle: string, entity: { name: string; slug: string }) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES_PER_SECTION; attempt += 1) {
    try {
      return await generateSectionContent(topic, sectionTitle, entity)
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

async function buildMdxForEntity(template: TemplateWithSections, entity: { name: string; slug: string }) {
  const sections = normalizeTemplateSections(template)
  const blocks: string[] = []

  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index]
    const resolvedSectionTitle = replaceTokens(section, entity)
    console.log(`Generating section: ${entity.slug} -> ${resolvedSectionTitle}`)
    let sectionBody = await generateWithRetry(template.name, resolvedSectionTitle, entity)
    let trimmedBody = sectionBody.trim()

    if (needsQualityRetry(trimmedBody)) {
      console.log(`Retrying generic section once: ${entity.slug} -> ${resolvedSectionTitle}`)
      sectionBody = await generateWithRetry(template.name, resolvedSectionTitle, entity)
      trimmedBody = sectionBody.trim()
    }

    if (!shouldInsertCalloutForHeading(resolvedSectionTitle)) {
      blocks.push(`## ${resolvedSectionTitle}\n\n${trimmedBody}`)
      continue
    }

    const summarySourceParagraph = getSubstantiveParagraph(trimmedBody, resolvedSectionTitle)
    if (!summarySourceParagraph) {
      blocks.push(`## ${resolvedSectionTitle}\n\n${trimmedBody}`)
      continue
    }

    const summary = await summarizeWithRetry(summarySourceParagraph)
    if (!summary) {
      blocks.push(`## ${resolvedSectionTitle}\n\n${trimmedBody}`)
      continue
    }

    const cta: CalloutCta = index % 2 === 0 ? "analyze" : "demo"
    const bodyWithCallout = insertCallout(trimmedBody, summarySourceParagraph, summary, cta)
    blocks.push(`## ${resolvedSectionTitle}\n\n${bodyWithCallout}`)
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

async function main() {
  const refreshCalloutsOnly = process.argv.includes("--refresh-callouts")
  const slugFilter = getArgValue("--slug")
  const templateFilter = getArgValue("--template")
  const entityFilter = getArgValue("--entity")

  if (refreshCalloutsOnly) {
    await refreshExistingCallouts(slugFilter)
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

    for (const entity of entities) {
      const slug = generateSlug(template.slugPattern, entity.name, entity.slug)
      const existing = await prisma.generatedPage.findUnique({ where: { slug } })
      if (existing) {
        skippedCount += 1
        console.log(`Skipping existing page: ${slug}`)
        continue
      }

      const title = generateTitle(template.name, { name: entity.name, slug: entity.slug })
      const rawContent = await buildMdxForEntity(template, { name: entity.name, slug: entity.slug })
      await registerInternalLinkTarget(slug, title, getArticleSummary(rawContent), prisma)
      const contentWithInternalInjection = await injectInternalLinks(rawContent, { excludeSlug: slug, maxLinks: 6 })
      const contentWithInternalMinimum = await ensureMinimumInternalLinks(contentWithInternalInjection, slug)
      const externalSources = await generateValidatedExternalSources(
        title,
        getArticleSummary(contentWithInternalMinimum),
        entity.name,
        template.name,
      )
      const contentWithInlineExternal = injectInlineExternalLinks(contentWithInternalMinimum, externalSources, 3)
      const withSources = appendSourcesSection(contentWithInlineExternal, externalSources)
      const content = normalizeGuideTypography(withSources)

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
  }

  console.log(
    `Processed ${templates.length} templates. Generated ${generatedCount} draft pages and skipped ${skippedCount} existing pages.`,
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
