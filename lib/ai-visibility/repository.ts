import { prisma } from "../prisma"

export const AI_VISIBILITY_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

export type AiVisibilityStatus = (typeof AI_VISIBILITY_STATUS)[keyof typeof AI_VISIBILITY_STATUS]

export async function findReportByDomainOrSlug(domain: string, companySlug: string) {
  return prisma.aiVisibilityReport.findFirst({
    where: {
      OR: [{ domain }, { companySlug }],
    },
  })
}

export async function findReportBySlug(companySlug: string) {
  const exact = await prisma.aiVisibilityReport.findUnique({
    where: { companySlug },
  })

  if (exact) {
    return exact
  }

  // Backward-compatible fallback for legacy slug routes such as /ai-visibility/linear.
  // If there is a single deterministic match with a TLD suffix, resolve to that report.
  const prefixed = await prisma.aiVisibilityReport.findMany({
    where: {
      companySlug: {
        startsWith: `${companySlug}-`,
      },
    },
    orderBy: {
      lastAnalyzedAt: "desc",
    },
    take: 2,
  })

  if (prefixed.length === 1) {
    return prefixed[0]
  }

  return null
}

export async function findReportById(reportId: string) {
  return prisma.aiVisibilityReport.findUnique({
    where: { id: reportId },
  })
}

export async function findReportStatusById(reportId: string) {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string
      companySlug: string
      status: string
      updatedAt: Date
      category: string | null
      visibilityScore: number | null
      hasBuyerQueries: boolean
      hasAiResponseSamples: boolean
      hasAttributes: boolean
      hasCompetitors: boolean
      hasInsights: boolean
      hasOpportunities: boolean
      hasRecommendations: boolean
    }>
  >`
    SELECT
      id,
      "companySlug",
      status,
      "updatedAt",
      category,
      "visibilityScore",
      CASE WHEN jsonb_typeof("buyerQueries") = 'array' AND jsonb_array_length("buyerQueries") > 0 THEN true ELSE false END AS "hasBuyerQueries",
      CASE WHEN jsonb_typeof("aiResponseSamples") = 'array' AND jsonb_array_length("aiResponseSamples") > 0 THEN true ELSE false END AS "hasAiResponseSamples",
      CASE WHEN jsonb_typeof(attributes) = 'array' AND jsonb_array_length(attributes) > 0 THEN true ELSE false END AS "hasAttributes",
      CASE WHEN jsonb_typeof(competitors) = 'array' AND jsonb_array_length(competitors) > 0 THEN true ELSE false END AS "hasCompetitors",
      CASE WHEN jsonb_typeof(insights) = 'array' AND jsonb_array_length(insights) > 0 THEN true ELSE false END AS "hasInsights",
      CASE WHEN jsonb_typeof(opportunities) = 'array' AND jsonb_array_length(opportunities) > 0 THEN true ELSE false END AS "hasOpportunities",
      CASE WHEN jsonb_typeof(recommendations) = 'array' AND jsonb_array_length(recommendations) > 0 THEN true ELSE false END AS "hasRecommendations"
    FROM "AiVisibilityReport"
    WHERE id = ${reportId}
    LIMIT 1
  `

  return rows[0] || null
}

export async function upsertProcessingReport(input: {
  domain: string
  companySlug: string
  companyName: string
}) {
  return prisma.aiVisibilityReport.upsert({
    where: { domain: input.domain },
    update: {
      companySlug: input.companySlug,
      companyName: input.companyName,
      status: AI_VISIBILITY_STATUS.PROCESSING,
      updatedAt: new Date(),
    },
    create: {
      domain: input.domain,
      companySlug: input.companySlug,
      companyName: input.companyName,
      category: null,
      visibilityScore: null,
      competitors: [],
      attributes: [],
      buyerQueries: [],
      comparisonQueries: [],
      perceptionEvidence: {},
      competitorVisibility: [],
      aiResponseSamples: [],
      insights: [],
      opportunities: [],
      recommendations: [],
      perceptionTable: {},
      status: AI_VISIBILITY_STATUS.PROCESSING,
      lastAnalyzedAt: new Date(0),
    },
  })
}

