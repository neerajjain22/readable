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
                {guide.title}
              </Link>
            </h2>
            <p className={styles.meta}>{guide.entity.name}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
