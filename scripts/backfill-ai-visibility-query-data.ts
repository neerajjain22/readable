import { PrismaClient } from "@prisma/client"
import { toBrandSlug, toQuerySlug } from "../lib/ai-visibility/domain.ts"

const prisma = new PrismaClient()

type QueryEntry = {
  query: string
  querySlug: string
  brandMentioned: boolean
  responseExcerpt: string
  brandVisibility: Array<{ brand: string; brandSlug: string; visibilityPercent: number }>
  attributeMentions: Array<{ attribute: string; mentionPercent: number }>
  relatedQueries: Array<{ query: string; querySlug: string }>
  relatedGuides: Array<{ title: string; href: string }>
}

function asStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
}

function buildRelatedGuides(category: string | null) {
  const label = category || "software"
  return [
    { title: `How to influence AI recommendations in ${label}`, href: "/resources/guides/ai-search-field-guide" },
    { title: "Creating AI-friendly comparison pages", href: "/guides" },
    { title: "Optimizing product pages for AI search", href: "/guides" },
  ]
}

function normalizeBrandVisibility(
  existing: unknown,
  fallbackRows: Array<{ brand: string; visibilityPercent: number }>,
): Array<{ brand: string; brandSlug: string; visibilityPercent: number }> {
  if (Array.isArray(existing)) {
    const rows = existing
      .map((row) => {
        if (!row || typeof row !== "object") return null
        const item = row as { brand?: unknown; brandSlug?: unknown; visibilityPercent?: unknown }
        if (typeof item.brand !== "string") return null
        return {
          brand: item.brand,
          brandSlug: typeof item.brandSlug === "string" && item.brandSlug ? item.brandSlug : toBrandSlug(item.brand),
          visibilityPercent: typeof item.visibilityPercent === "number" ? item.visibilityPercent : 0,
        }
      })
      .filter((row): row is { brand: string; brandSlug: string; visibilityPercent: number } => Boolean(row))

    if (rows.length > 0) {
      return rows
    }
  }

  return fallbackRows.map((row) => ({
    brand: row.brand,
    brandSlug: toBrandSlug(row.brand),
    visibilityPercent: Math.round(row.visibilityPercent),
  }))
}

function normalizeAttributeMentions(
  existing: unknown,
  attributes: string[],
): Array<{ attribute: string; mentionPercent: number }> {
  if (Array.isArray(existing)) {
    const rows = existing
      .map((row) => {
        if (!row || typeof row !== "object") return null
        const item = row as { attribute?: unknown; mentionPercent?: unknown }
        if (typeof item.attribute !== "string") return null
        return {
          attribute: item.attribute,
          mentionPercent: typeof item.mentionPercent === "number" ? item.mentionPercent : 0,
        }
      })
      .filter((row): row is { attribute: string; mentionPercent: number } => Boolean(row))

    if (rows.length > 0) {
      return rows
    }
  }

  return attributes.map((attribute) => ({ attribute, mentionPercent: 0 }))
}

