import CTASection from "../CTASection"
import styles from "./programmatic.module.css"

export default function AnalyzeWebsiteCTA() {
  return (
    <div className={styles.ctaBlock}>
      <CTASection
        title="Analyze My Website"
        description="Get a walkthrough of where your brand stands in AI answers and agent-driven discovery."
        primaryLabel="Analyze My Website"
        primaryHref="/#home-hero-title"
      />
    </div>
  )
}
