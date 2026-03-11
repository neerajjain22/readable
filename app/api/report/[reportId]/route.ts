import { NextResponse } from "next/server"
import { findReportById } from "../../../../lib/ai-visibility/repository"

export const dynamic = "force-dynamic"
export const revalidate = 0

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

  return NextResponse.json(
    {
      success: true,
      report: {
        id: report.id,
        companySlug: report.companySlug,
        companyName: report.companyName,
        category: report.category,
        visibilityScore: report.visibilityScore,
        competitors: report.competitors,
        attributes: report.attributes,
        buyerQueries: report.buyerQueries,
        comparisonQueries: report.comparisonQueries,
        perceptionEvidence: report.perceptionEvidence,
        competitorVisibility: report.competitorVisibility,
        aiResponseSamples: report.aiResponseSamples,
        insights: report.insights,
        opportunities: report.opportunities,
        recommendations: report.recommendations,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
        lastAnalyzedAt: report.lastAnalyzedAt.toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  )
}
