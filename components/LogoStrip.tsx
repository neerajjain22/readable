import styles from "../styles/components/LogoStrip.module.css"

type LogoStripProps = {
  logos: string[]
  title?: string
}

export default function LogoStrip({ logos, title = "Trusted by Modern Growth Teams" }: LogoStripProps) {
  return (
    <section className={styles.section} aria-label="Customer logos">
      <div className={styles.container}>
        <p className={styles.title}>{title}</p>
        <div className={styles.grid}>
          {logos.map((logo) => (
            <div key={logo} className={styles.item}>
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
