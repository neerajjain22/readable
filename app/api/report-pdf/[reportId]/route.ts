import { readFile } from "fs/promises"
import path from "path"
import { createElement, type ReactElement } from "react"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { renderToBuffer } from "@react-pdf/renderer"
import PdfReportTemplate from "../../../../components/reports/PdfReportTemplate"
import { parseCompetitorVisibility, parsePositioningTable, parseQueryRows, parseResponseSamples, parseStringList } from "../../../../lib/ai-visibility/view-model"
import { AI_VISIBILITY_STATUS, findReportById } from "../../../../lib/ai-visibility/repository"
import { prisma } from "../../../../lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function toDownloadFilename(companySlug: string) {
  return `ai-visibility-report-${companySlug}.pdf`
}

async function readLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "readable-icon.png")
    const logoBuffer = await readFile(logoPath)
    return `data:image/png;base64,${logoBuffer.toString("base64")}`
  } catch {
    return undefined
  }
}

function getDownloadHeaders(companySlug: string, size: number) {
  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${toDownloadFilename(companySlug)}"`,
    "Content-Length": String(size),
    "Cache-Control": "private, no-store, max-age=0",
  }
}

async function fetchPdfBuffer(pdfUrl: string) {
  const response = await fetch(pdfUrl, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Unable to read cached PDF (${response.status}).`)
  }

  const file = await response.arrayBuffer()
  return Buffer.from(file)
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

  if (report.status !== AI_VISIBILITY_STATUS.COMPLETED) {
    return NextResponse.json({ success: false, error: "Report is not ready for PDF download yet." }, { status: 409 })
  }

  if (report.pdfUrl) {
    try {
      const cachedBuffer = await fetchPdfBuffer(report.pdfUrl)
      return new NextResponse(cachedBuffer, {
        status: 200,
        headers: getDownloadHeaders(report.companySlug, cachedBuffer.length),
      })
    } catch {
      // Continue with regeneration if the cached location is no longer readable.
    }
  }

  const logoDataUri = await readLogoDataUri()
  const templateElement = createElement(PdfReportTemplate, {
    companyName: report.companyName,
    companySlug: report.companySlug,
    category: report.category,
    visibilityScore: report.visibilityScore,
    generatedAt: report.lastAnalyzedAt.toISOString(),
    logoDataUri,
    insights: parseStringList(report.insights),
    opportunities: parseStringList(report.opportunities),
    recommendations: parseStringList(report.recommendations),
    buyerQueries: parseQueryRows(report.buyerQueries),
    comparisonQueries: parseQueryRows(report.comparisonQueries),
    responseSamples: parseResponseSamples(report.aiResponseSamples).slice(0, 12),
    competitorVisibility: parseCompetitorVisibility(report.competitorVisibility),
    positioningRows: parsePositioningTable({
      companyName: report.companyName,
      attributes: report.attributes,
      competitors: report.competitors,
      perceptionEvidence: report.perceptionEvidence,
    }),
  }) as unknown as ReactElement

  const pdfBuffer = await renderToBuffer(
    templateElement,
  )

  const blob = await put(`reports/${report.id}.pdf`, pdfBuffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/pdf",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  await prisma.aiVisibilityReport.update({
    where: {
      id: report.id,
    },
    data: {
      pdfUrl: blob.url,
    },
  })

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: getDownloadHeaders(report.companySlug, pdfBuffer.length),
  })
}
