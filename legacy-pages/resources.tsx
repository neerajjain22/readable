import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import NewsletterForm from "../components/NewsletterForm"
import styles from "../styles/Page.module.css"

const resources = [
  { href: "/blog", title: "Blog", summary: "Insights on AI visibility, agent analytics, and GTM execution." },
  { href: "/guides", title: "Guides", summary: "Field guides and programmatic collections for AI visibility." },
  { href: "/case-studies", title: "Case Studies", summary: "Real outcomes from B2B teams using Readable." },
  { href: "/docs", title: "Docs", summary: "Guides, references, and implementation resources." },
  { href: "/careers", title: "Careers", summary: "Join Readable to help build the future of AI influence." },
]

export default function ResourcesPage() {
  return (
    <Layout>
      <Seo
        title="Resources | Readable"
        description="Explore Readable resources including blog posts, case studies, documentation, and careers."
        path="/resources"
      />
      <main className={styles.page}>
        <section className={styles.section} style={{ paddingTop: "var(--section-spacing-large)", paddingBottom: "var(--section-spacing-large)" }}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
            <h1 className={styles.heroTitle}>Resource Center</h1>
            <p className={styles.heroDescription}>
              Learn how teams design, measure, and scale AI visibility programs with practical playbooks.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt} style={{ paddingTop: "var(--section-spacing-large)", paddingBottom: "var(--section-spacing-large)" }}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              {resources.map((resource) => (
                <article key={resource.title} className={styles.card}>
                  <h2>
                    <Link href={resource.href} className={styles.inlineLink}>
                      {resource.title}
                    </Link>
                  </h2>
                  <p className={styles.text}>{resource.summary}</p>
                </article>
              ))}
            </div>
            <div className={styles.mtMd}>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
