import Image from "next/image"
import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/case-studies.module.css"

const logos = [
  "Public B2B SaaS Company",
  "D2C Healthcare Wearable Brand",
  "Major Middle East E-commerce Group",
]

const insights = [
  {
    metric: "Up to 25%",
    text: "of site visits identified as AI-agent originated",
  },
  {
    metric: "2-3x",
    text: "increase in human visits via AI systems",
  },
  {
    metric: "Higher",
    text: "than average conversion from AI-referred sessions",
  },
  {
    metric: "Executive-ready",
    text: "reporting on AI-influenced pipeline",
  },
]

const studies = [
  {
    company: "Northline Cloud",
    industry: "Public B2B SaaS",
    situation:
      "Leadership needed clearer visibility into how AI tools were positioning the company in category and comparison prompts.",
    implemented:
      "Readable mapped high-intent prompts, monitored recommendation share, and introduced weekly reporting tied to pipeline reviews.",
    outcomes: [
      "AI-originated session visibility became a standard operating metric",
      "Category positioning gaps were identified earlier",
      "Team decisions shifted from assumptions to trackable signals",
    ],
  },
  {
    company: "VitalBand",
    industry: "D2C Healthcare Wearables",
    situation:
      "The growth team saw unexplained traffic swings and needed to understand whether AI assistants were influencing product discovery.",
    implemented:
      "Readable deployed agent analytics and page-level tracking to separate AI-referred visits from other channels.",
    outcomes: [
      "AI-driven sessions became measurable as a distinct source",
      "Landing-page updates were prioritized based on AI behavior",
      "Conversion discussions included AI influence in weekly reporting",
    ],
  },
  {
    company: "SouqSphere Group",
    industry: "Regional E-commerce",
    situation:
      "Multiple brand teams needed a consistent way to understand how AI systems described their offerings across markets.",
    implemented:
      "Readable launched structured monitoring across key categories and created shared reporting views for brand and analytics teams.",
    outcomes: [
      "Cross-brand AI positioning reviews became consistent",
      "Narrative drift was flagged before major campaign launches",
      "Executive updates included clear AI-influenced performance summaries",
    ],
  },
]

const testimonials = [
  {
    quote:
      "Setup was 15 mins. No major changes. We didn't know we were getting so much AI traffic. Deploying Agent Website has led to 2x lift in clicks and referrals from AI search.",
    name: "Joshua D'Costa",
    role: "Head of Growth & Marketing",
    company: "Dodo Payments",
    linkedin: "https://www.linkedin.com/in/joshua-d-costa/",
  },
  {
    quote:
      "Setup took minutes. Agent Website has led to 2.5X growth in clicks from AI searches on our Shopify product pages.",
    name: "Rajat Malik",
    role: "Chief of Staff",
    company: "BeatO",
    linkedin: "https://www.linkedin.com/in/rajat-malik-beato-foundersoffice-growth/",
  },
  {
    quote: "We had no clue we were getting thousands of visits a day from LLMs. ROI is clear from day one.",
    name: "Arjun Pande",
    role: "Sr Director, Brand and Strategy",
    company: ".Store Domain",
    linkedin: "https://www.linkedin.com/in/arjunpande/",
  },
]

export default function CaseStudiesPage() {
  return (
    <Layout>
      <Seo
        title="Case Studies | Readable"
        description="See outcomes from teams using Readable for AI visibility, agent analytics, and agent-ready page execution."
        path="/case-studies"
      />
      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Case Studies" }]} />
            <h1 className={styles.heading}>How Leading Brands Turn AI Influence Into Measurable Growth</h1>
            <p className={styles.subheading}>
              Public SaaS companies, global e-commerce brands, and direct-to-consumer leaders use Readable
              to uncover hidden AI-driven traffic, improve positioning, and increase conversion from
              AI-referred visitors.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.logoStrip} aria-label="Customer segments">
              {logos.map((logo) => (
                <p key={logo} className={styles.logoItem}>
                  {logo}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.grid4}>
              {insights.map((insight) => (
                <article key={insight.metric + insight.text} className={styles.statCard}>
                  <p className={styles.statValue}>{insight.metric}</p>
                  <p className={styles.statText}>{insight.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid3}>
              {studies.map((study) => (
                <article key={study.company} className={styles.card}>
                  <h2 className={styles.cardTitle}>{study.company}</h2>
                  <p className={styles.tag}>{study.industry}</p>

                  <h3 className={styles.blockTitle}>The Situation</h3>
                  <p className={styles.text}>{study.situation}</p>

                  <h3 className={styles.blockTitle}>What We Implemented</h3>
                  <p className={styles.text}>{study.implemented}</p>

                  <h3 className={styles.blockTitle}>The Outcome</h3>
                  <ul className={styles.list}>
                    {study.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>What Teams Are Saying</h2>
            <div className={styles.grid3}>
              {testimonials.map((item) => (
                <article key={item.name + item.company} className={styles.testimonialCard}>
                  <p className={styles.quote}>{item.quote}</p>
                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <p className={styles.personName} style={{ margin: 0 }}>
                        {item.name}
                      </p>
                      <p className={styles.personMeta} style={{ marginTop: "4px", marginBottom: 0 }}>
                        {item.role} - {item.company}
                      </p>
                    </div>
                    <a
                      href={item.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.name} LinkedIn profile`}
                      className={styles.linkedinIcon}
                    >
                      <Image src="/images/icons/linkedin.svg" alt="LinkedIn profile" width={20} height={20} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.ctaShell}>
              <h2 className={styles.sectionTitle}>Understand How AI Is Shaping Your Brand Today</h2>
              <p className={styles.ctaText}>
                We&apos;ll show you how AI systems describe your brand, how much traffic they influence, and
                where to improve.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/book-demo" className={styles.primaryButton}>
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
