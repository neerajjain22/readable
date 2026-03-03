import styles from "../styles/components/PartnerBlock.module.css"

type PartnerBlockProps = {
  title: string
  description: string
  items: string[]
}

export default function PartnerBlock({ title, description, items }: PartnerBlockProps) {
  return (
    <article className={styles.block}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}
