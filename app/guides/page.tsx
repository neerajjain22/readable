import type { Metadata } from "next"
import Link from "next/link"
import { getAllGuides } from "../../lib/guides"
import {
  getPublishedPagesWithTemplateAndEntity,
} from "../../lib/programmatic/repository"
import {
  getCollectionDescription,
  getCollectionSlugFromPattern,
  getCollectionTitle,
} from "../../lib/programmatic/collections"
import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Guides & Field Guides",
  description: "Browse featured editorial guides and programmatic guide collections.",
}

export default async function GuidesIndexPage() {
  const [editorialGuides, publishedPages] = await Promise.all([
    getAllGuides(),
    getPublishedPagesWithTemplateAndEntity(),
  ])

  const featuredGuides = editorialGuides
    .filter((guide) => guide.slug === "ai-search-field-guide")
    .map((guide) => ({
      title: guide.title,
      description: guide.description,
      slug: guide.slug,
    }))

  const collectionsByTemplate = new Map<
    string,
    {
      template: {
        slugPattern: string
        name: string
      }
      collectionSlug: string
      count: number
      platformToken: string
    }
  >()

  for (const page of publishedPages) {
    const bucket = collectionsByTemplate.get(page.templateId)
    if (bucket) {
      bucket.count += 1
      continue
    }

    const collectionSlug = getCollectionSlugFromPattern(page.template.slugPattern)
    const platformToken = page.entity.type || "platform"
    collectionsByTemplate.set(page.templateId, {
      template: {
        slugPattern: page.template.slugPattern,
        name: page.template.name,
      },
      collectionSlug,
      count: 1,
      platformToken,
    })
  }

  const collections = Array.from(collectionsByTemplate.values()).map((collection) => {
    const options = { platformToken: collection.platformToken }

    return {
      ...collection,
      title: getCollectionTitle(collection.template, options),
      description: getCollectionDescription(collection.template, collection.count, options),
    }
  })

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Guides &amp; Field Guides</h1>
      <p className={styles.subheading}>
        Explore editorial guides and template-driven collections for AI search and agent visibility.
      </p>

      {featuredGuides.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Featured Guides</h2>
          <div className={styles.grid}>
            {featuredGuides.map((guide) => (
              <article key={guide.slug} className={styles.card}>
                <h3 className={styles.cardTitle}>{guide.title}</h3>
                <p className={styles.excerpt}>{guide.description}</p>
                <Link className={styles.link} href={`/resources/guides/${guide.slug}`}>
                  Read the Guide →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Guide Collections</h2>
        {collections.length === 0 ? <p className={styles.empty}>No published collections yet.</p> : null}
        <div className={styles.grid}>
          {collections.map((collection) => (
            <article key={collection.collectionSlug} className={styles.card}>
              <h3 className={styles.cardTitle}>{collection.title}</h3>
              <p className={styles.excerpt}>{collection.description}</p>
              <Link className={styles.link} href={`/guides/${collection.collectionSlug}`}>
                {collection.count} guides →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
