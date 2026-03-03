import styles from "../styles/components/FeatureCard.module.css"

type FeatureCardProps = {
  title: string
  description: string
  points?: string[]
}

export default function FeatureCard({ title, description, points = [] }: FeatureCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {points.length > 0 ? (
        <ul className={styles.points}>
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
