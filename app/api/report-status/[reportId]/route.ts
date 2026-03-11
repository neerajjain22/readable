import { NextResponse } from "next/server"
import { AI_VISIBILITY_STATUS, findReportById } from "../../../../lib/ai-visibility/repository"

export const dynamic = "force-dynamic"
export const revalidate = 0

function hasArrayContent(raw: unknown) {
  return Array.isArray(raw) && raw.length > 0
}

function stageFlagsFromReport(report: {
  status: string
  category: string | null
  buyerQueries: unknown
  aiResponseSamples: unknown
  attributes: unknown
  competitors: unknown
  visibilityScore: number | null
  insights: unknown
  opportunities: unknown
  recommendations: unknown
  updatedAt: Date
}) {
  const processingAgeSeconds = Math.max(0, Math.round((Date.now() - report.updatedAt.getTime()) / 1000))
  const done = report.status === AI_VISIBILITY_STATUS.COMPLETED

  return {
    processingAgeSeconds,
    flags: {
      categoryComplete: done || Boolean(report.category),
      queriesComplete: done || hasArrayContent(report.buyerQueries),
      responsesComplete: done || hasArrayContent(report.aiResponseSamples),
      attributesComplete: done || (hasArrayContent(report.attributes) && hasArrayContent(report.competitors)),
      visibilityComplete: done || typeof report.visibilityScore === "number",
      insightsComplete:
        done ||
        (hasArrayContent(report.insights) &&
          hasArrayContent(report.opportunities) &&
          hasArrayContent(report.recommendations)),
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

  const report = await findReportById(reportId)
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
