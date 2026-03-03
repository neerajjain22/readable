import Image from "next/image"
import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import styles from "../../styles/agent-analytics.module.css"

const trackingBlocks = [
  {
    title: "Agent traffic detection",
    body: "Identify assistant and AI-agent originated sessions in real time.",
  },
  {
    title: "AI source attribution",
    body: "Understand which AI systems are sending traffic.",
  },
  {
    title: "Journey-level insights",
    body: "Map pages viewed, time on site, and conversion paths.",
  },
  {
    title: "Conversion influence tracking",
    body: "Measure downstream impact on signups, demos, and purchases.",
  },
  {
    title: "Session segmentation",
    body: "Filter agent traffic by source, prompt type, and landing page.",
  },
  {
    title: "Revenue signal mapping",
    body: "Connect AI traffic to pipeline and revenue events.",
  },
]

const steps = [
  {
    number: "Step 1",
    title: "Detection Layer",
    body: "We identify agent-originated sessions using request patterns and metadata signals.",
  },
  {
    number: "Step 2",
    title: "Behavioral Mapping",
    body: "Sessions are mapped across your site and conversion funnel.",
  },
  {
    number: "Step 3",
    title: "Impact Attribution",
    body: "You see how agent traffic contributes to measurable outcomes.",
  },
]

const useCases = [
  "Demand generation reporting",
  "Product-led growth measurement",
  "AI acquisition benchmarking",
  "Campaign influence analysis",
]

export default function AgentAnalyticsPage() {
  return (
    <Layout>
      <Seo
        title="Agent Analytics | Readable"
        description="Identify AI agent traffic, map behavior, and measure assistant-driven conversion impact."
        path="/platform/agent-analytics"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Platform", href: "/platform" },
                { label: "Agent Analytics" },
              ]}
            />
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.heading}>Agent Analytics</h1>
                <p className={styles.subheading}>
                  Identify AI agent traffic, understand session behavior, and measure how assistant-driven
                  visits influence conversion.
                </p>
                <p className={styles.description}>
                  Readable detects assistant- and agent-originated traffic, maps journeys, and ties activity
                  to real outcomes.
                </p>
                <div className={styles.actions}>
                  <Link href="/contact" className={styles.primaryButton}>
                    Book a Demo
                  </Link>
                  <Link href="/platform/ai-visibility" className={styles.secondaryButton}>
                    Explore AI Visibility
                  </Link>
                </div>
              </div>
              <div className={styles.visualCard}>
                <Image
                  src="/images/module-analytics.svg"
                  alt="Agent Analytics dashboard preview"
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
            <h2 className={styles.sectionTitle}>See What AI Agents Are Doing on Your Site</h2>
            <div className={styles.grid2}>
              {trackingBlocks.map((block) => (
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
            <h2 className={styles.sectionTitle}>How Agent Analytics Works</h2>
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
            <div className={styles.heroGrid}>
              <div>
                <h2 className={styles.sectionTitle}>Built for Growth and Performance Teams</h2>
                <p className={styles.description}>
                  Monitor assistant-originated traffic alongside traditional acquisition channels.
                </p>
                <ul className={styles.list}>
                  <li>Dedicated agent traffic dashboard</li>
                  <li>Channel comparison view</li>
                  <li>Funnel attribution reporting</li>
                  <li>Weekly exportable summaries</li>
                </ul>
              </div>
              <div className={styles.visualCard}>
                <Image
                  src="/images/hero-dashboard.svg"
                  alt="Agent traffic dashboard mockup"
                  width={720}
                  height={440}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Operational Use Cases</h2>
            <div className={styles.grid2}>
              {useCases.map((useCase) => (
                <article key={useCase} className={styles.card}>
                  <h3 className={styles.cardTitle}>{useCase}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.crossShell}>
              <h2 className={styles.sectionTitle}>Looking for AI Positioning Insights?</h2>
              <p className={styles.crossText}>
                Combine Agent Analytics with AI Visibility to understand both how AI positions your brand and
                how agent traffic behaves.
              </p>
              <div className={styles.crossAction}>
                <Link href="/platform/ai-visibility" className={styles.secondaryButton}>
                  Explore AI Visibility
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.ctaShell}>
              <h2 className={styles.sectionTitle}>Track AI Agent Traffic with Confidence.</h2>
              <p className={styles.ctaText}>
                See assistant-originated behavior clearly, prioritize highest-value actions, and report impact
                with confidence.
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
