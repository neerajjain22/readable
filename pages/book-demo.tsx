import Image from "next/image"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/book-demo.module.css"

const demoItems = [
  {
    title: "AI Influence Dashboard",
    description: "See how AI systems describe your brand and competitors.",
  },
  {
    title: "Agent Analytics",
    description: "Understand AI-driven visits, referrals, and buyer journeys.",
  },
  {
    title: "Agent-Optimized Pages",
    description: "Learn how to structure pages for AI discovery and recommendation.",
  },
]

const outcomes = [
  "How AI systems describe your brand",
  "Where AI assistants recommend competitors",
  "How much traffic AI is influencing",
  "What improvements will increase your AI visibility",
]

export default function BookDemoPage() {
  return (
    <Layout>
      <Seo
        title="Book a Demo | Readable"
        description="Book a live walkthrough of Readable to understand AI influence, agent-driven traffic, and opportunities to improve your AI presence."
        path="/book-demo"
      />
      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Book a Demo" }]} />
            <h1 className={styles.heading}>Ready to Understand How AI Influences Your Business</h1>
            <p className={styles.subheading}>
              Book a live walkthrough of Readable to see how AI systems describe your brand, how AI
              assistants influence buyers, and where your website can improve its AI presence.
            </p>
            <p className={styles.reassurance}>30-minute live demo • No preparation required</p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <p className={styles.proof}>
              Teams from 100+ companies already analyze their AI influence using Readable.
            </p>
            <div className={styles.calendarShell}>
              <iframe
                src="https://cal.com/neeraj-jain-eveucp/30min"
                title="Book a demo calendar"
                width="100%"
                height="700"
                frameBorder="0"
                style={{ border: "none", borderRadius: "12px" }}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>What You&apos;ll See in the Demo</h2>
            <div className={styles.grid3}>
              {demoItems.map((item) => (
                <article key={item.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.text}>{item.description}</p>
                  <div className={styles.previewPlaceholder} aria-label={`${item.title} screenshot placeholder`} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>What You&apos;ll Walk Away With</h2>
            <ul className={styles.list}>
              {outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Your Host</h2>
            <article className={styles.card}>
              <div className={styles.hostRow}>
                <div>
                  <p className={styles.hostName}>Neeraj Jain</p>
                  <p className={styles.hostMeta}>Founder, Readable</p>
                </div>
                <a
                  href="https://www.linkedin.com/in/nj123/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Neeraj Jain LinkedIn profile"
                  className={styles.linkedinIcon}
                >
                  <Image src="/images/icons/linkedin.svg" alt="LinkedIn profile" width={20} height={20} />
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>
    </Layout>
  )
}
