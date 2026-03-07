import styles from "./guide-summary.module.css"

type GuideSummaryProps = {
  headings: string[]
}

export default function GuideSummary({ headings }: GuideSummaryProps) {
  if (headings.length === 0) {
    return null
  }

  return (
    <section className={styles.card} aria-label="Guide summary">
      <h2 className={styles.title}>What you'll learn</h2>
      <ul className={styles.list}>
        {headings.map((heading) => (
          <li key={heading} className={styles.item}>
            {heading}
          </li>
        ))}
      </ul>
    </section>
  )
}
