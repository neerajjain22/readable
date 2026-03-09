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
  return prisma.aiVisibilityReport.findUnique({
    where: { companySlug },
  })
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
      perceptionTable: {},
      buyerQueries: [],
      insights: { bullets: [], recommendedActions: [] },
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
