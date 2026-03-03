import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import PricingTable, { PricingTier } from "../components/PricingTable"
import CTASection from "../components/CTASection"
import styles from "../styles/Page.module.css"

const tiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$499/mo",
    description: "For lean teams starting AI visibility programs.",
    features: ["AI Visibility dashboard", "Weekly prompt tracking", "Basic agent analytics"],
    ctaLabel: "Get Started",
    ctaHref: "/contact",
  },
  {
    name: "Professional",
    price: "$1,499/mo",
    description: "For growth teams scaling cross-functional execution.",
    features: [
      "Everything in Starter",
      "Agent-Ready Pages toolkit",
      "Conversion attribution",
      "Priority support",
    ],
    ctaLabel: "Book a Demo",
    ctaHref: "/contact",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-team organizations and advanced governance.",
    features: [
      "Everything in Professional",
      "Multi-team workspaces",
      "Custom integrations",
      "Agency and partner controls",
    ],
    ctaLabel: "Talk to Sales",
    ctaHref: "/contact",
  },
]

export default function PricingPage() {
  return (
    <Layout>
      <Seo
        title="Readable Pricing | Starter, Professional, Enterprise"
        description="Compare Readable pricing plans for AI visibility, agent analytics, and agent-ready page workflows."
        path="/pricing"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />
            <h1 className={styles.heroTitle}>Pricing for Every Stage of AI Maturity</h1>
            <p className={styles.heroDescription}>
              Choose a plan aligned to your team size and operating model. Annual and partner pricing
              available.
            </p>
            <div className={styles.mtMd}>
              <PricingTable tiers={tiers} />
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.heroTitle}>Capability Comparison</h2>
            <div className={`${styles.tableWrap} ${styles.mtMd}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Starter</th>
                    <th>Professional</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>AI Visibility</td><td>Core</td><td>Advanced</td><td>Advanced + Custom</td></tr>
                  <tr><td>Agent Analytics</td><td>Basic</td><td>Full Funnel</td><td>Full Funnel + BI Export</td></tr>
                  <tr><td>Agent-Ready Pages</td><td>Templates</td><td>Scoring + Guidance</td><td>Workflow Automation</td></tr>
                  <tr><td>Multi-team Support</td><td>-</td><td>Limited</td><td>Yes</td></tr>
                  <tr><td>Agency Features</td><td>-</td><td>Optional</td><td>Included</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <CTASection
          title="Need Custom Packaging?"
          description="We support enterprise procurement, security reviews, and partner-specific pricing structures."
          primaryLabel="Book a Demo"
          primaryHref="/contact"
          secondaryLabel="Contact Sales"
          secondaryHref="/contact"
        />
      </main>
    </Layout>
  )
}
