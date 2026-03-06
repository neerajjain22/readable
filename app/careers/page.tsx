import type { Metadata } from "next"
import CareersApplicationModal from "./CareersApplicationModal"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Careers | Readable",
  description:
    "Join Readable to help build the future of AI Influence and Agent Analytics across product, infrastructure, and go-to-market.",
}

const credibilityHighlights = [
  "Backed by South Park Commons",
  "Working with hundreds of companies",
  "Part of the Cloudflare for Startups program",
]

const whyJoinItems = [
  {
    title: "Category Creation",
    description: "Help define the emerging category of AI Influence and Agent Analytics.",
  },
  {
    title: "Early Team Impact",
    description: "Work directly with founders and shape the product, platform, and market.",
  },
  {
    title: "Hard Technical Problems",
    description: "Build systems that interact with AI agents, analytics pipelines, and new forms of discovery.",
  },
  {
    title: "Global Opportunity",
    description: "Our platform is used by companies across multiple industries and geographies.",
  },
]

const roles = [
  {
    title: "Founding Product Engineer",
    team: "Engineering",
    location: "Bangalore / Remote",
    type: "Full-time",
  },
  {
    title: "Senior Full Stack Engineer",
    team: "Engineering",
    location: "Bangalore / Remote",
    type: "Full-time",
  },
  {
    title: "AI Infrastructure Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Developer Relations Lead",
    team: "Developer Platform",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Growth Marketing Lead",
    team: "Growth",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Enterprise Sales Lead",
    team: "Sales",
    location: "Remote",
    type: "Full-time",
  },
]

const values = [
  "Curiosity about emerging technology",
  "Ownership and speed",
  "Clear thinking and communication",
  "Building category-defining products",
]

export default function CareersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>Help Build the Future of AI Influence</h1>
          <p className={styles.heroText}>
            Readable is building the infrastructure that helps companies understand how AI systems influence discovery,
            traffic, and buying decisions.
          </p>
          <p className={styles.heroText}>
            We work with hundreds of companies exploring how AI assistants are reshaping the internet.
          </p>
          <p className={styles.heroText}>Join us to help define an entirely new category.</p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Backed by Exceptional Partners</h2>
          <p className={styles.sectionText}>
            Readable is backed by <strong>South Park Commons</strong> and prominent angel investors who have built and
            scaled global technology companies.
          </p>
          <p className={styles.sectionText}>
            We work with <strong>hundreds of companies</strong> across software, ecommerce, education, and finance
            exploring how AI systems influence discovery and purchasing decisions.
          </p>
          <p className={styles.sectionText}>
            Readable is also part of the <strong>Cloudflare for Startups program</strong>, giving us access to
            world-class infrastructure as we build the agentic layer of the internet.
          </p>

          <div className={styles.grid3}>
            {credibilityHighlights.map((item) => (
              <article key={item} className={styles.card}>
                <h3 className={styles.cardTitle}>{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Work With Us</h2>
          <div className={styles.grid4}>
            {whyJoinItems.map((item) => (
              <article key={item.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="open-roles" className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Open Roles</h2>
          <div className={styles.rolesGrid}>
            {roles.map((role) => (
              <article key={role.title} className={styles.roleCard}>
                <h3 className={styles.roleTitle}>{role.title}</h3>
                <dl className={styles.roleMeta}>
                  <div>
                    <dt>Team</dt>
                    <dd>{role.team}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{role.location}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{role.type}</dd>
                  </div>
                </dl>
                <CareersApplicationModal roleTitle={role.title} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What We Value</h2>
          <div className={styles.grid4}>
            {values.map((value) => (
              <article key={value} className={styles.card}>
                <h3 className={styles.cardTitle}>{value}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.sectionTitle}>Join Us in Building the Future of AI Influence</h2>
            <p className={styles.sectionText}>
              Readable is defining how brands understand and influence AI-driven discovery.
            </p>
            <a href="#open-roles" className={`btn btn-primary ${styles.ctaButton}`}>
              View Open Roles
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