export async function markReportFailed(reportId: string) {
  return prisma.aiVisibilityReport.update({
    where: { id: reportId },
    data: {
      status: AI_VISIBILITY_STATUS.FAILED,
      updatedAt: new Date(),
    },
  })
}

export async function touchProcessingReport(reportId: string) {
  return prisma.aiVisibilityReport.updateMany({
    where: {
      id: reportId,
      status: AI_VISIBILITY_STATUS.PROCESSING,
    },
    data: {
      updatedAt: new Date(),
    },
  })
}

export async function claimNextProcessingReport(input?: {
  companySlug?: string
  staleBefore?: Date
  ignoreStaleWindow?: boolean
}) {
  const staleBefore = input?.staleBefore ?? new Date()
  const companySlug = input?.companySlug
  const ignoreStaleWindow = Boolean(input?.ignoreStaleWindow)

  return prisma.$transaction(async (tx) => {
    const where = {
      status: AI_VISIBILITY_STATUS.PROCESSING,
      ...(companySlug ? { companySlug } : {}),
      ...(ignoreStaleWindow ? {} : { updatedAt: { lte: staleBefore } }),
    }

    const candidate = await tx.aiVisibilityReport.findFirst({
      where,
      select: {
        id: true,
        domain: true,
        companySlug: true,
      },
      orderBy: {
        updatedAt: "asc",
      },
    })

    if (!candidate) {
      return null
    }

    const claimed = await tx.aiVisibilityReport.updateMany({
      where: {
        id: candidate.id,
        status: AI_VISIBILITY_STATUS.PROCESSING,
        ...(ignoreStaleWindow ? {} : { updatedAt: { lte: staleBefore } }),
      },
      data: {
        updatedAt: new Date(),
      },
    })

    if (claimed.count === 0) {
      return null
    }

    return candidate
  })
}

export async function getRecentCompletedReports(limit: number) {
  return prisma.aiVisibilityReport.findMany({
    where: {
      status: AI_VISIBILITY_STATUS.COMPLETED,
    },
    select: {
      companySlug: true,
      companyName: true,
      visibilityScore: true,
      lastAnalyzedAt: true,
      domain: true,
      category: true,
    },
    orderBy: {
      lastAnalyzedAt: "desc",
    },
    take: limit,
  })
}

export async function getRecentCompletedReportsPage(input: { page: number; pageSize: number }) {
  const page = Math.max(1, Math.floor(input.page))
  const pageSize = Math.max(1, Math.floor(input.pageSize))
  const skip = (page - 1) * pageSize

  const [total, reports] = await prisma.$transaction([
    prisma.aiVisibilityReport.count({
      where: {
        status: AI_VISIBILITY_STATUS.COMPLETED,
      },
    }),
    prisma.aiVisibilityReport.findMany({
      where: {
        status: AI_VISIBILITY_STATUS.COMPLETED,
      },
      select: {
        companySlug: true,
        companyName: true,
        visibilityScore: true,
        lastAnalyzedAt: true,
        domain: true,
        category: true,
      },
      orderBy: {
        lastAnalyzedAt: "desc",
      },
      skip,
      take: pageSize,
    }),
  ])

  return { total, reports }
}

export async function getCompletedReportsWithQueryData(limit = 500) {
  return prisma.aiVisibilityReport.findMany({
    where: {
      status: AI_VISIBILITY_STATUS.COMPLETED,
    },
    select: {
      companySlug: true,
      companyName: true,
      category: true,
      buyerQueries: true,
      comparisonQueries: true,
      attributes: true,
      competitors: true,
      insights: true,
      aiResponseSamples: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  })
}

export async function getCompletedReportSlugs(limit = 1000) {
  const rows = await prisma.aiVisibilityReport.findMany({
    where: {
      status: AI_VISIBILITY_STATUS.COMPLETED,
    },
    select: {
      companySlug: true,
    },
    take: limit,
  })

  return rows.map((row) => row.companySlug)
}
