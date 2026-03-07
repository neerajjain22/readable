import Link from "next/link"
import { getAllGuides } from "../../lib/guides"
import styles from "./programmatic.module.css"

type RelatedGuidesProps = {
  currentSlug?: string
}

export default function RelatedGuides({ currentSlug }: RelatedGuidesProps) {
  const guides = getAllGuides()
    .filter((guide) => guide.slug !== currentSlug)
    .slice(0, 3)

  if (guides.length === 0) {
    return null
  }

  return (
    <aside className={styles.related}>
      <h2 className={styles.relatedTitle}>Related Guides</h2>
      <ul className={styles.relatedList}>
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className={styles.relatedLink}>
              {guide.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
