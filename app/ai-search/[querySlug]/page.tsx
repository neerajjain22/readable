import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCompletedReportsWithQueryData } from "../../../lib/ai-visibility/repository"
import { aggregateAttributeMentions, aggregateBrandVisibility, normalizeQueryRecords, toPercent } from "../../../lib/ai-visibility/view-model"
import styles from "./page.module.css"

type PageProps = {
  params: {
    querySlug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const reports = await getCompletedReportsWithQueryData(600)
  const all = reports.flatMap((report) => [
    ...normalizeQueryRecords(report.buyerQueries),
    ...normalizeQueryRecords(report.comparisonQueries),
  ])
  const matches = all.filter((item) => item.querySlug === params.querySlug)

  if (matches.length === 0) {
    return {
      title: "AI Search Query",
      description: "AI visibility query page is not available.",
    }
  }

  const query = matches[0].query

  return {
    title: `How AI answers: ${query}`,
    description: `See how AI assistants respond to "${query}" and which brands appear most often.`,
  }
}

export default async function AiSearchQueryPage({ params }: PageProps) {
  const reports = await getCompletedReportsWithQueryData(600)
  const availableReportSlugs = new Set(reports.map((report) => report.companySlug))

  const allRecords = reports.flatMap((report) => [
    ...normalizeQueryRecords(report.buyerQueries),
    ...normalizeQueryRecords(report.comparisonQueries),
  ])

  const queryRecords = allRecords.filter((item) => item.querySlug === params.querySlug)

  if (queryRecords.length === 0) {
    notFound()
  }

  const queryText = queryRecords[0].query

  const responseCards = queryRecords
    .map((item) => ({ query: item.query, excerpt: item.responseExcerpt }))
    .filter((item) => item.excerpt)
    .slice(0, 4)

  const brandVisibility = aggregateBrandVisibility(queryRecords)
  const topBrands = brandVisibility.slice(0, 3)
  const attributeMentions = aggregateAttributeMentions(queryRecords)

  const relatedQueries = Array.from(
    new Map(
      queryRecords
        .flatMap((item) => item.relatedQueries)
        .filter((item) => item.querySlug !== params.querySlug)
        .map((item) => [item.querySlug, item]),
    ).values(),
  ).slice(0, 6)

  const topAttribute = attributeMentions[0]?.attribute || "core capabilities"
  const secondAttribute = attributeMentions[1]?.attribute || "buyer fit"

  const narrative =
    topBrands.length > 0
      ? `AI assistants frequently emphasize ${topAttribute} and ${secondAttribute} when answering this query. ${topBrands
          .map((item) => item.brand)
          .join(", ")} appear most often across sampled responses.`
      : `AI assistants emphasize ${topAttribute} and ${secondAttribute} patterns when answering this query.`

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.kicker}>AI Search Intelligence</p>
          <h1 className={styles.title}>How AI answers: {queryText}</h1>
          <p className={styles.subtitle}>See how AI assistants respond when buyers search for this question.</p>
          {topBrands.length > 0 ? (
            <p className={styles.subtle}>
              AI visibility leaders for this query: {topBrands.map((item) => item.brand).join(", ")}
            </p>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>AI Assistant Responses</h2>
          <div className={styles.grid}>
            {responseCards.map((item, index) => (
              <article key={`${item.query}-${index}`} className={styles.card}>
                <p className={styles.cardTitle}>{item.query}</p>
                <p>{item.excerpt}</p>
              </article>
            ))}
          </div>
          <p className={styles.subtle}>
            These responses represent sample outputs from AI assistants. Readable&apos;s analysis evaluates a much
            broader set of AI interactions.
          </p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2>Brand Visibility for this Query</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>AI Visibility %</th>
                </tr>
              </thead>
              <tbody>
                {brandVisibility.map((row) => (
                  <tr key={row.brandSlug}>
                    <td>{row.brand}</td>
                    <td>{toPercent(row.visibilityPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.subtle}>
            AI visibility measures how frequently each brand appears in AI assistant responses for this query.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>AI Recommendation Patterns</h2>
          <p className={styles.lead}>{narrative}</p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2>Common Attributes Mentioned</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Mention Frequency %</th>
                </tr>
              </thead>
              <tbody>
                {attributeMentions.map((row) => (
                  <tr key={row.attribute}>
                    <td>{row.attribute}</td>
                    <td>{toPercent(row.mentionPercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>Brands Frequently Mentioned</h2>
          <div className={styles.brandGrid}>
            {topBrands.map((brand) => (
              <article className={styles.brandCard} key={brand.brandSlug}>
                <h3>{brand.brand}</h3>
                <p>{toPercent(brand.visibilityPercent)} AI visibility</p>
                {availableReportSlugs.has(brand.brandSlug) ? (
                  <Link href={`/ai-visibility/${brand.brandSlug}`} className={styles.inlineLink}>
                    View brand report →
                  </Link>
                ) : (
                  <span className={styles.subtle}>Brand report coming soon</span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2>Related AI Search Queries</h2>
          <ul className={styles.list}>
            {relatedQueries.map((item) => (
              <li key={item.querySlug}>
                <Link href={`/ai-search/${item.querySlug}`} className={styles.inlineLink}>
                  {item.query}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2>AI Discovery Insight</h2>
          <p className={styles.lead}>
            AI assistants increasingly influence how buyers shortlist vendors. If your brand does not appear in
            responses to queries like this, potential customers may never discover your product.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>Understand how AI recommends your brand</h2>
          <p className={styles.lead}>
            Readable analyzes thousands of AI assistant responses to understand how brands appear in AI-driven
            discovery.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/analyze" className="btn btn-secondary">
              Analyze your brand
            </Link>
            <Link href="/book-demo" className="btn btn-primary">
              Book a demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
