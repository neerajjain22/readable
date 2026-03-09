import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProgrammaticLayout from "../../../components/programmatic/ProgrammaticLayout"
import MdxRenderer from "../../../components/programmatic/MdxRenderer"
import AnalyzeWebsiteCTA from "../../../components/programmatic/AnalyzeWebsiteCTA"
import BookDemoCTA from "../../../components/programmatic/BookDemoCTA"
import FAQAccordion from "../../../components/guides/FAQAccordion"
import TableOfContents from "../../../components/guides/TableOfContents"
import KeyFindings from "../../../components/perception/KeyFindings"
import PerceptionBarChart from "../../../components/perception/PerceptionBarChart"
import PerceptionHeatmap from "../../../components/perception/PerceptionHeatmap"
import Breadcrumbs from "../../../components/Breadcrumbs"
import {
  extractLevelTwoHeadings,
  splitGuideSections,
} from "../../../lib/internalLinks"
import { getGeneratedPageBySlug, getPublishedPagesByTemplate } from "../../../lib/programmatic/repository"
import { parsePerceptionFrontmatter } from "../../../lib/perception-blogs/utils"
import { PAGE_STATUS } from "../../../lib/programmatic/constants"
import pageStyles from "../../../components/programmatic/programmatic.module.css"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tryreadable.ai"
export const dynamic = "force-dynamic"

type RouteParams = {
  params: { slug: string }
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const page = await getGeneratedPageBySlug(params.slug)

  if (!page) {
    return { title: "Report Not Found", robots: { index: false, follow: false } }
  }

  const { metadata } = parsePerceptionFrontmatter(page.content)
  const isPublished = page.status === PAGE_STATUS.PUBLISHED

  return {
    title: page.title,
    description: metadata.meta_description || page.title,
    keywords: [metadata.target_keyword, ...metadata.secondary_keywords].filter(Boolean).join(", "),
    alternates: {
      canonical: `${BASE_URL}/ai-perception/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: metadata.meta_description || page.title,
      type: "article",
      url: `${BASE_URL}/ai-perception/${page.slug}`,
    },
    robots: isPublished
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  }
}

export default async function PerceptionBlogPage({ params }: RouteParams) {
  const page = await getGeneratedPageBySlug(params.slug)

  if (!page) {
    notFound()
  }

  const { metadata, markdown } = parsePerceptionFrontmatter(page.content)
  const headings = extractLevelTwoHeadings(markdown)
  const sections = splitGuideSections(markdown)
  const formattedDate = new Date(page.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const canonicalUrl = `${BASE_URL}/ai-perception/${page.slug}`

  // Related perception blogs (same template)
  const relatedPages = await getPublishedPagesByTemplate(page.templateId, page.id, 5)

  // JSON-LD: BlogPosting
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.title,
    description: metadata.meta_description,
    author: { "@type": "Organization", name: "Readable" },
    publisher: { "@type": "Organization", name: "Readable" },
    datePublished: page.createdAt.toISOString(),
    dateModified: page.updatedAt.toISOString(),
    mainEntityOfPage: canonicalUrl,
    keywords: [metadata.target_keyword, ...metadata.secondary_keywords].filter(Boolean).join(", "),
  }

  // JSON-LD: FAQPage
  const faqSchema =
    metadata.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: metadata.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null

  // JSON-LD: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "AI Perception", item: `${BASE_URL}/ai-perception` },
      { "@type": "ListItem", position: 3, name: page.title },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ProgrammaticLayout
        title={page.title}
        author="Readable Team"
        lastUpdated={formattedDate}
        kicker="AI Perception Analysis"
      >
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "AI Perception", href: "/ai-perception" },
            { label: page.title },
          ]}
        />

        <KeyFindings findings={metadata.key_findings} />

        <PerceptionBarChart
          scores={metadata.perception_scores}
          inputCompany={metadata.company_name}
        />

        {metadata.head_to_head_summary ? (
          <PerceptionHeatmap summary={metadata.head_to_head_summary} />
        ) : null}

        <div className={pageStyles.contentGrid}>
          <div className={pageStyles.mainContent}>
            {sections.map((section) => {
              const isFaqSection = section.heading.toLowerCase() === "faq"

              return (
                <div key={section.heading}>
                  {isFaqSection && metadata.faq.length > 0 ? (
                    <>
                      <MdxRenderer source={`## ${section.heading}`} />
                      <FAQAccordion items={metadata.faq} />
                    </>
                  ) : (
                    <MdxRenderer source={`## ${section.heading}\n\n${section.body}`} />
                  )}
                </div>
              )
            })}
          </div>
          <TableOfContents headings={headings} />
        </div>

        {relatedPages.length > 0 ? (
          <aside className={pageStyles.related}>
            <h2 className={pageStyles.relatedTitle}>More Perception Reports</h2>
            <ul className={pageStyles.relatedList}>
              {relatedPages.map((rp) => (
                <li key={rp.slug}>
                  <a href={`/ai-perception/${rp.slug}`} className={pageStyles.relatedLink}>
                    {rp.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <AnalyzeWebsiteCTA />
        <BookDemoCTA />
      </ProgrammaticLayout>
    </>
  )
}
