import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import styles from "../../styles/solutions-analytics-teams.module.css"

const visibilityCards = [
  {
    title: "AI-driven traffic measurement",
    body: "Understand visits coming from AI tools and assistants.",
  },
  {
    title: "Attribution clarity",
    body: "See how AI sessions contribute to conversions.",
  },
  {
    title: "Cross-channel comparison",
    body: "Benchmark AI traffic alongside paid, organic, and direct.",
  },
  {
    title: "Reporting consistency",
    body: "Create clear, shareable insights for leadership.",
  },
]

const readableModules = [
  {
    title: "AI Visibility",
    body: "Track how your brand appears in AI-driven searches.",
  },
  {
    title: "Agent Analytics",
    body: "Measure behavior and conversion impact from AI visits.",
  },
  {
    title: "Agent-Ready Pages",
    body: "Understand which structured pages influence AI-driven sessions.",
  },
]

const workflows = [
  "Track AI-driven sessions as a distinct channel",
  "Measure downstream conversion impact",
  "Identify high-performing AI landing pages",
  "Benchmark AI traffic against other acquisition sources",
  "Deliver executive-ready reports on AI influence",
]

export default function AnalyticsTeamsPage() {
  return (
    <Layout>
      <Seo
        title="Readable for Analytics Teams"
        description="Make AI-driven visibility and traffic measurable, trackable, and easy to report."
        path="/solutions/analytics-teams"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Solutions", href: "/solutions" },
                { label: "Analytics Teams" },
              ]}
            />
            <h1 className={styles.heading}>Readable for Analytics Teams</h1>
            <p className={styles.subheading}>
              Make AI-driven visibility and traffic measurable, trackable, and easy to report.
            </p>
            <p className={styles.description}>
              Readable helps analytics teams understand how AI tools influence discovery, measure
              agent-driven sessions, and share clear insights across the organization.
            </p>
            <div className={styles.actions}>
              <Link href="/contact" className={styles.primaryButton}>
                Book a Demo
              </Link>
              <Link href="/platform" className={styles.secondaryButton}>
                Explore the Platform
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Where Analytics Teams Need Better Signals</h2>
            <div className={styles.grid2}>
              {visibilityCards.map((item) => (
                <article key={item.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>How Readable Supports Measurement and Reporting</h2>
            <p className={styles.intro}>
              Readable brings AI positioning and traffic insights into one clear reporting layer.
            </p>
            <div className={styles.grid3}>
              {readableModules.map((item) => (
                <article key={item.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>What Analytics Teams Can Do</h2>
            <div className={styles.card}>
              <ul className={styles.bulletList}>
                {workflows.map((workflow) => (
                  <li key={workflow}>{workflow}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.centerShell}>
              <h2 className={styles.sectionTitle}>Turn AI Signals Into Clear Reporting.</h2>
              <div className={styles.centerActions}>
                <Link href="/contact" className={styles.primaryButton}>
                  Book a Demo
                </Link>
                <Link href="/pricing" className={styles.secondaryButton}>
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
