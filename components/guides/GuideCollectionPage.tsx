import Link from "next/link"
import styles from "./guide-collection-page.module.css"

type CollectionGuide = {
  id: string
  title: string
  slug: string
  entity: {
    name: string
  }
}

type GuideCollectionPageProps = {
  title: string
  intro: string
  guides: CollectionGuide[]
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getReadableGuideTitle(title: string, slug: string, entityName: string) {
  const normalizedEntitySlug = entityName.trim().toLowerCase().replace(/\s+/g, "-")
  const slugTail = slug.split("-").slice(-normalizedEntitySlug.split("-").length).join("-")

  if (slugTail !== normalizedEntitySlug) {
    return title
  }

  const pattern = new RegExp(`\\b${escapeRegExp(slugTail)}\\b`, "gi")
  return title.replace(pattern, entityName)
}

export default function GuideCollectionPage({ title, intro, guides }: GuideCollectionPageProps) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.intro}>{intro}</p>

      <section className={styles.grid}>
        {guides.map((guide) => (
          <article key={guide.id} className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Link className={styles.link} href={`/guides/${guide.slug}`}>
                {getReadableGuideTitle(guide.title, guide.slug, guide.entity.name)}
              </Link>
            </h2>
            <p className={styles.meta}>{guide.entity.name}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
