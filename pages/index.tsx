import Image from "next/image"
import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import NewsletterForm from "../components/NewsletterForm"
import pageStyles from "../styles/Page.module.css"

const logos = ["GrowthOps", "Northline", "Stacklane", "Ecomera", "Finovo", "CodePeak"]

const features = [
  {
    title: "AI Visibility",
    description:
      "Track how models position your brand versus competitors across strategic prompt categories.",
    points: ["Prompt cluster tracking", "Narrative drift alerts", "Position quality scoring"],
  },
  {
    title: "Agent Analytics",
    description:
      "Identify assistant and agent-originated traffic, then tie sessions to conversion outcomes.",
    points: ["AI source attribution", "Journey mapping", "Pipeline impact reporting"],
  },
  {
    title: "Agent-Ready Pages",
    description:
      "Ship structured pages designed for retrieval quality, clearer recommendations, and stronger conversion.",
    points: ["Page templates", "Schema guidance", "Content quality checks"],
  },
]

const testimonials = [
  {
    quote:
      "Readable gave us a clear view of how AI models represent our category and where we were getting lost.",
    name: "Maya Carter",
    role: "VP Marketing",
    company: "GrowthOps",
  },
  {
    quote:
      "We now track AI-driven traffic with confidence and can explain impact to leadership with real data.",
    name: "Ethan Brooks",
    role: "Head of Demand Gen",
    company: "Northline",
  },
  {
    quote:
      "The agent-ready recommendations helped us improve discoverability faster than expected.",
    name: "Sonia Patel",
    role: "Director of Digital",
    company: "Stacklane",
  },
]

