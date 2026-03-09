const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

function deriveSlugFromDomain(domain) {
  const parts = String(domain || "")
    .toLowerCase()
    .trim()
    .replace(/^www\./, "")
    .split(".")
    .filter(Boolean)

  if (parts.length < 2) {
    throw new Error(`Invalid domain for slug migration: ${domain}`)
  }

  const [baseLabel, ...tldParts] = parts
  const tldLabel = tldParts.join("-")
  return `${baseLabel}-${tldLabel}`.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

async function main() {
  const reports = await prisma.aiVisibilityReport.findMany({
    select: {
      id: true,
      domain: true,
      companySlug: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const updates = reports
    .map((report) => ({
      id: report.id,
      domain: report.domain,
      oldSlug: report.companySlug,
      newSlug: deriveSlugFromDomain(report.domain),
    }))
    .filter((row) => row.oldSlug !== row.newSlug)

  console.log(`[slug-migrate] reports found: ${reports.length}`)
  console.log(`[slug-migrate] updates needed: ${updates.length}`)

  if (updates.length === 0) {
    return
  }

  const duplicateNewSlugs = updates
    .map((row) => row.newSlug)
    .filter((slug, index, all) => all.indexOf(slug) !== index)

  if (duplicateNewSlugs.length > 0) {
    throw new Error(`[slug-migrate] duplicate target slugs detected: ${Array.from(new Set(duplicateNewSlugs)).join(", ")}`)
  }

  await prisma.$transaction(async (tx) => {
    for (const row of updates) {
      await tx.aiVisibilityReport.update({
        where: { id: row.id },
        data: {
          companySlug: row.newSlug,
        },
      })
    }
  })

  console.log(`[slug-migrate] updated rows: ${updates.length}`)
  for (const row of updates) {
    console.log(`- ${row.domain}: ${row.oldSlug} -> ${row.newSlug}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
