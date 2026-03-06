import Link from "next/link"
import styles from "../styles/components/CTASection.module.css"

type CTASectionProps = {
  title: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export default function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Link href={primaryHref} className="btn btn-primary">
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref ? (
            <Link href={secondaryHref} className="btn btn-secondary">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
