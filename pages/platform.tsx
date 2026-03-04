import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/platform-overview.module.css"

const modules = [
  {
    title: "AI Influence",
    body: "Understand how LLMs position your brand across high-intent prompts.",
    href: "/platform/ai-visibility",
  },
  {
    title: "Agent Analytics",
    body: "Track assistant-originated sessions and measure conversion impact.",
    href: "/platform/agent-analytics",
  },
  {
    title: "Agent-Ready Pages",
    body: "Publish structured content optimized for AI retrieval and recommendation clarity.",
    href: "/platform/agent-ready-pages",
  },
]

const flow = [
  {
    label: "1. Position",
    title: "AI Influence",
    body: "AI Influence shows how AI systems describe and recommend your brand.",
  },
  {
    label: "2. Measure",
    title: "Agent Analytics",
    body: "Agent Analytics tracks how AI-driven traffic behaves on your site.",
  },
  {
    label: "3. Improve",
    title: "Agent-Ready Pages",
    body: "Agent-Ready Pages help you publish clearer, more structured content for AI systems.",
  },
]

const teams = [
  "Growth & performance teams",
  "Marketing and content teams",
  "Product and analytics teams",
  "Agencies managing multiple brands",
]

const benefits = [
  "Unified AI visibility and traffic tracking",
  "Clear attribution of assistant-driven sessions",
  "Structured publishing framework",
  "Executive-ready reporting",
  "Continuous monitoring",
]

export default function PlatformPage() {
  return (
    <Layout>
      <Seo
        title="The Readable Platform | AI Influence, Agent Analytics, Agent-Ready Pages"
        description="Explore how Readable modules work together to help teams understand, measure, and improve AI recommendation performance."
        path="/platform"
      />

      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Platform" }]} />
            <h1 className={styles.heading}>The Readable Platform</h1>
            <p className={styles.subheading}>
              AI Influence, Agent Analytics, and Agent-Ready Pages — built together to help teams
              understand, measure, and improve how AI systems recommend their brand.
            </p>
            <p className={styles.description}>
              Readable provides an integrated platform to monitor AI positioning, track agent-driven traffic,
              and publish structured pages designed for retrieval and recommendation clarity.
            </p>
            <div className={styles.actions}>
              <Link href="/contact" className={styles.primaryButton}>
                Book a Demo
              </Link>
              <Link href="/pricing" className={styles.secondaryButton}>
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Three Modules. One Integrated Platform.</h2>
            <p className={styles.intro}>
              Each module solves a distinct layer of the AI discovery process — together they provide
              complete visibility and control.
            </p>
            <div className={styles.grid3}>
              {modules.map((module) => (
                <article key={module.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{module.title}</h3>
                  <p className={styles.cardBody}>{module.body}</p>
                  <Link href={module.href} className={styles.textLink}>
                    Learn More
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Built to Work Together</h2>
            <div className={styles.stack}>
              {flow.map((step) => (
                <article key={step.label} className={styles.card}>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardBody}>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Designed for Modern Growth Teams</h2>
            <div className={styles.grid4}>
              {teams.map((team) => (
                <article key={team} className={styles.card}>
                  <h3 className={styles.cardTitle}>{team}</h3>
                </article>
              ))}
            </div>
            <p className={styles.intro}>
              Readable unifies AI positioning, traffic intelligence, and content architecture in one platform.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Why Teams Use Readable</h2>
            <div className={styles.grid4}>
              {benefits.map((benefit) => (
                <article key={benefit} className={styles.card}>
                  <p className={styles.cardBody}>{benefit}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.centerShell}>
              <h2 className={styles.sectionTitle}>See the Platform in Action.</h2>
              <p className={styles.centerText}>
                Get a walkthrough tailored to your category, growth model, and AI presence.
              </p>
              <div className={styles.centerActions}>
                <Link href="/contact" className={styles.primaryButton}>
                  Book a Demo
                </Link>
                <Link href="/platform/ai-visibility" className={styles.secondaryButton}>
                  Explore AI Influence
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
