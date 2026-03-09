import { NextResponse } from "next/server"
import { findReportBySlug } from "../../../../lib/ai-visibility/repository"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const companySlug = (searchParams.get("companySlug") || "").trim().toLowerCase()

  if (!companySlug) {
    return NextResponse.json({ success: false, error: "companySlug is required" }, { status: 400 })
  }

  const report = await findReportBySlug(companySlug)

  if (!report) {
    return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    status: report.status,
    companySlug: report.companySlug,
    lastAnalyzedAt: report.lastAnalyzedAt,
  })
}
