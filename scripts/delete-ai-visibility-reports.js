const { PrismaClient } = require("@prisma/client")

const TARGET_SLUGS = ["soniclinker", "asana", "linear"]

const prisma = new PrismaClient()

async function findAiSearchTables() {
  const tables = await prisma.$queryRawUnsafe(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename ILIKE 'AiSearch%' ORDER BY tablename",
  )

  return tables.map((row) => row.tablename)
}

async function deleteFromAiSearchTables(tableNames) {
  const results = []

  for (const tableName of tableNames) {
    const columns = await prisma.$queryRawUnsafe(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = '${tableName}'
       ORDER BY ordinal_position`,
    )

    const columnSet = new Set(columns.map((row) => row.column_name.toLowerCase()))
    const slugColumn = ["companyslug", "brandslug", "slug"].find((column) => columnSet.has(column))
    if (!slugColumn) {
      results.push({ tableName, deleted: 0, reason: "no supported slug column" })
      continue
    }

    const deleted = await prisma.$executeRawUnsafe(
      `DELETE FROM "${tableName}" WHERE "${slugColumn}" = ANY($1::text[])`,
      TARGET_SLUGS,
    )

    results.push({ tableName, deleted, reason: "deleted by slug" })
  }

  return results
}

async function main() {
  const existing = await prisma.aiVisibilityReport.findMany({
    where: {
      companySlug: {
        in: TARGET_SLUGS,
      },
    },
    select: {
      id: true,
      companySlug: true,
      companyName: true,
      domain: true,
      status: true,
    },
    orderBy: {
      companySlug: "asc",
    },
  })

  console.log("[cleanup] target slugs:", TARGET_SLUGS.join(", "))
  console.log("[cleanup] matching reports found:", existing.length)
  if (existing.length > 0) {
    console.log(
      JSON.stringify(
        existing.map((row) => ({
          companySlug: row.companySlug,
          companyName: row.companyName,
          domain: row.domain,
          status: row.status,
        })),
        null,
        2,
      ),
    )
  }

  const aiSearchTables = await findAiSearchTables()
  console.log("[cleanup] ai-search tables discovered:", aiSearchTables.length ? aiSearchTables.join(", ") : "none")

  await prisma.$transaction(async (tx) => {
    const aiSearchCleanup = await deleteFromAiSearchTables(aiSearchTables)
    if (aiSearchCleanup.length > 0) {
      console.log("[cleanup] ai-search cleanup:", JSON.stringify(aiSearchCleanup, null, 2))
    }

    const deletedReports = await tx.aiVisibilityReport.deleteMany({
      where: {
        companySlug: {
          in: TARGET_SLUGS,
        },
      },
    })

    console.log("[cleanup] deleted AiVisibilityReport rows:", deletedReports.count)
  })

  const remaining = await prisma.aiVisibilityReport.count({
    where: {
      companySlug: {
        in: TARGET_SLUGS,
      },
    },
  })

  console.log("[verify] remaining targeted reports:", remaining)
  if (remaining !== 0) {
    throw new Error("Cleanup verification failed: targeted reports still exist.")
  }

  console.log(
    "[cache] /ai-visibility and /ai-search routes are dynamic database-backed pages, so deletions are reflected on next request.",
  )
  console.log(
    "[regen] report generation remains enabled. Re-analyzing these domains will create fresh reports.",
  )
}

main()
  .catch((error) => {
    console.error("[cleanup] failed", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
