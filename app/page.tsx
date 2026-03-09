import type { Metadata } from "next"
import HomePage from "../legacy-pages/index"
import { getRecentCompletedReports } from "../lib/ai-visibility/repository"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Readable | AI Influence & Agent Analytics Platform",
  description:
    "Monitor how AI systems describe your brand, measure agent traffic, and optimize pages for AI-driven conversion.",
}

export default async function Page() {
  const recentReports = await getRecentCompletedReports(6)
  return (
    <HomePage
      recentReports={recentReports.map((report: (typeof recentReports)[number]) => ({
        ...report,
        lastAnalyzedAt: report.lastAnalyzedAt.toISOString(),
      }))}
    />
  )
}
