import type { Metadata } from "next"
import Link from "next/link"
import { getEntities } from "../../../lib/programmatic/getEntities"
import { getPublishedPagesGroupedData } from "../../../lib/programmatic/repository"
import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "CMS Guides",
  description: "Directory of published programmatic guides by CMS entity.",
}

export default async function CmsGuidesIndexPage() {
  const [entities, pages] = await Promise.all([
    getEntities("cms"),
    getPublishedPagesGroupedData(),
  ])

  const pagesByEntityId = new Map<string, typeof pages>()
  for (const page of pages) {
    const bucket = pagesByEntityId.get(page.entityId)
    if (bucket) {
      bucket.push(page)
      continue
    }
    pagesByEntityId.set(page.entityId, [page])
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>CMS Guides Directory</h1>
      <p className={styles.subheading}>Explore published guides by CMS platform.</p>

      {entities.map((entity) => {
        const entityPages = pagesByEntityId.get(entity.id) || []

        return (
          <section key={entity.id} className={styles.entitySection}>
            <h2 className={styles.entityName}>{entity.name}</h2>
            {entityPages.length === 0 ? (
              <p className={styles.empty}>No published guides for this CMS yet.</p>
            ) : (
              <ul className={styles.list}>
                {entityPages.map((page) => (
                  <li key={page.slug}>
                    <Link href={`/guides/${page.slug}`} className={styles.link}>
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </main>
  )
}
