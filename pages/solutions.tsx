import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import Link from "next/link"
import CTASection from "../components/CTASection"
import styles from "../styles/Page.module.css"

const solutions = [
  {
    title: "Growth Teams",
    description:
      "Understand how AI tools influence your funnel and prioritize the opportunities that move pipeline.",
    points: [
      "AI-driven traffic visibility",
      "Conversion influence insights",
      "Competitive positioning tracking",
    ],
    href: "/solutions/growth-teams",
    linkLabel: "View Growth Teams",
  },
  {
    title: "Brand Teams",
    description:
      "Monitor how AI systems describe your brand and maintain clear, consistent positioning.",
    points: [
      "AI-generated brand summaries",
      "Competitive narrative comparison",
      "Category messaging clarity",
    ],
    href: "/solutions/brand-teams",
    linkLabel: "View Brand Teams",
  },
  {
    title: "Product Teams",
    description:
      "Ensure product capabilities are clearly understood and accurately represented in AI systems.",
    points: [
      "Feature positioning visibility",
      "Competitive feature comparisons",
      "Product messaging consistency",
    ],
    href: "/solutions/product-teams",
    linkLabel: "View Product Teams",
  },
  {
    title: "Analytics Teams",
    description:
      "Measure AI-driven traffic and make visibility insights easy to report across the organization.",
    points: ["AI traffic measurement", "Attribution clarity", "Executive-ready reporting"],
    href: "/solutions/analytics-teams",
    linkLabel: "View Analytics Teams",
  },
]

export default function SolutionsPage() {
  return (
    <Layout>
      <Seo
        title="Solutions | Readable"
        description="Discover how growth, brand, product, and analytics teams use Readable to improve AI visibility and conversion outcomes."
        path="/solutions"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Solutions" }]} />
            <h1 className={styles.heroTitle}>Solutions by Team</h1>
            <p className={styles.heroDescription}>
              Readable helps growth, brand, product, and analytics teams understand and improve how AI
              systems influence discovery and conversion.
            </p>
            <p className={styles.heroDescription}>
              From AI positioning to agent-driven traffic and structured page improvements, each team gets
              the clarity they need to act.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              {solutions.map((solution) => (
                <article key={solution.title} className={styles.card}>
                  <h3>{solution.title}</h3>
                  <p className={styles.text}>{solution.description}</p>
                  <ul className={styles.list}>
                    {solution.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <div className={styles.mtMd}>
                    <Link href={solution.href} className={styles.inlineLink}>
                      {solution.linkLabel} →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CTASection
          title="Find the Right AI Strategy for Your Team."
          description="Get a tailored walkthrough based on your goals and reporting model."
          primaryLabel="Book a Demo"
          primaryHref="/book-demo"
          secondaryLabel="View Platform"
          secondaryHref="/platform"
        />
      </main>
    </Layout>
  )
}
