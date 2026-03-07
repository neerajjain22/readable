import Link from "next/link"
import {
  getPublishedPagesByEntity,
  getPublishedPagesByTemplate,
} from "../../lib/programmatic/repository"
import styles from "./related-guides.module.css"

type RelatedGuidesProps = {
  currentPageId: string
  templateId: string
  entityId: string
  entityName: string
}

export default async function RelatedGuides({
  currentPageId,
  templateId,
  entityId,
  entityName,
}: RelatedGuidesProps) {
  const [sameTemplate, sameEntity] = await Promise.all([
    getPublishedPagesByTemplate(templateId, currentPageId, 5),
    getPublishedPagesByEntity(entityId, currentPageId, 5),
  ])

  if (sameTemplate.length === 0 && sameEntity.length === 0) {
    return null
  }

  return (
    <aside className={styles.wrapper}>
      {sameTemplate.length > 0 ? (
        <section>
          <h2 className={styles.groupTitle}>Related Guides</h2>
          <ul className={styles.list}>
            {sameTemplate.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className={styles.link}>
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sameEntity.length > 0 ? (
        <section>
          <h2 className={styles.groupTitle}>More guides about {entityName}</h2>
          <ul className={styles.list}>
            {sameEntity.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className={styles.link}>
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  )
}
