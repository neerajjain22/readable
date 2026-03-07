const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

function replaceTokens(input, entity) {
  return input
    .replaceAll("{CMS}", entity.name)
    .replaceAll("{entity}", entity.slug)
    .replaceAll("{ENTITY}", entity.name)
    .replaceAll("{cms}", entity.slug)
}

async function main() {
  const template = await prisma.template.findFirst({
    orderBy: [{ createdAt: "desc" }, { version: "desc" }],
  })

  if (!template) {
    throw new Error("No template found. Seed template data first.")
  }

  const entities = await prisma.entity.findMany({
    where: { type: "cms" },
    orderBy: { name: "asc" },
  })

  if (entities.length === 0) {
    throw new Error("No entities found. Seed entity data first.")
  }

  for (const entity of entities) {
    const slug = replaceTokens(template.slugPattern, entity)
    const title = replaceTokens(template.name, entity)
    const content = replaceTokens(template.contentTemplate, entity)

    const existing = await prisma.generatedPage.findUnique({ where: { slug } })

    if (existing) {
      await prisma.generatedPage.update({
        where: { id: existing.id },
        data: {
          title,
          content,
          status: "draft",
          templateId: template.id,
          entityId: entity.id,
        },
      })
      continue
    }

    const created = await prisma.generatedPage.create({
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
        pageId: created.id,
        content: created.content,
      },
    })
  }

  console.log("Generated draft programmatic pages from template + entities.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
