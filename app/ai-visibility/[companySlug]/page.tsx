import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AI_VISIBILITY_STATUS, findReportBySlug } from "../../../lib/ai-visibility/repository"
import { parseCompetitorVisibility, parsePositioningTable, parseQueryRows, parseResponseSamples, parseStringList, toPercent } from "../../../lib/ai-visibility/view-model"
import ReportActions from "./ReportActions.client"
import styles from "./page.module.css"

type PageProps = {
  params: {
    companySlug: string
  }
}

function formatDate(date: Date) {
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  const day = `${date.getUTCDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function InfoHint({ text }: { text: string }) {
  return (
    <span className={styles.infoHint} aria-label={text} tabIndex={0}>
      i<span className={styles.tooltip}>{text}</span>
    </span>
  )
}

function highlightBrand(text: string, brand: string) {
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escaped})`, "ig")
  return text.split(regex).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  )
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

  const visibilityScore = report.visibilityScore ?? 0
  const buyerQueries = parseQueryRows(report.buyerQueries)
  const responseSamples = parseResponseSamples(report.aiResponseSamples).slice(0, 4)
  const competitorVisibility = parseCompetitorVisibility(report.competitorVisibility)
  const insights = parseStringList(report.insights)
  const opportunities = parseStringList(report.opportunities)
  const positioningRows = parsePositioningTable(report)

  const topCompetitors = competitorVisibility
    .filter((item) => item.brand !== report.companyName)
    .sort((a, b) => b.visibilityPercent - a.visibilityPercent)
    .slice(0, 3)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `AI Visibility of ${report.companyName}`,
    description: `How AI systems perceive ${report.companyName} and influence buyer decisions.`,
    datePublished: report.createdAt.toISOString(),
    dateModified: report.updatedAt.toISOString(),
  }

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.kicker}>AI Visibility Intelligence</p>
          <h1 className={styles.title}>How AI perceives {report.companyName} and influences buyers</h1>
          <p className={styles.subtitle}>Category: {report.category || "Software"} · Last analyzed: {formatDate(report.lastAnalyzedAt)}</p>
          <div className={styles.heroCtas}>
            <ReportActions />
            <Link href="/book-demo" className="btn btn-primary">
              Book AI visibility audit
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            AI Visibility Score <InfoHint text="Likelihood of being surfaced in AI assistant product recommendations." />
          </h2>
          <div className={styles.scorePanel}>
            <div>
              <p className={styles.scoreValue}>{visibilityScore}</p>
              <p className={styles.scoreSub}>out of 100</p>
              <p className={styles.lead}>
                Companies with higher scores are more likely to appear in AI-driven product discovery.
              </p>
            </div>
            <div>
              <Link href="/book-demo" className="btn btn-secondary">
                Learn how this score is calculated
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            AI Category Positioning Table <InfoHint text="How strongly AI responses associate each brand with core buyer attributes." />
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Attribute</th>
                  {positioningRows[0]?.brands.map((brand) => (
                    <th key={brand.brand}>{brand.brand}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positioningRows.map((row, rowIndex) => (
                  <tr key={`${row.attribute}-${rowIndex}`}>
                    <td>{row.attribute}</td>
                    {row.brands.map((brand) => (
                      <td key={`${row.attribute}-${brand.brand}`}>{brand.label}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Buyer Query Evidence <InfoHint text="Sample buyer prompts used to evaluate AI brand mention patterns." />
          </h2>
          <p className={styles.lead}>
            The queries below are sample buyer prompts analyzed in this report. Readable evaluates a much broader set
            of AI interactions during full analysis.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Query</th>
                  <th>AI Mentions Brand</th>
                </tr>
              </thead>
              <tbody>
                {buyerQueries.map((entry, index) => (
                  <tr key={`${entry.querySlug}-${index}`}>
                    <td>
                      <Link href={`/ai-search/${entry.querySlug}`} className={styles.inlineLink}>
                        {entry.query}
                      </Link>
                    </td>
                    <td>{entry.brandMentioned ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            AI Response Examples <InfoHint text="Representative excerpts from AI assistant outputs analyzed in this report." />
          </h2>
          <div className={styles.grid3}>
            {responseSamples.map((sample, index) => (
              <article className={styles.card} key={`${sample.query}-${index}`}>
                <p className={styles.cardTitle}>{sample.query}</p>
                <p>{highlightBrand(sample.excerpt, report.companyName)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Competitor Visibility <InfoHint text="Share of analyzed AI responses in which each brand is mentioned." />
          </h2>
          <p className={styles.lead}>
            AI assistants frequently recommend competing tools in {report.category || "software"} discussions.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>AI Visibility %</th>
                </tr>
              </thead>
              <tbody>
                {competitorVisibility.map((row, index) => (
                  <tr key={`${row.brand}-${index}`}>
                    <td>{row.brand}</td>
                    <td>{toPercent(row.visibilityPercent)}</td>
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

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            AI Comparison Positioning <InfoHint text="How AI assistants differentiate brands in side-by-side recommendations." />
          </h2>
          <ul className={styles.list}>
            {insights.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Visibility Opportunities <InfoHint text="Important AI recommendation conversations where your brand is less visible." />
          </h2>
          <p className={styles.lead}>{report.companyName} is rarely mentioned in discussions about:</p>
          <ul className={styles.list}>
            {opportunities.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            How This Analysis Works <InfoHint text="Method summary for how Readable evaluates AI visibility signals." />
          </h2>
          <p className={styles.lead}>
            Readable analyzes how AI assistants respond to representative buyer queries and how brands are described
            within those responses.
          </p>
          <p className={styles.subtle}>This report includes only a small sample of the prompts analyzed.</p>
          <div className={styles.endCtaRow}>
            <Link href="/book-demo" className="btn btn-secondary">
              Learn the methodology
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            AI Discovery Risk <InfoHint text="Business risk if AI assistants do not associate your brand with key category criteria." />
          </h2>
          <p className={styles.lead}>
            Buyers increasingly rely on AI assistants to shortlist vendors. If AI systems do not associate your brand
            with critical category attributes, you may never appear in those recommendations.
          </p>
          {topCompetitors.length > 0 ? (
            <p className={styles.subtle}>
              Current visibility leaders in this category: {topCompetitors.map((item) => item.brand).join(", ")}.
            </p>
          ) : null}
          <div className={styles.endCtaRow}>
            <p className={styles.lead}>Readable can help implement these improvements with no effort from your team.</p>
            <Link href="/book-demo" className="btn btn-primary">
              Book a free demo to get started
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
