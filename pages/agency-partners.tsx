import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/agency-partners.module.css"

const aiShiftPoints = [
  "Clients are asking how AI systems describe their brand",
  "AI assistants influence product discovery and comparison",
  "Traditional SEO reporting does not cover AI systems",
  "Agencies need new analytics and reporting capabilities",
]

const serviceCards = [
  {
    title: "AI Positioning Reports",
    body: "Show clients how AI systems describe their brand across prompts, categories, and competitors.",
  },
  {
    title: "Agent Traffic Insights",
    body: "Track AI-driven visits, referrals, and how AI assistants influence website traffic and conversions.",
  },
  {
    title: "Agent-Optimized Page Guidance",
    body: "Help clients improve the pages AI systems reference when recommending products and services.",
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
  "Monthly reporting and insights",
  "Multi-client management",
  "Expandable per client",
  "Scales with your agency",
]

const partnershipSteps = [
  {
    label: "Apply",
    body: "Share details about your agency, services, and client base.",
  },
  {
    label: "Onboard",
    body: "We set up your white-labeled dashboard and reporting environment.",
  },
  {
    label: "Launch",
    body: "Start offering AI influence reporting and insights to your clients.",
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
            <h1 className={styles.heading}>Add AI Influence Services to Your Agency</h1>
            <p className={styles.subheading}>
              Help clients understand how AI systems describe their brand, track AI-driven traffic, and
              improve how they appear in AI responses — all under your agency’s brand.
            </p>
            <p className={styles.description}>
              Readable provides the infrastructure behind the scenes so agencies can deliver AI influence
              analytics, structured reporting, and optimization guidance as a client service.
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
              AI assistants increasingly influence how buyers discover, compare, and choose brands. Agencies
              need new ways to measure and improve how their clients appear in AI responses.
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
            <h2 className={styles.sectionTitle}>Offer AI Influence Services to Your Clients</h2>
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
            <p className={styles.intro}>
              Readable operates behind the scenes so your agency owns the client relationship.
            </p>
            <div className={styles.card}>
              <ul className={styles.bulletList}>
                {whiteLabelFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className={styles.cardBody}>
                Your clients see your agency as the provider of AI influence insights and reporting.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Built for Recurring Revenue</h2>
            <p className={styles.intro}>
              Offer AI influence analytics as an ongoing service integrated into your agency retainers.
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
              <h2 className={styles.sectionTitle}>Add AI Influence to Your Agency Offering</h2>
              <p className={styles.intro}>
                Join agencies helping clients understand and improve how AI systems influence discovery and
                decision-making.
              </p>
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
