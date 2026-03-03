import styles from "../styles/components/IndustryBlock.module.css"

type IndustryBlockProps = {
  name: string
  summary: string
  bullets: string[]
}

export default function IndustryBlock({ name, summary, bullets }: IndustryBlockProps) {
  return (
    <article className={styles.block}>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.summary}>{summary}</p>
      <ul className={styles.list}>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  )
}
