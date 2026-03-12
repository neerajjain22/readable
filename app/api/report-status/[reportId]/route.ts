import { NextResponse } from "next/server"
import { AI_VISIBILITY_STATUS, findReportStatusById } from "../../../../lib/ai-visibility/repository"

export const dynamic = "force-dynamic"
export const revalidate = 0

function stageFlagsFromReport(report: {
  status: string
  category: string | null
  hasBuyerQueries: boolean
  hasAiResponseSamples: boolean
  hasAttributes: boolean
  hasCompetitors: boolean
  visibilityScore: number | null
  hasInsights: boolean
  hasOpportunities: boolean
  hasRecommendations: boolean
  updatedAt: Date
}) {
  const processingAgeSeconds = Math.max(0, Math.round((Date.now() - report.updatedAt.getTime()) / 1000))
  const done = report.status === AI_VISIBILITY_STATUS.COMPLETED

  return {
    processingAgeSeconds,
    flags: {
      categoryComplete: done || Boolean(report.category),
      queriesComplete: done || report.hasBuyerQueries,
      responsesComplete: done || report.hasAiResponseSamples,
      attributesComplete: done || (report.hasAttributes && report.hasCompetitors),
      visibilityComplete: done || typeof report.visibilityScore === "number",
      insightsComplete:
        done ||
        (report.hasInsights &&
          report.hasOpportunities &&
          report.hasRecommendations),
    },
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { reportId: string } },
) {
  const reportId = (params.reportId || "").trim()
  if (!reportId) {
    return NextResponse.json({ success: false, error: "reportId is required" }, { status: 400 })
  }

  const report = await findReportStatusById(reportId)
  if (!report) {
    return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
  }

  const { flags, processingAgeSeconds } = stageFlagsFromReport(report)

  return NextResponse.json(
    {
      success: true,
      reportId: report.id,
      companySlug: report.companySlug,
      status: report.status,
      processingAgeSeconds,
      updatedAt: report.updatedAt.toISOString(),
      ...flags,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  )
}
