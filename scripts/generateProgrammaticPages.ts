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

type EntityType = "cms" | "business_category"

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
      const content = await buildMdxForEntity(template, { name: entity.name, slug: entity.slug })

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
