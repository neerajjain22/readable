import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/pricing.module.css"

const plans = [
  {
    name: "Free",
    description: "Explore how AI tools position your brand.",
    features: [
      "Limited AI visibility tracking",
      "Basic prompt coverage",
      "Snapshot positioning view",
      "Community support",
    ],
    ctaLabel: "Start Free",
    ctaHref: "/platform/ai-visibility",
    note: "",
    featured: false,
  },
  {
    name: "Growth",
    description: "For teams ready to measure and act on AI-driven opportunities.",
    features: [
      "Full AI Visibility",
      "Agent Analytics",
      "Expanded tracking coverage",
      "Historical trend reporting",
      "Page-level insights",
      "Exportable reports",
    ],
    ctaLabel: "Book a Demo",
    ctaHref: "/contact",
    note: "Custom pricing based on scope.",
    featured: true,
  },
  {
    name: "Scale",
    description: "For multi-team and multi-brand organizations.",
    features: [
      "Full platform access",
      "Advanced reporting",
      "Multi-site support",
      "API & data export",
      "Dedicated onboarding",
      "Priority support",
    ],
    ctaLabel: "Book a Demo",
    ctaHref: "/contact",
    note: "Tailored plans for growing organizations.",
    featured: true,
  },
]

const comparisonRows = [
  { feature: "AI Visibility", free: "Included", growth: "Included", scale: "Included" },
  { feature: "Agent Analytics", free: "—", growth: "Included", scale: "Included" },
  { feature: "Agent-Ready Pages", free: "—", growth: "Included", scale: "Included" },
  { feature: "Historical tracking", free: "Limited", growth: "Included", scale: "Included" },
  { feature: "Export & reporting", free: "Basic", growth: "Included", scale: "Advanced" },
  { feature: "Multi-site support", free: "—", growth: "—", scale: "Included" },
  { feature: "API access", free: "—", growth: "—", scale: "Included" },
  { feature: "Dedicated onboarding", free: "—", growth: "—", scale: "Included" },
]

const faqs = [
  {
    question: "What’s included in the Free plan?",
    answer:
      "The Free plan includes limited AI visibility tracking, basic prompt coverage, a snapshot positioning view, and community support.",
  },
  {
    question: "Do paid plans require a contract?",
    answer:
      "Paid plans are delivered through a guided demo and tailored scope so teams can align rollout, support, and onboarding.",
  },
  {
    question: "How is pricing determined?",
    answer:
      "Pricing is based on tracking scope, team requirements, and reporting needs. We tailor each paid plan to your operating model.",
  },
  {
    question: "Can I upgrade from Free later?",
    answer: "Yes. Teams can start on Free and move to Growth or Scale when they are ready for deeper coverage.",
  },
  {
    question: "Is onboarding included?",
    answer: "Dedicated onboarding is included in Scale plans and available based on scope for paid deployments.",
  },
]

export default function PricingPage() {
  return (
    <Layout>
      <Seo
        title="Readable Pricing | Simple Plans for Growing Teams"
        description="Start with AI visibility for free and unlock the full Readable platform with a tailored plan."
        path="/pricing"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />
            <h1 className={styles.heading}>Simple Plans for Growing Teams</h1>
            <p className={styles.subheading}>
              Start with AI visibility for free. Unlock the full platform with a tailored plan.
            </p>
            <p className={styles.description}>
              Readable supports teams at every stage — from exploring AI positioning to operationalizing
              AI-driven growth.
            </p>
            <p className={styles.note}>All paid plans require a demo. Only Free is self-serve.</p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid3}>
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`${styles.planCard} ${plan.featured ? styles.planCardFeatured : styles.planCardFree}`}
                >
                  <h2 className={styles.planTitle}>{plan.name}</h2>
                  <p className={styles.planDescription}>{plan.description}</p>
                  <ul className={styles.featureList}>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <div className={styles.planActions}>
                    <Link
                      href={plan.ctaHref}
                      className={plan.featured ? styles.primaryButton : styles.secondaryButton}
                    >
                      {plan.ctaLabel}
                    </Link>
                    {plan.note ? <p className={styles.planNote}>{plan.note}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Compare Plans</h2>
            <div className={styles.tableWrap}>
              <table className={styles.comparisonTable}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th>Growth</th>
                    <th>Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>{row.free}</td>
                      <td>{row.growth}</td>
                      <td>{row.scale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {faqs.map((faq) => (
                <details key={faq.question} className={styles.faqItem}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.ctaShell}>
              <h2 className={styles.sectionTitle}>Ready to Understand Your AI Presence?</h2>
              <div className={styles.ctaActions}>
                <Link href="/platform/ai-visibility" className={styles.secondaryButton}>
                  Start Free
                </Link>
                <Link href="/contact" className={styles.primaryButton}>
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
