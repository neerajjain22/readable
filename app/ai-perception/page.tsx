import type { Metadata } from "next"
import Link from "next/link"
import Breadcrumbs from "../../components/Breadcrumbs"
import AnalyzeWebsiteCTA from "../../components/programmatic/AnalyzeWebsiteCTA"
import BookDemoCTA from "../../components/programmatic/BookDemoCTA"
import { prisma } from "../../lib/prisma"
import { PAGE_STATUS, CONTENT_TYPE } from "../../lib/programmatic/constants"
import { parsePerceptionFrontmatter } from "../../lib/perception-blogs/utils"
import styles from "../../styles/components/PerceptionHub.module.css"
import ctaStyles from "../../components/programmatic/programmatic.module.css"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tryreadable.ai"
export const dynamic = "force-dynamic"

export function generateMetadata(): Metadata {
  return {
    title: "AI Perception Reports | How AI Models See Top Brands",
    description:
      "Explore data-driven analyses of how leading AI models perceive companies across industries. Compare brand perception scores, competitor rankings, and AI visibility insights.",
    alternates: {
      canonical: `${BASE_URL}/ai-perception`,
    },
    openGraph: {
      title: "AI Perception Reports | How AI Models See Top Brands",
      description:
        "Explore data-driven analyses of how leading AI models perceive companies across industries.",
      type: "website",
      url: `${BASE_URL}/ai-perception`,
    },
  }
}

type PageWithFrontmatter = {
  slug: string
  title: string
  content: string
  updatedAt: Date
  companyName: string
  industry: string
  metaDescription: string
}

export default async function PerceptionHubPage() {
  const pages = await prisma.generatedPage.findMany({
    where: {
      status: PAGE_STATUS.PUBLISHED,
      template: { contentType: CONTENT_TYPE.PERCEPTION },
    },
    select: {
      slug: true,
      title: true,
      content: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  // Parse frontmatter from each page
  const enriched: PageWithFrontmatter[] = pages.map((page) => {
    const { metadata } = parsePerceptionFrontmatter(page.content)
    return {
      slug: page.slug,
      title: page.title,
      content: page.content,
      updatedAt: page.updatedAt,
      companyName: metadata.company_name,
      industry: metadata.industry || "Other",
      metaDescription: metadata.meta_description,
    }
  })

  // Group by industry
  const byIndustry = new Map<string, PageWithFrontmatter[]>()
  for (const page of enriched) {
    const group = byIndustry.get(page.industry) || []
    group.push(page)
    byIndustry.set(page.industry, group)
  }

  return (
    <main className={styles.page}>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Perception" }]} />

      <header className={styles.header}>
        <h1 className={styles.title}>AI Perception Reports</h1>
        <p className={styles.intro}>
          How do leading AI models like Claude and GPT perceive the world&apos;s top brands? Our
          perception reports analyze brand recognition, sentiment, competitive positioning, and
          recommendation likelihood across multiple AI systems — giving you an objective view of your
          AI visibility landscape.
        </p>
      </header>

      {enriched.length === 0 ? (
        <p>No perception reports published yet. Check back soon.</p>
      ) : (
        Array.from(byIndustry.entries()).map(([industry, group]) => (
          <section key={industry} className={styles.industrySection}>
            <h2 className={styles.industryTitle}>{industry}</h2>
            <div className={styles.grid}>
              {group.map((page) => (
                <Link
                  key={page.slug}
                  href={`/ai-perception/${page.slug}`}
                  className={styles.card}
                >
                  <h3 className={styles.cardTitle}>{page.title}</h3>
                  <p className={styles.cardCompany}>{page.companyName}</p>
                  <p className={styles.cardDescription}>
                    {page.metaDescription || page.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <div className={ctaStyles.ctaBlock}>
        <AnalyzeWebsiteCTA />
      </div>
      <div className={ctaStyles.ctaBlock}>
        <BookDemoCTA />
      </div>
    </main>
  )
}
