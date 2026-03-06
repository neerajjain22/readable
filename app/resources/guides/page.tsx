import type { Metadata } from "next"
import Link from "next/link"
import Breadcrumbs from "../../../components/Breadcrumbs"
import { getAllGuides } from "../../../lib/guides"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "AI Guides & Field Guides",
  description:
    "Educational guides on AI search, answer engines, AI agents, and how brands remain visible in AI-driven discovery.",
}

const FEATURED_SLUG = "ai-search-field-guide"

const featuredFallback = {
  title: "AI Search Field Guide",
  description:
    "A comprehensive glossary and guide to AI search, answer engines, AI agents, AEO, and how brands remain visible in AI-generated answers.",
  slug: FEATURED_SLUG,
}

export default function GuidesPage() {
  const guides = getAllGuides()
  const featuredGuide = guides.find((guide) => guide.slug === FEATURED_SLUG) ?? featuredFallback
  const gridGuides = guides.filter((guide) => guide.slug !== FEATURED_SLUG)

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: "Guides" },
            ]}
          />
          <h1 className={styles.heading}>Guides & Field Guides</h1>
          <p className={styles.description}>
            Deep dives into how AI systems discover, evaluate, and recommend brands.
          </p>
          <p className={styles.description}>
            These guides help teams understand how AI influences discovery and decision-making.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.kicker}>Featured Guide</p>
          <article className={styles.featuredCard}>
            <h2 className={styles.featuredTitle}>{featuredGuide.title}</h2>
            <p className={styles.featuredText}>{featuredGuide.description}</p>
            <Link href={`/resources/guides/${featuredGuide.slug}`} className={styles.inlineLink}>
              Read the Guide →
            </Link>
          </article>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          {gridGuides.length === 0 ? (
            <p className={styles.emptyState}>Guides coming soon.</p>
          ) : (
            <div className={styles.grid3}>
              {gridGuides.map((guide) => (
                <article key={guide.slug} className={styles.card}>
                  <h3 className={styles.cardTitle}>{guide.title}</h3>
                  <p className={styles.cardBody}>{guide.description}</p>
                  <Link href={`/resources/guides/${guide.slug}`} className={styles.inlineLink}>
                    Read Guide →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