function normalizeQueryEntries(input: {
  raw: unknown
  aiResponseSamples: Array<{ query: string; excerpt: string }>
  competitorVisibility: Array<{ brand: string; visibilityPercent: number }>
  attributes: string[]
  category: string | null
}): QueryEntry[] {
  if (!Array.isArray(input.raw)) {
    return []
  }

  const sampleMap = new Map(input.aiResponseSamples.map((item) => [item.query.toLowerCase(), item.excerpt]))
  const guides = buildRelatedGuides(input.category)

  const rows = input.raw
    .map((row) => {
      if (!row || typeof row !== "object") return null
      const item = row as {
        query?: unknown
        querySlug?: unknown
        brandMentioned?: unknown
        likelyMentioned?: unknown
        responseExcerpt?: unknown
        brandVisibility?: unknown
        attributeMentions?: unknown
        relatedQueries?: unknown
        relatedGuides?: unknown
      }

      if (typeof item.query !== "string") return null
      const query = item.query.trim()
      if (!query) return null

      const querySlug = typeof item.querySlug === "string" && item.querySlug ? item.querySlug : toQuerySlug(query)
      const brandMentioned = item.brandMentioned === true || item.likelyMentioned === true
      const responseExcerpt =
        typeof item.responseExcerpt === "string" && item.responseExcerpt.trim()
          ? item.responseExcerpt.trim()
          : sampleMap.get(query.toLowerCase()) || ""

      const brandVisibility = normalizeBrandVisibility(item.brandVisibility, input.competitorVisibility)
      const attributeMentions = normalizeAttributeMentions(item.attributeMentions, input.attributes)

      const relatedQueries = Array.isArray(item.relatedQueries)
        ? item.relatedQueries
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null
              const value = entry as { query?: unknown; querySlug?: unknown }
              if (typeof value.query !== "string") return null
              return {
                query: value.query,
                querySlug:
                  typeof value.querySlug === "string" && value.querySlug ? value.querySlug : toQuerySlug(value.query),
              }
            })
            .filter((entry): entry is { query: string; querySlug: string } => Boolean(entry))
        : []

      const relatedGuides = Array.isArray(item.relatedGuides)
        ? item.relatedGuides
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null
              const value = entry as { title?: unknown; href?: unknown }
              if (typeof value.title !== "string" || typeof value.href !== "string") return null
              return { title: value.title, href: value.href }
            })
            .filter((entry): entry is { title: string; href: string } => Boolean(entry))
        : guides

      return {
        query,
        querySlug,
        brandMentioned,
        responseExcerpt,
        brandVisibility,
        attributeMentions,
        relatedQueries,
        relatedGuides,
      }
    })
    .filter((row): row is QueryEntry => Boolean(row))

  const allQueryLinks = rows.map((row) => ({ query: row.query, querySlug: row.querySlug }))

  return rows.map((row) => ({
    ...row,
    relatedQueries:
      row.relatedQueries.length > 0
        ? row.relatedQueries
        : allQueryLinks.filter((candidate) => candidate.querySlug !== row.querySlug).slice(0, 4),
  }))
}

async function main() {
  const reports = await prisma.aiVisibilityReport.findMany({
    where: { status: "completed" },
    select: {
      id: true,
      category: true,
      buyerQueries: true,
      comparisonQueries: true,
      aiResponseSamples: true,
      competitorVisibility: true,
      attributes: true,
    },
  })

  let updatedCount = 0

  for (const report of reports) {
    const aiResponseSamples = Array.isArray(report.aiResponseSamples)
      ? report.aiResponseSamples
          .map((item) => {
            if (!item || typeof item !== "object") return null
            const row = item as { query?: unknown; excerpt?: unknown }
            if (typeof row.query !== "string" || typeof row.excerpt !== "string") return null
            return { query: row.query, excerpt: row.excerpt }
          })
          .filter((item): item is { query: string; excerpt: string } => Boolean(item))
      : []

    const competitorVisibility = Array.isArray(report.competitorVisibility)
      ? report.competitorVisibility
          .map((item) => {
            if (!item || typeof item !== "object") return null
            const row = item as { brand?: unknown; visibilityPercent?: unknown }
            if (typeof row.brand !== "string") return null
            return {
              brand: row.brand,
              visibilityPercent: typeof row.visibilityPercent === "number" ? row.visibilityPercent : 0,
            }
          })
          .filter((item): item is { brand: string; visibilityPercent: number } => Boolean(item))
      : []

    const attributes = asStringArray(report.attributes)

    const buyerQueries = normalizeQueryEntries({
      raw: report.buyerQueries,
      aiResponseSamples,
      competitorVisibility,
      attributes,
      category: report.category,
    })

    const comparisonQueries = normalizeQueryEntries({
      raw: report.comparisonQueries,
      aiResponseSamples,
      competitorVisibility,
      attributes,
      category: report.category,
    })

    const nextBuyer = JSON.stringify(buyerQueries)
    const nextComparison = JSON.stringify(comparisonQueries)

    if (nextBuyer !== JSON.stringify(report.buyerQueries) || nextComparison !== JSON.stringify(report.comparisonQueries)) {
      await prisma.aiVisibilityReport.update({
        where: { id: report.id },
        data: {
          buyerQueries,
          comparisonQueries,
        },
      })
      updatedCount += 1
    }
  }

  console.log(`AI visibility backfill complete. Updated ${updatedCount} report(s).`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
