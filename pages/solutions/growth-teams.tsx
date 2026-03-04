import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import styles from "../../styles/solutions-growth-teams.module.css"

const clarityCards = [
  {
    title: "Where AI traffic is coming from",
    body: "See which assistants and AI tools are sending visits into your funnel.",
  },
  {
    title: "Which pages influence conversion",
    body: "Identify the pages that move assistant-originated visitors toward pipeline actions.",
  },
  {
    title: "How competitors are being recommended",
    body: "Understand recommendation patterns and where competitors win share.",
  },
  {
    title: "Where positioning is costing pipeline",
    body: "Find category narratives and prompt patterns that weaken conversion outcomes.",
  },
]

const readableModules = [
  {
    title: "AI Influence",
    body: "See how AI tools talk about your brand in high-intent searches.",
  },
  {
    title: "Agent Analytics",
    body: "Track visits coming from AI tools and understand their behavior.",
  },
  {
    title: "Agent-Ready Pages",
    body: "Improve the pages AI systems reference most.",
  },
]

const workflows = [
  "Benchmark AI-driven traffic alongside paid and organic",
  "Identify underperforming AI landing pages",
  "Monitor competitor positioning shifts",
  "Prioritize content updates based on AI impact",
  "Report AI influence to leadership",
]

export default function GrowthTeamsPage() {
  return (
    <Layout>
      <Seo
        title="Readable for Growth Teams"
        description="Understand how AI influences your funnel and prioritize the opportunities that move pipeline."
        path="/solutions/growth-teams"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Solutions", href: "/solutions" },
                { label: "Growth Teams" },
              ]}
            />
            <h1 className={styles.heading}>Readable for Growth Teams</h1>
            <p className={styles.subheading}>
              Understand how AI influences your funnel and prioritize the opportunities that move pipeline.
            </p>
            <p className={styles.description}>
              Readable helps growth teams see how AI tools position their brand, track AI-driven visits, and
              improve the pages that convert.
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
            <h2 className={styles.sectionTitle}>Where Growth Teams Need Clarity</h2>
            <div className={styles.grid2}>
              {clarityCards.map((item) => (
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
            <h2 className={styles.sectionTitle}>How Readable Supports Growth</h2>
            <p className={styles.intro}>
              Readable connects AI positioning, traffic insights, and structured pages in one platform.
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
            <h2 className={styles.sectionTitle}>What You Can Do</h2>
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
              <h2 className={styles.sectionTitle}>Turn AI Influence Into Clear Growth Signals.</h2>
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
