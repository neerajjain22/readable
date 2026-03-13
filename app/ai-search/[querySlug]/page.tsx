import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAiSearchPageDataByQuerySlug, getAiSearchQueryTextBySlug } from "../../../lib/ai-visibility/repository"
import { aggregateAttributeMentions, aggregateBrandVisibility, normalizeQueryRecords, toPercent } from "../../../lib/ai-visibility/view-model"
import styles from "./page.module.css"

type PageProps = {
  params: {
    querySlug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const query = await getAiSearchQueryTextBySlug(params.querySlug)
  if (!query) {
    return {
      title: "AI Search Query",
      description: "AI visibility query page is not available.",
    }
  }

  return {
    title: `How AI Answers: ${query}`,
    description: `See how AI assistants answer the question "${query}" and which platforms appear most frequently in those responses.`,
  }
}

export default async function AiSearchQueryPage({ params }: PageProps) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tryreadable.ai").replace(/\/+$/, "")
  const pageData = await getAiSearchPageDataByQuerySlug(params.querySlug)
  if (!pageData) {
    notFound()
  }

  const queryRecords = normalizeQueryRecords(pageData.records)
  if (queryRecords.length === 0) {
    notFound()
  }

  const queryText = queryRecords[0].query
  const relatedReportCategories = pageData.reportCategories
  const availableReportSlugs = new Set(pageData.availableReportSlugs)

  const category = relatedReportCategories[0] || "software"

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

  const topAttributesText = attributeMentions
    .slice(0, 2)
    .map((item) => item.attribute)
    .join(" and ")
  const topBrandsText = topBrands.map((item) => item.brand).join(", ")
  const responseInterpretation =
    topBrands.length > 0
      ? `AI assistants often emphasize ${topAttributesText || "core evaluation criteria"} when answering this query. Platforms such as ${topBrandsText} appear most frequently because they are associated with these capabilities.`
      : `AI assistants often emphasize ${topAttributesText || "core evaluation criteria"} when answering this query and prioritize products linked to these capabilities.`

  const brandSummaries = topBrands.map((brand, index) => {
    const brandTopAttribute = attributeMentions[index % Math.max(attributeMentions.length, 1)]?.attribute
    const reason =
      brand.visibilityPercent >= 60
        ? "frequently surfaces"
        : brand.visibilityPercent >= 35
          ? "appears consistently"
          : "shows up in selected answers"

    return {
      ...brand,
      summary: `${brand.brand} is presented as a ${category.toLowerCase()} option and ${reason} for this query. AI responses most often connect ${brand.brand} with ${
        brandTopAttribute || topAttributesText || "core product capabilities"
      }, which drives recommendation frequency.`,
    }
  })

  const faqItems = relatedQueries.slice(0, 3).map((item) => ({
    question: item.query,
    answer: `For "${item.query}", AI assistants usually prioritize ${topAttributesText || "core evaluation criteria"} when comparing ${category.toLowerCase()} options. The strongest recommendations tend to go to platforms that are repeatedly associated with these capabilities across responses.`,
  }))

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `How AI Answers: ${queryText}`,
    description: `See how AI assistants answer the question "${queryText}" and which platforms appear most frequently in those responses.`,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "AI Search",
        item: `${siteUrl}/ai-search`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: queryText,
        item: `${siteUrl}/ai-search/${params.querySlug}`,
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqItems.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      ) : null}
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
            {brandSummaries.map((brand) => (
              <article className={styles.brandCard} key={brand.brandSlug}>
                <h3>{brand.brand}</h3>
                <p>{toPercent(brand.visibilityPercent)} AI visibility</p>
                <p className={styles.brandSummary}>{brand.summary}</p>
                {availableReportSlugs.has(brand.brandSlug) ? (
                  <Link href={`/ai-visibility/${brand.brandSlug}`} className={styles.inlineLink}>
                    View {brand.brand} AI visibility report →
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
          <h2>About this AI search query</h2>
          <p className={styles.lead}>
            This page analyzes how AI assistants respond when users ask the question: "{queryText}" in the{" "}
            {category.toLowerCase()} category.
          </p>
          <p className={styles.subtle}>
            Readable evaluates AI responses across multiple assistants to understand which platforms are most
            frequently recommended and how brands are positioned in those answers.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>How AI assistants answer this question</h2>
          <p className={styles.lead}>
            {responseInterpretation} In this query cluster, recommendation patterns are shaped by how strongly brands
            are linked to {topAttributesText || "key buyer criteria"}.
          </p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2>Related questions about this topic</h2>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <article key={item.question} className={styles.faqItem}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
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
