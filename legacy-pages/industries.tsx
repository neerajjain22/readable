import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import IndustryBlock from "../components/IndustryBlock"
import CTASection from "../components/CTASection"
import styles from "../styles/Page.module.css"

const industries = [
  {
    name: "Ecommerce",
    summary: "Improve product and category discoverability in AI shopping and comparison prompts.",
    bullets: ["Category recommendation tracking", "Collection page optimization", "High-intent conversion lift"],
  },
  {
    name: "B2B SaaS",
    summary: "Control positioning in long-form evaluative prompts used by buying committees.",
    bullets: ["Prompt-set benchmarking", "Competitor narrative analysis", "Pipeline attribution"],
  },
  {
    name: "Developer Tools & Platforms",
    summary: "Ensure technical capabilities are accurately represented in AI-assisted research.",
    bullets: ["Technical proof pages", "Feature retrieval improvements", "Persona-specific copy guidance"],
  },
  {
    name: "Financial Services",
    summary: "Maintain compliant, trustworthy messaging in AI-generated summaries and recommendations.",
    bullets: ["Narrative consistency controls", "Risk-aware content structures", "Governance-friendly reporting"],
  },
  {
    name: "Agencies",
    summary: "Manage multi-client AI visibility programs with repeatable delivery and reporting.",
    bullets: ["White-label reporting", "Multi-workspace operations", "Partner-grade workflows"],
  },
]

export default function IndustriesPage() {
  return (
    <Layout>
      <Seo
        title="Industries | Readable"
        description="See how ecommerce, SaaS, developer, financial, and agency teams use Readable for AI visibility and agent analytics."
        path="/industries"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Industries" }]} />
            <h1 className={styles.heroTitle}>Industry-Specific Programs</h1>
            <p className={styles.heroDescription}>
              Readable adapts to each market’s buying behavior, compliance needs, and content architecture.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              {industries.map((industry) => (
                <IndustryBlock key={industry.name} {...industry} />
              ))}
            </div>
          </div>
        </section>

        <CTASection
          title="See Your Industry Benchmark"
          description="We’ll map your current AI visibility against competitor positioning in your market segment."
          primaryLabel="Book a Demo"
          primaryHref="/book-demo"
        />
      </main>
    </Layout>
  )
}
