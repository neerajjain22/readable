import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/Page.module.css"

const papers = [
  {
    title: "AI Visibility Benchmark Report",
    summary: "A framework for measuring recommendation quality and category position across prompt clusters.",
  },
  {
    title: "Agent Analytics Operating Model",
    summary: "How to connect assistant-originated sessions to pipeline and revenue outcomes.",
  },
  {
    title: "Agent-Ready Content Design",
    summary: "A practical template system for pages optimized for retrieval and conversion.",
  },
]

export default function WhitepapersPage() {
  return (
    <Layout>
      <Seo
        title="Whitepapers | Readable"
        description="Download whitepapers on AI visibility strategy, agent analytics, and agent-ready content programs."
        path="/whitepapers"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Resources", href: "/resources" },
                { label: "Whitepapers" },
              ]}
            />
            <h1 className={styles.heroTitle}>Whitepapers</h1>
            <p className={styles.heroDescription}>Research-backed frameworks for building AI-led growth programs.</p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid3}>
              {papers.map((paper) => (
                <article key={paper.title} className={styles.card}>
                  <h2>{paper.title}</h2>
                  <p className={styles.text}>{paper.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
