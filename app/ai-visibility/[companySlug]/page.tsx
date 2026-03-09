import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AI_VISIBILITY_STATUS, findReportBySlug } from "../../../lib/ai-visibility/repository"
import styles from "./page.module.css"

export const dynamic = "force-dynamic"

type PageProps = {
  params: {
    companySlug: string
  }
}

type BrandPerception = Record<string, Record<string, "high" | "medium" | "low">>

type BuyerQuery = {
  query: string
  likelyMentioned: boolean
}

type ReportInsights = {
  bullets?: string[]
  recommendedActions?: string[]
  sourceSignals?: {
    metaTitlePresent?: boolean
    metaDescriptionPresent?: boolean
    headingCount?: number
    sourcePresence?: number
  }
  productDescription?: string
}

function normalizeLevel(level: string): string {
  if (level === "high") return "High"
  if (level === "medium") return "Medium"
  if (level === "low") return "Low"
  return "Medium"
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const report = await findReportBySlug(params.companySlug)

  if (!report || report.status !== AI_VISIBILITY_STATUS.COMPLETED) {
    return {
      title: "AI Visibility Report",
      description: "AI visibility report is not available.",
    }
  }

  return {
    title: `AI Visibility of ${report.companyName}`,
    description: `How AI systems perceive ${report.companyName} and influence buyer decisions.`,
  }
}

export default async function AiVisibilityReportPage({ params }: PageProps) {
  const report = await findReportBySlug(params.companySlug)

  if (!report || report.status !== AI_VISIBILITY_STATUS.COMPLETED) {
    notFound()
  }

  const competitors = (Array.isArray(report.competitors) ? report.competitors : []) as string[]
  const attributes = (Array.isArray(report.attributes) ? report.attributes : []) as string[]

  const perceptionTable = ((report.perceptionTable || {}) as { associations?: BrandPerception })
    .associations || {}

  const buyerQueries = (Array.isArray(report.buyerQueries) ? report.buyerQueries : []) as BuyerQuery[]
  const insights = (report.insights || {}) as ReportInsights

  const buyerMentions = buyerQueries.filter((item) => item.likelyMentioned).length

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `AI Visibility of ${report.companyName}`,
    description: `How AI systems perceive ${report.companyName} and influence buyer decisions.`,
    datePublished: report.createdAt.toISOString(),
    dateModified: report.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Readable",
    },
  }

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.kicker}>AI Visibility Report</p>
          <h1 className={styles.title}>How AI perceives {report.companyName} and influences buyers</h1>
          <p className={styles.subtitle}>
            Category: {report.category || "Unspecified"} · Last analyzed: {report.lastAnalyzedAt.toLocaleDateString()}
          </p>
          <div className={styles.heroCtas}>
            <button className="btn btn-secondary" type="button">
              Share with team
            </button>
            <Link href="/book-demo" className="btn btn-primary">
              Book AI visibility audit
            </Link>
            <Link href={`/analyze?domain=${encodeURIComponent(report.domain)}&refresh=1`} className="btn btn-secondary">
              Refresh analysis
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>AI Visibility Score</h2>
          <div className={styles.scoreCard}>
            <p className={styles.score}>{report.visibilityScore ?? 0}</p>
            <p className={styles.scoreMeta}>out of 100</p>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2>AI Category Positioning Table</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>{report.companyName}</th>
                  {competitors.map((competitor) => (
                    <th key={competitor}>{competitor}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map((attribute) => (
                  <tr key={attribute}>
                    <td>{attribute}</td>
                    <td>{normalizeLevel(perceptionTable[report.companyName]?.[attribute] || "medium")}</td>
                    {competitors.map((competitor) => (
                      <td key={`${competitor}-${attribute}`}>
                        {normalizeLevel(perceptionTable[competitor]?.[attribute] || "medium")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.nudgeRow}>
            <Link href="/book-demo" className="btn btn-primary">
              Improve AI visibility
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>Buyer Query Influence</h2>
          <p className={styles.subtitle}>
            {report.companyName} is likely to appear in {buyerMentions}/{buyerQueries.length || 0} representative buyer
            queries.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Buyer Query</th>
                  <th>Likely Mentioned</th>
                </tr>
              </thead>
              <tbody>
                {buyerQueries.map((entry) => (
                  <tr key={entry.query}>
                    <td>{entry.query}</td>
                    <td>{entry.likelyMentioned ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2>Sources AI Learns From</h2>
          <div className={styles.grid3}>
            <article className={styles.card}>
              <p className={styles.cardTitle}>Meta title present</p>
              <p>{insights.sourceSignals?.metaTitlePresent ? "Yes" : "No"}</p>
            </article>
            <article className={styles.card}>
              <p className={styles.cardTitle}>Meta description present</p>
              <p>{insights.sourceSignals?.metaDescriptionPresent ? "Yes" : "No"}</p>
            </article>
            <article className={styles.card}>
              <p className={styles.cardTitle}>Heading signal count</p>
              <p>{insights.sourceSignals?.headingCount ?? 0}</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>Recommended Actions</h2>
          <ul className={styles.list}>
            {(insights.recommendedActions || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Perception Insights</h3>
          <ul className={styles.list}>
            {(insights.bullets || []).map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className={styles.endCtaRow}>
            <Link href="/book-demo" className="btn btn-primary">
              Start tracking AI visibility
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
