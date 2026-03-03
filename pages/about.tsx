import Image from "next/image"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import CTASection from "../components/CTASection"
import styles from "../styles/Page.module.css"

const milestones = [
  { year: "2023", detail: "SonicLinker launched with a focus on AI discovery intelligence." },
  { year: "2024", detail: "Expanded into agent analytics and enterprise reporting workflows." },
  { year: "2025", detail: "Introduced agent-ready page optimization for conversion use cases." },
  { year: "2026", detail: "Rebranded to Readable with a dedicated AI visibility platform strategy." },
]

const leaders = [
  { name: "Aarav Singh", role: "CEO", image: "/images/team-1.svg" },
  { name: "Nina Rao", role: "Head of Product", image: "/images/team-2.svg" },
  { name: "Karan Mehta", role: "VP Partnerships", image: "/images/team-3.svg" },
]

export default function AboutPage() {
  return (
    <Layout>
      <Seo
        title="About Readable | From SonicLinker to AI Visibility Platform"
        description="Learn why Readable exists, how the company evolved from SonicLinker, and the team vision behind AI visibility and agent analytics."
        path="/about"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
            <h1 className={styles.heroTitle}>About Readable</h1>
            <p className={styles.heroDescription}>
              Readable exists because revenue teams need a reliable way to understand how AI systems shape
              buyer decisions. Built from SonicLinker’s foundation, we help teams move from guesswork to
              measurable outcomes in AI-led discovery.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              <article className={styles.card}>
                <h2>Mission</h2>
                <p className={styles.text}>
                  Help every growth team improve how their brand is interpreted, recommended, and trusted in
                  AI-mediated journeys.
                </p>
              </article>
              <article className={styles.card}>
                <h2>Vision</h2>
                <p className={styles.text}>
                  Become the operating layer for AI visibility across marketing, product, analytics, and
                  agency ecosystems.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.heroTitle}>Leadership</h2>
            <div className={`${styles.grid3} ${styles.mtMd}`}>
              {leaders.map((leader) => (
                <article key={leader.name} className={styles.card}>
                  <Image src={leader.image} alt={leader.name} width={320} height={200} />
                  <h3>{leader.name}</h3>
                  <p className={styles.text}>{leader.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.heroTitle}>Timeline</h2>
            <div className={`${styles.grid2} ${styles.mtMd}`}>
              {milestones.map((item) => (
                <article key={item.year} className={styles.card}>
                  <h3>{item.year}</h3>
                  <p className={styles.text}>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CTASection
          title="Build Your AI Visibility Strategy"
          description="Talk to our team about your category, current AI positioning, and the fastest path to measurable lift."
          primaryLabel="Book a Demo"
          primaryHref="/contact"
          secondaryLabel="View Platform"
          secondaryHref="/platform"
        />
      </main>
    </Layout>
  )
}
