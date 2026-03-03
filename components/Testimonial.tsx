import styles from "../styles/components/Testimonial.module.css"

type TestimonialProps = {
  quote: string
  name: string
  role: string
  company: string
}

export default function Testimonial({ quote, name, role, company }: TestimonialProps) {
  return (
    <article className={styles.card}>
      <p className={styles.quote}>"{quote}"</p>
      <p className={styles.name}>{name}</p>
      <p className={styles.meta}>
        {role}, {company}
      </p>
    </article>
  )
}