export default function HomePage() {
  return (
    <Layout>
      <Seo
        title="Readable | AI Visibility & Agent Analytics Platform"
        description="Monitor how AI systems describe your brand, measure agent traffic, and optimize pages for AI-driven conversion."
        path="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Readable",
          applicationCategory: "BusinessApplication",
          description:
            "AI visibility and agent analytics platform for growth, marketing, and product teams.",
        }}
      />

      <main className={pageStyles.page}>
        <section
          className={pageStyles.section}
          style={{
            paddingTop: "128px",
            paddingBottom: "112px",
          }}
          aria-labelledby="home-hero-title"
        >
          <div className={pageStyles.container}>
            <div className={pageStyles.grid2} style={{ gap: "40px", alignItems: "center" }}>
              <div>
                <h1 id="home-hero-title" className={pageStyles.heroTitle} style={{ maxWidth: "12ch" }}>
                  Understand How AI Sees Your Brand.
                </h1>
                <p className={pageStyles.heroDescription} style={{ marginTop: "24px" }}>
                  Readable helps you monitor how LLMs represent you, track AI-driven traffic, and structure
                  your site for AI agents.
                </p>

                <div style={{ marginTop: "32px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <Link href="/contact" className={pageStyles.searchButton}>
                    Book a Demo
                  </Link>
                  <Link href="/platform" className={pageStyles.pageLink}>
                    Explore Platform
                  </Link>
                </div>

                <div
                  style={{
                    marginTop: "32px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "12px",
                    background: "var(--color-bg-default)",
                    maxWidth: "640px",
                  }}
                >
                  <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
                    <input
                      type="url"
                      placeholder="Enter your website URL"
                      aria-label="Website URL"
                      className={pageStyles.searchInput}
                      style={{
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0",
                        minHeight: "48px",
                        borderRight: "0",
                      }}
                    />
                    <button
                      type="button"
                      className={pageStyles.searchButton}
                      style={{
                        borderTopLeftRadius: "0",
                        borderBottomLeftRadius: "0",
                        minHeight: "48px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Analyze My Site
                    </button>
                  </div>
                  <p className={pageStyles.text} style={{ marginTop: "10px", marginBottom: 0 }}>
                    Instant high-level analysis. Full breakdown available in demo.
                  </p>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-bg-light)",
                  padding: "24px",
                }}
              >
                <Image
                  src="/images/hero-dashboard.svg"
                  alt="Readable dashboard preview"
                  width={640}
                  height={420}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className={pageStyles.sectionAlt}
          style={{
            paddingTop: "64px",
            paddingBottom: "64px",
          }}
          aria-label="Trusted by modern growth teams"
        >
          <div className={pageStyles.container}>
            <p
              className={pageStyles.text}
              style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, margin: 0 }}
            >
              Trusted by Modern Growth Teams
            </p>
            <div
              className={pageStyles.grid3}
              style={{
                marginTop: "24px",
                gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              {logos.map((logo) => (
                <div
                  key={logo}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    minHeight: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-muted)",
                    background: "var(--color-bg-default)",
                  }}
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.section} style={{ paddingTop: "104px", paddingBottom: "104px" }}>
          <div className={pageStyles.container}>
            <h2 className={pageStyles.heroTitle}>The Readable Platform</h2>
            <p className={pageStyles.heroDescription} style={{ lineHeight: 1.7 }}>
              Everything you need to monitor and improve how AI systems interpret your brand.
            </p>
            <div
              className={pageStyles.grid3}
              style={{ marginTop: "40px", gap: "32px", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
            >
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className={pageStyles.card}
                  style={{ padding: "32px", lineHeight: 1.65 }}
                >
                  <h3 style={{ marginTop: 0 }}>{feature.title}</h3>
                  <p className={pageStyles.text} style={{ marginTop: "16px" }}>
                    {feature.description}
                  </p>
                  <ul className={pageStyles.list} style={{ marginTop: "20px" }}>
                    {feature.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.sectionAlt} style={{ paddingTop: "104px", paddingBottom: "104px" }}>
          <div className={pageStyles.container}>
            <h2 className={pageStyles.heroTitle}>What Teams Are Saying</h2>
            <div className={pageStyles.grid3} style={{ marginTop: "40px", gap: "32px" }}>
              {testimonials.map((item) => (
                <article key={item.name} className={pageStyles.card} style={{ padding: "32px" }}>
                  <p style={{ marginTop: 0, lineHeight: 1.7 }}>"{item.quote}"</p>
                  <p style={{ marginTop: "20px", marginBottom: 0, fontWeight: 700 }}>{item.name}</p>
                  <p className={pageStyles.text} style={{ marginTop: "4px", marginBottom: 0 }}>
                    {item.role}, {item.company}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.section} style={{ paddingTop: "112px", paddingBottom: "112px" }}>
          <div className={pageStyles.container}>
            <div className={pageStyles.grid2} style={{ gap: "40px", alignItems: "start" }}>
              <div>
                <h2 className={pageStyles.heroTitle}>Built for Agencies and Multi-Brand Teams</h2>
                <p className={pageStyles.heroDescription} style={{ marginTop: "24px" }}>
                  Manage clients, publish white-labeled reports, and run repeatable AI visibility programs
                  without custom tooling for every account.
                </p>
              </div>
              <div style={{ marginTop: "16px" }}>
                <NewsletterForm />
              </div>
            </div>
          </div>
        </section>

        <section className={pageStyles.sectionAlt} style={{ paddingTop: "96px", paddingBottom: "96px" }}>
          <div className={pageStyles.container}>
            <div
              className={pageStyles.card}
              style={{
                padding: "48px",
                textAlign: "center",
                maxWidth: "960px",
                margin: "0 auto",
              }}
            >
              <h2 className={pageStyles.heroTitle}>Start Understanding Your AI Presence</h2>
              <p className={pageStyles.heroDescription} style={{ marginLeft: "auto", marginRight: "auto" }}>
                Book a live walkthrough and get a practical roadmap to improve how AI systems recommend your
                brand.
              </p>
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/contact" className={pageStyles.searchButton}>
                  Book a Demo
                </Link>
                <Link href="/pricing" className={pageStyles.pageLink}>
                  See Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
