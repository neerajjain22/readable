import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import CTASection from "../components/CTASection"
import { caseStudies } from "../data/caseStudies"
import styles from "../styles/Page.module.css"

export default function CaseStudiesPage() {
  return (
    <Layout>
      <Seo
        title="Case Studies | Readable"
        description="See outcomes from teams using Readable for AI visibility, agent analytics, and agent-ready page execution."
        path="/case-studies"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Case Studies" }]} />
            <h1 className={styles.heroTitle}>Case Studies</h1>
            <p className={styles.heroDescription}>
              Outcome-focused examples inspired by SonicLinker delivery patterns and adapted to Readable.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid3}>
              {caseStudies.map((study) => (
                <article key={study.slug} className={styles.card}>
                  <h2>{study.company}</h2>
                  <p className={styles.text}>{study.industry}</p>
                  <p className={styles.text}>{study.summary}</p>
                  <ul className={styles.list}>
                    {study.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                  <h3>Challenge</h3>
                  <p className={styles.text}>{study.challenge}</p>
                  <h3>Solution</h3>
                  <p className={styles.text}>{study.solution}</p>
                  <h3>Result</h3>
                  <p className={styles.text}>{study.result}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CTASection
          title="Want Similar Outcomes?"
          description="We can map your baseline and design a practical roadmap to improve AI-sourced conversion."
          primaryLabel="Book a Demo"
          primaryHref="/contact"
        />
      </main>
    </Layout>
  )
}
