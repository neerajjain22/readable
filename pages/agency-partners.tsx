import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/agency-partners.module.css"

const aiShiftPoints = [
  "Clients are asking about AI visibility",
  "AI tools influence competitive positioning",
  "Traditional SEO reporting doesn't cover AI systems",
  "Agencies need new reporting capabilities",
]

const serviceCards = [
  {
    title: "AI Positioning Reports",
    body: "Show clients how AI tools describe and recommend their brand.",
  },
  {
    title: "Agent Traffic Insights",
    body: "Track AI-driven visits and conversion influence.",
  },
  {
    title: "Structured Page Guidance",
    body: "Help clients improve the pages AI systems reference most.",
  },
]

const whiteLabelFeatures = [
  "Your logo and branding",
  "Custom domain access",
  "Multi-client dashboard",
  "Client-level reporting views",
  "Exportable branded reports",
]

const revenuePoints = [
  "Monthly recurring model",
  "Multi-client management",
  "Expandable per client",
  "Scales with your agency",
]

const partnershipSteps = [
  {
    label: "1. Apply",
    body: "Share details about your agency and client base.",
  },
  {
    label: "2. Onboard",
    body: "We set up your white-labeled environment and dashboard.",
  },
  {
    label: "3. Launch",
    body: "Start offering AI visibility reporting to your clients.",
  },
]

export default function AgencyPartnersPage() {
  return (
    <Layout>
      <Seo
        title="Agency Partners | Readable"
        description="Offer AI positioning and agent analytics under your brand with a white-labeled platform built for agencies."
        path="/agency-partners"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Agency Partners" }]} />
            <h1 className={styles.heading}>White-Labeled AI Influence for Agencies</h1>
            <p className={styles.subheading}>
              Offer AI positioning and agent analytics under your brand — and create a new recurring
              revenue stream.
            </p>
            <p className={styles.description}>
              Readable provides agencies with a fully white-labeled platform to monitor how AI tools
              represent their clients, track AI-driven traffic, and deliver structured reporting at scale.
            </p>
            <div className={styles.actions}>
              <Link href="/contact" className={styles.primaryButton}>
                Apply to Become a Partner
              </Link>
              <Link href="/book-demo" className={styles.secondaryButton}>
                Book a Demo
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>AI Is Changing How Brands Are Discovered</h2>
            <p className={styles.intro}>
              AI tools now influence brand discovery, comparison, and recommendation. Agencies need visibility
              into how clients are represented — and a structured way to improve it.
            </p>
            <div className={styles.card}>
              <ul className={styles.bulletList}>
                {aiShiftPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Deliver AI Influence as a Service</h2>
            <div className={styles.grid3}>
              {serviceCards.map((card) => (
                <article key={card.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardBody}>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Fully White-Labeled Platform</h2>
            <div className={styles.card}>
              <ul className={styles.bulletList}>
                {whiteLabelFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className={styles.cardBody}>
                Readable operates behind the scenes — your agency owns the client relationship.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Built for Recurring Revenue</h2>
            <p className={styles.intro}>
              Offer AI visibility and agent analytics as an ongoing service, integrated into your existing
              retainer structure.
            </p>
            <div className={styles.card}>
              <ul className={styles.bulletList}>
                {revenuePoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>How the Partnership Works</h2>
            <div className={styles.grid3}>
              {partnershipSteps.map((step) => (
                <article key={step.label} className={styles.card}>
                  <h3 className={styles.cardTitle}>{step.label}</h3>
                  <p className={styles.cardBody}>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.centerShell}>
              <h2 className={styles.sectionTitle}>Add AI Influence to Your Agency Offering.</h2>
              <div className={styles.centerActions}>
                <Link href="/contact" className={styles.primaryButton}>
                  Apply to Become a Partner
                </Link>
                <Link href="/book-demo" className={styles.secondaryButton}>
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
