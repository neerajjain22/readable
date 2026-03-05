import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/Page.module.css"

const docsSections = [
  {
    title: "Getting Started",
    points: ["Workspace setup", "Prompt cluster configuration", "Initial dashboard review"],
  },
  {
    title: "Quickstart",
    points: ["Connect domain", "Define core categories", "Launch first tracking report"],
  },
  {
    title: "API Reference",
    points: ["Events endpoint", "Visibility scores", "Agent traffic schema"],
  },
  {
    title: "Terms & Glossary",
    points: ["AI visibility", "Position quality", "Agent-ready page definition"],
  },
]

export default function DocsPage() {
  return (
    <Layout>
      <Seo
        title="Docs | Readable"
        description="Start with Readable docs: setup guides, quickstart, API references, and glossary terms."
        path="/docs"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Docs" }]} />
            <h1 className={styles.heroTitle}>Documentation</h1>
            <p className={styles.heroDescription}>
              Launch quickly with clear implementation guides for growth, marketing, and analytics teams.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              {docsSections.map((section) => (
                <article key={section.title} className={styles.card}>
                  <h2>{section.title}</h2>
                  <ul className={styles.list}>
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className={`${styles.text} ${styles.mtMd}`}>
              Need implementation support? Contact <Link href="/contact" className={styles.inlineLink}>our team</Link>.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  )
}
