import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AI_VISIBILITY_STATUS, findReportBySlug } from "../../../lib/ai-visibility/repository"
import ProgressiveReport from "./ProgressiveReport.client"

type PageProps = {
  params: {
    companySlug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const report = await findReportBySlug(params.companySlug)

  if (!report) {
    return {
      title: "AI Visibility Report",
      description: "AI visibility report is not available.",
    }
  }

  const companyName = report.companyName || "Company"
  return {
    title: `AI Visibility of ${companyName}`,
    description: `How AI systems perceive ${companyName} and influence buyer decisions.`,
  }
}

export default async function AiVisibilityReportPage({ params }: PageProps) {
  const report = await findReportBySlug(params.companySlug)

  if (!report) {
    notFound()
  }

  const reportPayload = {
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
  }

  const structuredData =
    report.status === AI_VISIBILITY_STATUS.COMPLETED
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `AI Visibility of ${report.companyName}`,
          description: `How AI systems perceive ${report.companyName} and influence buyer decisions.`,
          datePublished: report.createdAt.toISOString(),
          dateModified: report.updatedAt.toISOString(),
        }
      : null

  return (
    <>
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      ) : null}
      <ProgressiveReport initialReport={reportPayload} />
    </>
  )
}
