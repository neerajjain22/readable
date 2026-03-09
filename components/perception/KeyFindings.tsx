import styles from "../../styles/components/KeyFindings.module.css"

type KeyFindingsProps = {
  findings: string[]
}

export default function KeyFindings({ findings }: KeyFindingsProps) {
  if (findings.length === 0) {
    return null
  }

  return (
    <section className={styles.card} aria-label="Key findings">
      <h2 className={styles.title}>Key Findings</h2>
      <ul className={styles.list}>
        {findings.map((finding) => (
          <li key={finding} className={styles.item}>
            {finding}
          </li>
        ))}
      </ul>
    </section>
  )
}
