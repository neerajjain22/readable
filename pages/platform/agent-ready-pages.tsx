import Image from "next/image"
import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import styles from "../../styles/agent-ready-pages.module.css"

const structureBlocks = [
  {
    title: "Structured content templates",
    body: "Pre-built page structures designed for AI retrieval patterns.",
  },
  {
    title: "Schema and metadata guidance",
    body: "Implementation guidance for machine-readable clarity.",
  },
  {
    title: "Content quality checks",
    body: "Identify ambiguity, weak positioning, and missing signals.",
  },
  {
    title: "Recommendation alignment",
    body: "Ensure your value proposition is clearly extracted by AI systems.",
  },
]

const buildBlocks = [
  "Category positioning pages",
  "Competitive comparison pages",
  "Product explainer pages",
  "FAQ and prompt-targeted pages",
  "Conversion-ready AI landing pages",
]

const steps = [
  {
    number: "Step 1",
    title: "Content Structuring",
    body: "We define page architecture optimized for AI retrieval.",
  },
  {
    number: "Step 2",
    title: "Signal Strength Optimization",
    body: "We refine headings, metadata, and semantic clarity.",
  },
  {
    number: "Step 3",
    title: "Continuous Improvement",
    body: "Monitor performance alongside AI Influence and Agent Analytics.",
  },
]

export default function AgentReadyPagesPage() {
  return (
    <Layout>
      <Seo
        title="Agent-Ready Pages | Readable"
        description="Design structured pages optimized for AI retrieval, recommendation quality, and conversion clarity."
        path="/platform/agent-ready-pages"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Platform", href: "/platform" },
                { label: "Agent-Ready Pages" },
              ]}
            />
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.heading}>Agent-Ready Pages</h1>
                <p className={styles.subheading}>
                  Design structured pages optimized for AI retrieval, recommendation quality, and conversion
                  clarity.
                </p>
                <p className={styles.description}>
                  Readable helps teams publish AI-friendly pages that improve how assistants interpret,
                  summarize, and recommend your brand.
                </p>
                <div className={styles.actions}>
                  <Link href="/contact" className={styles.primaryButton}>
                    Book a Demo
                  </Link>
                  <Link href="/platform/agent-analytics" className={styles.secondaryButton}>
                    Explore Agent Analytics
                  </Link>
                </div>
              </div>
              <div className={styles.visualCard}>
                <Image
                  src="/images/module-pages.svg"
                  alt="Agent-Ready Pages template preview"
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
            <h2 className={styles.sectionTitle}>Make Your Content Clear to AI Systems</h2>
            <p className={styles.intro}>
              AI systems retrieve, summarize, and recommend based on structure, clarity, and signal
              strength. Agent-Ready Pages ensure your most important content is understood accurately.
            </p>
            <div className={styles.grid2}>
              {structureBlocks.map((block) => (
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
            <h2 className={styles.sectionTitle}>Ship Pages Built for AI Interpretation</h2>
            <p className={styles.intro}>
              Each template is designed for retrieval accuracy and recommendation clarity.
            </p>
            <div className={styles.grid5}>
              {buildBlocks.map((item) => (
                <article key={item} className={styles.card}>
                  <h3 className={styles.cardTitle}>{item}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>How Agent-Ready Pages Work</h2>
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

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div>
                <h2 className={styles.sectionTitle}>Designed for Marketing and Content Teams</h2>
                <p className={styles.description}>
                  Agent-Ready Pages integrate with your existing CMS and publishing workflow.
                </p>
                <ul className={styles.list}>
                  <li>CMS-friendly templates</li>
                  <li>Implementation playbooks</li>
                  <li>Structured markup guidance</li>
                  <li>Ongoing content audits</li>
                </ul>
              </div>
              <div className={styles.visualCard}>
                <Image
                  src="/images/hero-dashboard.svg"
                  alt="Agent-Ready page template dashboard"
                  width={720}
                  height={440}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.crossShell}>
              <h2 className={styles.sectionTitle}>Pair with AI Influence and Agent Analytics</h2>
              <p className={styles.crossText}>
                Understand how your pages are positioned (AI Influence) and how agent traffic behaves
                (Agent Analytics).
              </p>
              <div className={styles.crossActions}>
                <Link href="/platform/ai-visibility" className={styles.secondaryButton}>
                  Explore AI Influence
                </Link>
                <Link href="/platform/agent-analytics" className={styles.secondaryButton}>
                  Explore Agent Analytics
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.ctaShell}>
              <h2 className={styles.sectionTitle}>Publish Pages AI Systems Can Understand.</h2>
              <p className={styles.ctaText}>
                Build conversion-ready content architecture that assistants can retrieve, summarize, and
                recommend with clarity.
              </p>
              <div className={styles.ctaActions}>
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
