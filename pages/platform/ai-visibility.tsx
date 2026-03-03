import Image from "next/image"
import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import styles from "../../styles/ai-visibility.module.css"

const monitoringBlocks = [
  {
    title: "Prompt cluster tracking",
    body: "Monitor how your brand appears across strategic high-intent prompt groups.",
  },
  {
    title: "Competitive positioning",
    body: "Compare recommendation share vs competitors.",
  },
  {
    title: "Narrative drift detection",
    body: "Identify changes in how AI describes your category.",
  },
  {
    title: "Position quality scoring",
    body: "Measure clarity, authority, and recommendation strength.",
  },
]

const steps = [
  {
    number: "Step 1",
    title: "Prompt Mapping",
    body: "We map high-intent prompts relevant to your category.",
  },
  {
    number: "Step 2",
    title: "Model Monitoring",
    body: "We evaluate how major LLMs position your brand vs competitors.",
  },
  {
    number: "Step 3",
    title: "Insight Reporting",
    body: "You get structured reports and trend tracking.",
  },
]

const useCases = [
  "Weekly leadership reporting",
  "Category strategy planning",
  "Competitive intelligence",
  "Content refinement",
]

export default function AIVisibilityPage() {
  return (
    <Layout>
      <Seo
        title="AI Visibility | Readable"
        description="Understand how LLMs position your brand across high-intent prompts and competitive categories."
        path="/platform/ai-visibility"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Platform", href: "/platform" },
                { label: "AI Visibility" },
              ]}
            />
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.heading}>AI Visibility</h1>
                <p className={styles.subheading}>
                  Understand how large language models position your brand across high-intent prompts and
                  competitive categories.
                </p>
                <p className={styles.description}>
                  Readable helps growth teams track model recommendations, narrative shifts, and competitor
                  positioning across AI systems.
                </p>
                <div className={styles.actions}>
                  <Link href="/contact" className={styles.primaryButton}>
                    Book a Demo
                  </Link>
                  <Link href="/platform/agent-analytics" className={styles.secondaryButton}>
                    See Agent Analytics
                  </Link>
                </div>
              </div>
              <div className={styles.visualCard}>
                <Image
                  src="/images/module-visibility.svg"
                  alt="AI Visibility dashboard preview"
                  width={720}
                  height={440}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Track Your AI Positioning with Precision</h2>
            <div className={styles.grid2}>
              {monitoringBlocks.map((block) => (
                <article key={block.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{block.title}</h3>
                  <p className={styles.cardBody}>{block.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>How AI Visibility Works</h2>
            <div className={styles.grid3}>
              {steps.map((step) => (
                <article key={step.title} className={styles.card}>
                  <p className={styles.stepNumber}>{step.number}</p>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardBody}>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Built for Growth and Strategy Teams</h2>
            <div className={styles.grid4}>
              {useCases.map((useCase) => (
                <article key={useCase} className={styles.card}>
                  <h3 className={styles.cardTitle}>{useCase}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div>
                <h2 className={styles.sectionTitle}>Operational Visibility for Weekly Execution</h2>
                <p className={styles.description}>
                  Use AI Visibility to standardize how your team tracks recommendation quality, monitors
                  competitor movement, and prioritizes where to improve positioning first.
                </p>
                <div className={styles.crossLinks}>
                  <Link href="/platform/agent-analytics" className={styles.crossLink}>
                    Explore Agent Analytics
                  </Link>
                  <Link href="/platform" className={styles.crossLink}>
                    View Platform Overview
                  </Link>
                </div>
              </div>
              <div className={styles.visualCard}>
                <Image
                  src="/images/hero-dashboard.svg"
                  alt="Readable product dashboard mockup"
                  width={720}
                  height={440}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.ctaShell}>
              <h2 className={styles.sectionTitle}>See How AI Positions Your Brand.</h2>
              <p className={styles.ctaText}>
                Get a focused walkthrough of your category prompts, recommendation patterns, and competitive
                movement.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/contact" className={styles.primaryButton}>
                  Book a Demo
                </Link>
                <Link href="/platform/agent-analytics" className={styles.secondaryButton}>
                  Explore Agent Analytics
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
