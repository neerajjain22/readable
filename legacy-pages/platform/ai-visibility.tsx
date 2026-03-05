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
        title="AI Influence | Readable"
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
                { label: "AI Influence" },
              ]}
            />
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.heading}>AI Influence</h1>
                <p className={styles.subheading}>
                  Understand how large language models position your brand across high-intent prompts and
                  competitive categories.
                </p>
                <p className={styles.description}>
                  Readable helps growth teams track model recommendations, narrative shifts, and competitor
                  positioning across AI systems.
                </p>
                <div className={styles.actions}>
                  <Link href="/book-demo" className={styles.primaryButton}>
                    Book a Demo
                  </Link>
                  <Link href="/platform/agent-analytics" className={styles.secondaryButton}>
                    See Agent Analytics
                  </Link>
                </div>
              </div>
              <div className={styles.visualCard}>
                <div className={styles.dashboardShell}>
                  <p className={styles.dashboardTitle}>AI Influence Snapshot</p>
                  <p className={styles.dashboardSubheader}>Brand: YourBrand.com</p>
                  <p className={styles.dashboardSubheader}>Category: Online Travel Booking</p>

                  <div className={styles.dashboardSection}>
                    <p className={styles.dashboardLabel}>AI RECOMMENDATION SHARE</p>
                    <ul className={styles.shareList}>
                      <li className={styles.shareRow}>
                        <span className={styles.shareName}>Booking.com</span>
                        <span className={styles.shareBar} aria-hidden="true">
                          ██████████
                        </span>
                        <span className={styles.shareValue}>34%</span>
                      </li>
                      <li className={styles.shareRow}>
                        <span className={styles.shareName}>Expedia</span>
                        <span className={styles.shareBar} aria-hidden="true">
                          ████████
                        </span>
                        <span className={styles.shareValue}>26%</span>
                      </li>
                      <li className={styles.shareRow}>
                        <span className={styles.shareName}>Airbnb</span>
                        <span className={styles.shareBar} aria-hidden="true">
                          ██████
                        </span>
                        <span className={styles.shareValue}>18%</span>
                      </li>
                      <li className={styles.shareRow}>
                        <span className={styles.shareName}>YourBrand.com</span>
                        <span className={styles.shareBar} aria-hidden="true">
                          █████
                        </span>
                        <span className={styles.shareValue}>14%</span>
                      </li>
                      <li className={styles.shareRow}>
                        <span className={styles.shareName}>TripAdvisor</span>
                        <span className={styles.shareBar} aria-hidden="true">
                          ████
                        </span>
                        <span className={styles.shareValue}>8%</span>
                      </li>
                    </ul>
                  </div>

                  <div className={styles.dashboardSection}>
                    <p className={styles.dashboardLabel}>TOP ASSOCIATED ATTRIBUTES</p>
                    <ul className={styles.attributeList}>
                      <li>affordable hotel deals</li>
                      <li>flexible travel bookings</li>
                      <li>last-minute travel offers</li>
                      <li>family-friendly stays</li>
                    </ul>
                  </div>

                  <p className={styles.dashboardInsight}>
                    YourBrand.com appears in 14% of AI recommendations for &quot;best travel booking sites&quot;.
                  </p>
                  <p className={styles.dashboardFootnote}>Example AI Influence analysis</p>
                </div>
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
            <h2 className={styles.sectionTitle}>How AI Influence Works</h2>
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
                  Use AI Influence to standardize how your team tracks recommendation quality, monitors
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
                <div className={styles.dashboardShell}>
                  <p className={styles.dashboardTitle}>AI Influence Dashboard</p>

                  <div className={styles.dashboardSection}>
                    <p className={styles.dashboardLabel}>PROMPT CLUSTERS MONITORED</p>
                    <ul className={styles.attributeList}>
                      <li>best travel booking sites</li>
                      <li>cheap hotel booking platforms</li>
                      <li>last-minute travel deals</li>
                      <li>family vacation booking sites</li>
                      <li>flexible cancellation hotel platforms</li>
                    </ul>
                  </div>

                  <div className={styles.dashboardSection}>
                    <p className={styles.dashboardLabel}>WEEKLY AI RECOMMENDATION MOVEMENT</p>
                    <div className={styles.metricCard}>
                      <p className={styles.metricTitle}>YourBrand.com</p>
                      <p className={styles.metricValuePositive}>↑ +6 recommendation appearances</p>
                    </div>
                    <div className={styles.metricCard}>
                      <p className={styles.metricTitle}>Booking.com</p>
                      <p className={styles.metricValueNegative}>↓ -3 appearances</p>
                    </div>
                    <div className={styles.metricCard}>
                      <p className={styles.metricTitle}>Expedia</p>
                      <p className={styles.metricValuePositive}>↑ +2 appearances</p>
                    </div>
                  </div>

                  <div className={styles.dashboardSection}>
                    <p className={styles.dashboardLabel}>NARRATIVE SHIFT DETECTED</p>
                    <p className={styles.narrativeText}>
                      AI assistants increasingly describe YourBrand.com as:
                      <br />
                      <span className={styles.narrativeQuote}>&quot;best last-minute hotel booking platform&quot;</span>
                      <br />
                      instead of
                      <br />
                      <span className={styles.narrativeQuote}>&quot;discount travel aggregator&quot;</span>
                    </p>
                  </div>

                  <p className={styles.dashboardInsight}>
                    YourBrand.com influence increased across 3 high-intent travel prompt clusters this week.
                  </p>
                  <p className={styles.dashboardFootnote}>Example weekly AI Influence dashboard</p>
                </div>
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
                <Link href="/book-demo" className={styles.primaryButton}>
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
