import Image from "next/image"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import FeatureCard from "../components/FeatureCard"
import CTASection from "../components/CTASection"
import styles from "../styles/Page.module.css"

const modules = [
  {
    id: "ai-visibility",
    title: "AI Visibility",
    description:
      "Monitor recommendation share, narrative quality, and category positioning across high-intent prompt sets.",
    points: ["Prompt intelligence", "Competitor comparison", "Position quality trends"],
    image: "/images/module-visibility.svg",
  },
  {
    id: "agent-analytics",
    title: "Agent Analytics",
    description:
      "Understand assistant-originated sessions and map behavior to conversion, retention, and revenue signals.",
    points: ["Agent traffic detection", "Journey-level insights", "Attribution reporting"],
    image: "/images/module-analytics.svg",
  },
  {
    id: "agent-ready-pages",
    title: "Agent-Ready Pages",
    description:
      "Design and optimize pages for retrieval accuracy, recommendation quality, and faster decision-making.",
    points: ["Page scorecards", "Implementation guidance", "Reusable templates"],
    image: "/images/module-pages.svg",
  },
]

export default function PlatformPage() {
  return (
    <Layout>
      <Seo
        title="Readable Platform | AI Visibility, Agent Analytics, Agent-Ready Pages"
        description="Explore Readable platform modules and use cases for AI positioning, agent analytics, and conversion-focused pages."
        path="/platform"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Platform" }]} />
            <h1 className={styles.heroTitle}>Platform Overview</h1>
            <p className={styles.heroDescription}>
              Three integrated modules help teams measure AI presence, understand agent activity, and improve
              conversion outcomes from AI-driven research.
            </p>
            <nav className={styles.mtMd} aria-label="Platform anchors">
              <a href="#ai-visibility" className={styles.inlineLink}>AI Visibility</a>{" · "}
              <a href="#agent-analytics" className={styles.inlineLink}>Agent Analytics</a>{" · "}
              <a href="#agent-ready-pages" className={styles.inlineLink}>Agent-Ready Pages</a>
            </nav>
          </div>
        </section>

        {modules.map((module, index) => (
          <section key={module.id} id={module.id} className={index % 2 === 0 ? styles.sectionAlt : styles.section}>
            <div className={styles.container}>
              <div className={styles.grid2}>
                <FeatureCard title={module.title} description={module.description} points={module.points} />
                <div className={styles.card}>
                  <Image src={module.image} alt={`${module.title} module illustration`} width={640} height={360} />
                  <h3>Use Cases</h3>
                  <ul className={styles.list}>
                    <li>Weekly leadership reporting</li>
                    <li>Category strategy planning</li>
                    <li>Content and conversion optimization</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ))}

        <CTASection
          title="See the Platform in Action"
          description="Get a walkthrough tailored to your growth model, category, and content architecture."
          primaryLabel="Book a Demo"
          primaryHref="/contact"
          secondaryLabel="See Pricing"
          secondaryHref="/pricing"
        />
      </main>
    </Layout>
  )
}
