import CTASection from "../CTASection"
import styles from "./programmatic.module.css"

export default function BookDemoCTA() {
  return (
    <div className={styles.ctaBlock}>
      <CTASection
        title="Ready to operationalize AI Influence and Domination?"
        description="Book a live walkthrough tailored to your growth and analytics team."
        primaryLabel="Book a Demo"
        primaryHref="/book-demo"
      />
    </div>
  )
}
