import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import FeatureCard from "../components/FeatureCard"
import CTASection from "../components/CTASection"
import styles from "../styles/Page.module.css"

const solutions = [
  {
    title: "Growth & Performance Teams",
    description:
      "Tie AI-originated discovery to funnel metrics and prioritize the pages that improve pipeline velocity.",
    points: ["AI contribution to pipeline", "Channel-level benchmarks", "Weekly opportunity insights"],
  },
  {
    title: "Marketing Teams",
    description:
      "Control brand narrative in AI outputs with structured messaging, proof assets, and prompt-level analysis.",
    points: ["Narrative consistency", "Competitor share tracking", "Campaign-level reporting"],
  },
  {
    title: "Product Teams",
    description:
      "Improve how product capabilities are interpreted in AI recommendations with module-specific pages.",
    points: ["Capability clarity", "Feature retrieval quality", "Persona-aligned page templates"],
  },
  {
    title: "Analytics Teams",
    description:
      "Operationalize AI visibility metrics inside your existing data stack and executive reporting workflows.",
    points: ["BI export", "Data governance", "Cross-team performance dashboards"],
  },
]

export default function SolutionsPage() {
  return (
    <Layout>
      <Seo
        title="Solutions | Readable"
        description="Discover how growth, marketing, product, and analytics teams use Readable to improve AI visibility and conversion outcomes."
        path="/solutions"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Solutions" }]} />
            <h1 className={styles.heroTitle}>Solutions by Team</h1>
            <p className={styles.heroDescription}>
              Readable supports the full AI discovery workflow, from positioning visibility to conversion and
              reporting.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              {solutions.map((solution) => (
                <FeatureCard
                  key={solution.title}
                  title={solution.title}
                  description={solution.description}
                  points={solution.points}
                />
              ))}
            </div>
          </div>
        </section>

        <CTASection
          title="Map Your Team's AI Opportunity"
          description="Get a tailored plan for your org structure, reporting model, and growth goals."
          primaryLabel="Book a Demo"
          primaryHref="/contact"
          secondaryLabel="View Platform"
          secondaryHref="/platform"
        />
      </main>
    </Layout>
  )
}
