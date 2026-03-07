const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const templateName = "How to track ChatGPT traffic on {CMS}"
const slugPattern = "track-chatgpt-traffic-{entity}"
const sections = [
  "Introduction",
  "Why ChatGPT traffic matters",
  "How ChatGPT interacts with {entity}",
  "Why traditional analytics miss AI traffic",
  "Methods to detect ChatGPT traffic on {entity}",
  "Server log analysis",
  "Best practices",
  "How Readable helps",
  "FAQ",
  "Summary",
]
const contentTemplate = `## Introduction

If your team runs on **{CMS}**, understanding ChatGPT-originated traffic is now a growth requirement.

## Why ChatGPT traffic matters

AI assistants are becoming a discovery channel. Buyers now visit websites after reading synthesized answers.

## How ChatGPT visits {CMS} websites

On {CMS}, AI traffic often appears as referral visits mixed with direct sessions. It can be under-counted if attribution is not configured.

## How to detect ChatGPT traffic

1. Segment traffic by referrer and user-agent patterns.
2. Track landing pages that receive assistant-driven sessions.
3. Compare AI-assisted conversion paths against organic and paid.

## How Readable helps

Readable helps teams measure AI influence, understand model visibility, and optimize pages for agent-driven journeys.

## Best practices

- Standardize UTM tagging for assistant-origin traffic.
- Build dashboards by landing page and intent cluster.
- Review AI referral behavior weekly.`

const entities = [
  { name: "Shopify", slug: "shopify", type: "cms", metadata: { category: "ecommerce" } },
  { name: "WordPress", slug: "wordpress", type: "cms", metadata: { category: "oss" } },
  { name: "Webflow", slug: "webflow", type: "cms", metadata: { category: "site-builder" } },
]

function replaceTokens(input, entity) {
  return input
    .replaceAll("{CMS}", entity.name)
    .replaceAll("{entity}", entity.slug)
    .replaceAll("{ENTITY}", entity.name)
    .replaceAll("{cms}", entity.slug)
}

async function main() {
  const template = await prisma.template.upsert({
    where: {
      name_version: {
        name: templateName,
        version: 1,
      },
    },
    update: {
      slugPattern,
      contentTemplate,
      sections,
      contentType: "guide",
    },
    create: {
      name: templateName,
      slugPattern,
      contentTemplate,
      sections,
      contentType: "guide",
      version: 1,
    },
  })

  for (const entityInput of entities) {
    const entity = await prisma.entity.upsert({
      where: { slug: entityInput.slug },
      update: {
        name: entityInput.name,
        type: entityInput.type,
        metadata: entityInput.metadata,
      },
      create: entityInput,
    })

    const slug = replaceTokens(template.slugPattern, entity)
    const title = replaceTokens(template.name, entity)
    const content = replaceTokens(template.contentTemplate, entity)

    const existing = await prisma.generatedPage.findUnique({ where: { slug } })

    const page = existing
      ? await prisma.generatedPage.update({
          where: { slug },
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

    if (!existing) {
      await prisma.pageVersion.create({
        data: {
          pageId: page.id,
          content: page.content,
        },
      })
    }
  }

  console.log("Seeded template, entities, and draft programmatic pages.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
