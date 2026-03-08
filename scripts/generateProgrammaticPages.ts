import { PrismaClient } from "@prisma/client"
import { generateSectionContent } from "../lib/llm.ts"
import { generateSlug } from "../lib/programmatic/generateSlug.ts"
import { generateTitle } from "../lib/programmatic/generateContent.ts"
import { splitGuideSections } from "../lib/internalLinks/index.ts"
import { injectInternalLinks } from "../lib/internalLinks/injectInternalLinks.ts"
import { registerInternalLinkTarget } from "./registerInternalLinkTarget.ts"

const prisma = new PrismaClient()

const MAX_PAGES_PER_RUN = 20
const MAX_RETRIES_PER_SECTION = 3
const MAX_RETRIES_PER_SUMMARY = 3

type TemplateWithSections = {
  id: string
  name: string
  slugPattern: string
  contentTemplate: string
  sections: unknown
}

type EntityType = "cms" | "business_category"
type CalloutCta = "analyze" | "demo"

function getArticleSummary(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220)
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
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase()
  if (provider !== "openai" && provider !== "openrouter") {
    throw new Error("Unsupported LLM_PROVIDER. Use 'openai' or 'openrouter'.")
  }

  const prompt = `Summarize the following paragraph into a single key insight (25–35 words).
Focus on the most important takeaway.
Do not repeat the heading.

Paragraph:
${paragraph}`

  if (provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing")
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenRouter summary request failed: ${response.status} ${text}`)
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = payload.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error("OpenRouter returned empty summary content")
    }
    return content
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing")
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI summary request failed: ${response.status} ${text}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = payload.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error("OpenAI returned empty summary content")
  }

  return content
}

async function summarizeWithRetry(paragraph: string) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES_PER_SUMMARY; attempt += 1) {
    try {
      const summary = await summarizeParagraph(paragraph)
      if (isInvalidInsightSummary(summary)) {
        return null
      }

      return summary
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES_PER_SUMMARY) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt))
      }
    }
  }

  console.warn(`Skipping callout summary due to repeated failures: ${lastError?.message || "unknown error"}`)
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
    const sectionBody = await generateWithRetry(template.name, resolvedSectionTitle, entity)
    const trimmedBody = sectionBody.trim()

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

async function refreshExistingCallouts() {
  const pages = await prisma.generatedPage.findMany({
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
  if (refreshCalloutsOnly) {
    await refreshExistingCallouts()
    return
  }

  const templates = (await prisma.template.findMany({
    orderBy: [{ createdAt: "desc" }, { version: "desc" }],
  })) as TemplateWithSections[]

  if (templates.length === 0) {
    throw new Error("No template found. Seed template data first.")
  }

  let generatedCount = 0
  let skippedCount = 0

  for (const template of templates) {
    const entityType = await resolveEntityTypeForTemplate(template)
    const entities = await prisma.entity.findMany({
      where: { type: entityType },
      orderBy: { name: "asc" },
      take: MAX_PAGES_PER_RUN,
    })

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
      const content = await injectInternalLinks(rawContent, { excludeSlug: slug, maxLinks: 6 })

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
