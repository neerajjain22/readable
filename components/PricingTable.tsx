import Link from "next/link"
import styles from "../styles/components/PricingTable.module.css"

export type PricingTier = {
  name: string
  price: string
  description: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  recommended?: boolean
}

type PricingTableProps = {
  tiers: PricingTier[]
}

export default function PricingTable({ tiers }: PricingTableProps) {
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => (
        <article key={tier.name} className={`${styles.card} ${tier.recommended ? styles.recommended : ""}`}>
          {tier.recommended ? <p className={styles.badge}>Recommended</p> : null}
          <h3 className={styles.name}>{tier.name}</h3>
          <p className={styles.price}>{tier.price}</p>
          <p className={styles.description}>{tier.description}</p>
          <ul className={styles.features}>
            {tier.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <Link href={tier.ctaHref} className={`btn btn-primary ${styles.button}`}>
            {tier.ctaLabel}
          </Link>
        </article>
      ))}
    </div>
  )
}
