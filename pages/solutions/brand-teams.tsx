import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import styles from "../../styles/solutions-brand-teams.module.css"

const visibilityCards = [
  {
    title: "How AI tools describe your brand",
    body: "See how assistants summarize and recommend your company.",
  },
  {
    title: "How competitors are positioned",
    body: "Understand where competitors gain narrative advantage.",
  },
  {
    title: "Category messaging consistency",
    body: "Identify where your positioning is unclear or diluted.",
  },
  {
    title: "Brand narrative shifts over time",
    body: "Monitor how descriptions evolve across AI systems.",
  },
]

const readableModules = [
  {
    title: "AI Influence",
    body: "Monitor how AI tools present your brand across high-intent searches.",
  },
  {
    title: "Agent Analytics",
    body: "Understand how AI-driven visitors engage with your key pages.",
  },
  {
    title: "Agent-Ready Pages",
    body: "Improve how your value proposition is structured and interpreted.",
  },
]

const workflows = [
  "Benchmark AI-generated descriptions against competitors",
  "Identify weak or inconsistent messaging",
  "Prioritize updates to high-impact pages",
  "Monitor brand positioning trends",
  "Share clear AI positioning reports with leadership",
]

export default function BrandTeamsPage() {
  return (
    <Layout>
      <Seo
        title="Readable for Brand Teams"
        description="Understand how AI tools describe your brand and ensure your positioning stays clear and consistent."
        path="/solutions/brand-teams"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Solutions", href: "/solutions" },
                { label: "Brand Teams" },
              ]}
            />
            <h1 className={styles.heading}>Readable for Brand Teams</h1>
            <p className={styles.subheading}>
              Understand how AI tools describe your brand and ensure your positioning stays clear and
              consistent.
            </p>
            <p className={styles.description}>
              Readable helps brand teams monitor AI-generated descriptions, track competitor narratives, and
              improve how their category story is represented.
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
            <h2 className={styles.sectionTitle}>Where Brand Teams Need Visibility</h2>
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
            <h2 className={styles.sectionTitle}>How Readable Supports Brand Strategy</h2>
            <p className={styles.intro}>
              Readable brings AI positioning insights and content structure into one platform.
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
            <h2 className={styles.sectionTitle}>What Brand Teams Can Do</h2>
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
              <h2 className={styles.sectionTitle}>Keep Your Brand Position Clear in AI Systems.</h2>
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
