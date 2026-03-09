import { toQuerySlug } from "./domain"

export type QueryRow = {
  query: string
  querySlug: string
  brandMentioned: boolean
}

export type ResponseSample = {
  query: string
  excerpt: string
}

export type CompetitorVisibilityRow = {
  brand: string
  visibilityPercent: number
}

export type PositioningRow = {
  attribute: string
  brands: Array<{ brand: string; label: "Strong" | "Moderate" | "Limited" }>
}

export type QueryRecord = {
  query: string
  querySlug: string
  responseExcerpt: string
  brandVisibility: Array<{ brand: string; brandSlug: string; visibilityPercent: number }>
  attributeMentions: Array<{ attribute: string; mentionPercent: number }>
  relatedQueries: Array<{ query: string; querySlug: string }>
  relatedGuides: Array<{ title: string; href: string }>
}

export function toPercent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`
}

export function scoreLabel(percent: number): "Strong" | "Moderate" | "Limited" {
  if (percent >= 65) return "Strong"
  if (percent >= 35) return "Moderate"
  return "Limited"
}

export function parseQueryRows(raw: unknown): QueryRow[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as { query?: unknown; querySlug?: unknown; brandMentioned?: unknown; likelyMentioned?: unknown }
      if (typeof row.query !== "string") return null

      return {
        query: row.query,
        querySlug: typeof row.querySlug === "string" && row.querySlug.trim() ? row.querySlug : toQuerySlug(row.query),
        brandMentioned: row.brandMentioned === true || row.likelyMentioned === true,
      }
    })
    .filter((item): item is QueryRow => Boolean(item))
}

export function parseResponseSamples(raw: unknown): ResponseSample[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as { query?: unknown; excerpt?: unknown }
      if (typeof row.query !== "string" || typeof row.excerpt !== "string") return null
      return { query: row.query, excerpt: row.excerpt }
    })
    .filter((item): item is ResponseSample => Boolean(item))
}

export function parseCompetitorVisibility(raw: unknown): CompetitorVisibilityRow[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as { brand?: unknown; visibilityPercent?: unknown }
      if (typeof row.brand !== "string") return null
      return {
        brand: row.brand,
        visibilityPercent: typeof row.visibilityPercent === "number" ? row.visibilityPercent : 0,
      }
    })
    .filter((item): item is CompetitorVisibilityRow => Boolean(item))
}

export function parseStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
  }

  if (raw && typeof raw === "object") {
    const maybeBullets = (raw as { bullets?: unknown; recommendedActions?: unknown }).bullets
    if (Array.isArray(maybeBullets)) {
      return maybeBullets.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    }

    const maybeActions = (raw as { recommendedActions?: unknown }).recommendedActions
    if (Array.isArray(maybeActions)) {
      return maybeActions.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    }
  }

  return []
}

export function parsePositioningTable(report: {
  companyName: string
  attributes: unknown
  competitors: unknown
  perceptionEvidence: unknown
}): PositioningRow[] {
  const attributes = Array.isArray(report.attributes)
    ? report.attributes.filter((item): item is string => typeof item === "string")
    : []

  const competitors = Array.isArray(report.competitors)
    ? report.competitors.filter((item): item is string => typeof item === "string").slice(0, 3)
    : []

  const evidence = report.perceptionEvidence as
    | {
        target?: Array<{ attribute?: string; associationPercent?: number }>
        competitors?: Array<{ brand?: string; attributes?: Array<{ attribute?: string; associationPercent?: number }> }>
      }
    | undefined

  const targetMap = new Map<string, number>()
  for (const row of evidence?.target || []) {
    if (typeof row.attribute === "string") {
      targetMap.set(row.attribute, typeof row.associationPercent === "number" ? row.associationPercent : 0)
    }
  }

  const competitorMap = new Map<string, Map<string, number>>()
  for (const competitor of evidence?.competitors || []) {
    if (!competitor || typeof competitor.brand !== "string") continue
    const map = new Map<string, number>()
    for (const row of competitor.attributes || []) {
      if (typeof row.attribute === "string") {
        map.set(row.attribute, typeof row.associationPercent === "number" ? row.associationPercent : 0)
      }
    }
    competitorMap.set(competitor.brand, map)
  }

  return attributes.map((attribute) => ({
    attribute,
    brands: [
      { brand: report.companyName, label: scoreLabel(targetMap.get(attribute) || 0) },
      ...competitors.map((competitor) => ({
        brand: competitor,
        label: scoreLabel(competitorMap.get(competitor)?.get(attribute) || 0),
      })),
    ],
  }))
}

export function normalizeQueryRecords(raw: unknown): QueryRecord[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as {
        query?: unknown
        querySlug?: unknown
        responseExcerpt?: unknown
        brandVisibility?: unknown
        attributeMentions?: unknown
        relatedQueries?: unknown
        relatedGuides?: unknown
      }

      if (typeof row.query !== "string") return null
      const querySlug = typeof row.querySlug === "string" && row.querySlug.trim() ? row.querySlug : toQuerySlug(row.query)

      const brandVisibility = Array.isArray(row.brandVisibility)
        ? row.brandVisibility
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null
              const value = entry as { brand?: unknown; brandSlug?: unknown; visibilityPercent?: unknown }
              if (typeof value.brand !== "string" || typeof value.brandSlug !== "string") return null
              return {
                brand: value.brand,
                brandSlug: value.brandSlug,
                visibilityPercent: typeof value.visibilityPercent === "number" ? value.visibilityPercent : 0,
              }
            })
            .filter((entry): entry is { brand: string; brandSlug: string; visibilityPercent: number } => Boolean(entry))
        : []

      const attributeMentions = Array.isArray(row.attributeMentions)
        ? row.attributeMentions
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null
              const value = entry as { attribute?: unknown; mentionPercent?: unknown }
              if (typeof value.attribute !== "string") return null
              return {
                attribute: value.attribute,
                mentionPercent: typeof value.mentionPercent === "number" ? value.mentionPercent : 0,
              }
            })
            .filter((entry): entry is { attribute: string; mentionPercent: number } => Boolean(entry))
        : []

      const relatedQueries = Array.isArray(row.relatedQueries)
        ? row.relatedQueries
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null
              const value = entry as { query?: unknown; querySlug?: unknown }
              if (typeof value.query !== "string" || typeof value.querySlug !== "string") return null
              return { query: value.query, querySlug: value.querySlug }
            })
            .filter((entry): entry is { query: string; querySlug: string } => Boolean(entry))
        : []

      const relatedGuides = Array.isArray(row.relatedGuides)
        ? row.relatedGuides
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null
              const value = entry as { title?: unknown; href?: unknown }
              if (typeof value.title !== "string" || typeof value.href !== "string") return null
              return { title: value.title, href: value.href }
            })
            .filter((entry): entry is { title: string; href: string } => Boolean(entry))
        : []

      return {
        query: row.query,
        querySlug,
        responseExcerpt: typeof row.responseExcerpt === "string" ? row.responseExcerpt : "",
        brandVisibility,
        attributeMentions,
        relatedQueries,
        relatedGuides,
      }
    })
    .filter((entry): entry is QueryRecord => Boolean(entry))
}

export function aggregateBrandVisibility(records: QueryRecord[]) {
  const totals = new Map<string, { brand: string; brandSlug: string; sum: number; count: number }>()

  for (const record of records) {
    for (const item of record.brandVisibility) {
      const key = item.brandSlug
      const current = totals.get(key) || { brand: item.brand, brandSlug: item.brandSlug, sum: 0, count: 0 }
      current.sum += item.visibilityPercent
      current.count += 1
      totals.set(key, current)
    }
  }

  return Array.from(totals.values())
    .map((item) => ({
      brand: item.brand,
      brandSlug: item.brandSlug,
      visibilityPercent: item.count > 0 ? Math.round(item.sum / item.count) : 0,
    }))
    .sort((a, b) => b.visibilityPercent - a.visibilityPercent)
}

export function aggregateAttributeMentions(records: QueryRecord[]) {
  const totals = new Map<string, { attribute: string; sum: number; count: number }>()

  for (const record of records) {
    for (const item of record.attributeMentions) {
      const current = totals.get(item.attribute) || { attribute: item.attribute, sum: 0, count: 0 }
      current.sum += item.mentionPercent
      current.count += 1
      totals.set(item.attribute, current)
    }
  }

  return Array.from(totals.values())
    .map((item) => ({
      attribute: item.attribute,
      mentionPercent: item.count > 0 ? Math.round(item.sum / item.count) : 0,
    }))
    .sort((a, b) => b.mentionPercent - a.mentionPercent)
}
