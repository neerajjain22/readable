import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import styles from "../../styles/solutions-product-teams.module.css"

const visibilityCards = [
  {
    title: "How AI describes your product",
    body: "See how assistants summarize your capabilities.",
  },
  {
    title: "Feature positioning accuracy",
    body: "Identify where descriptions are incomplete or misleading.",
  },
  {
    title: "Competitive feature comparisons",
    body: "Understand how competitors are framed in AI responses.",
  },
  {
    title: "Product narrative consistency",
    body: "Ensure messaging aligns across pages and AI outputs.",
  },
]

const readableModules = [
  {
    title: "AI Influence",
    body: "Monitor how product capabilities are represented across AI tools.",
  },
  {
    title: "Agent Analytics",
    body: "Understand how AI-driven visitors engage with product pages.",
  },
  {
    title: "Agent-Ready Pages",
    body: "Improve structure and clarity of feature and comparison pages.",
  },
]

const workflows = [
  "Benchmark AI descriptions of product features",
  "Identify gaps in capability messaging",
  "Improve comparison and feature pages",
  "Monitor how product positioning evolves",
  "Share clear positioning insights internally",
]

export default function ProductTeamsPage() {
  return (
    <Layout>
      <Seo
        title="Readable for Product Teams"
        description="Ensure your product capabilities are clearly understood and accurately represented in AI systems."
        path="/solutions/product-teams"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Solutions", href: "/solutions" },
                { label: "Product Teams" },
              ]}
            />
            <h1 className={styles.heading}>Readable for Product Teams</h1>
            <p className={styles.subheading}>
              Ensure your product capabilities are clearly understood and accurately represented in AI
              systems.
            </p>
            <p className={styles.description}>
              Readable helps product teams monitor how features are described, improve clarity in AI
              summaries, and strengthen how product value is communicated.
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
            <h2 className={styles.sectionTitle}>Where Product Teams Need Visibility</h2>
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
            <h2 className={styles.sectionTitle}>How Readable Supports Product Communication</h2>
            <p className={styles.intro}>
              Readable connects AI positioning insights with structured content improvements.
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
            <h2 className={styles.sectionTitle}>What Product Teams Can Do</h2>
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
              <h2 className={styles.sectionTitle}>Make Your Product Value Clear in AI Systems.</h2>
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
