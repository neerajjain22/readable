import { PrismaClient } from "@prisma/client"
import { generateSectionContent } from "../lib/llm"
import { generateSlug } from "../lib/programmatic/generateSlug"
import { generateTitle } from "../lib/programmatic/generateContent"

const prisma = new PrismaClient()

const MAX_PAGES_PER_RUN = 20
const MAX_RETRIES_PER_SECTION = 3

type TemplateWithSections = {
  id: string
  name: string
  slugPattern: string
  contentTemplate: string
  sections: unknown
}

function replaceTokens(input: string, entity: { name: string; slug: string }) {
  return input
    .replaceAll("{CMS}", entity.name)
    .replaceAll("{entity}", entity.slug)
    .replaceAll("{ENTITY}", entity.name)
    .replaceAll("{cms}", entity.slug)
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

  for (const section of sections) {
    const resolvedSectionTitle = replaceTokens(section, entity)
    console.log(`Generating section: ${entity.slug} -> ${resolvedSectionTitle}`)
    const sectionBody = await generateWithRetry(template.name, resolvedSectionTitle, entity)
    blocks.push(`## ${resolvedSectionTitle}\n\n${sectionBody.trim()}`)
  }

  return blocks.join("\n\n")
}

async function main() {
  const template = (await prisma.template.findFirst({
    orderBy: [{ createdAt: "desc" }, { version: "desc" }],
  })) as TemplateWithSections | null

  if (!template) {
    throw new Error("No template found. Seed template data first.")
  }

  const entities = await prisma.entity.findMany({
    where: { type: "cms" },
    orderBy: { name: "asc" },
    take: MAX_PAGES_PER_RUN,
  })

  if (entities.length === 0) {
    throw new Error("No entities found. Seed entity data first.")
  }

  for (const entity of entities) {
    const slug = generateSlug(template.slugPattern, entity.name, entity.slug)
    const title = generateTitle(template.name, { name: entity.name, slug: entity.slug })
    const content = await buildMdxForEntity(template, { name: entity.name, slug: entity.slug })

    const existing = await prisma.generatedPage.findUnique({ where: { slug } })

    const page = existing
      ? await prisma.generatedPage.update({
          where: { id: existing.id },
          data: {
            title,
            content,
            status: "draft",
            templateId: template.id,
            entityId: entity.id,
          },
        })
      : await prisma.generatedPage.create({
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

    console.log(`Generated draft page: ${slug}`)
  }

  console.log(`Generated ${entities.length} draft programmatic pages with section-level LLM content.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
