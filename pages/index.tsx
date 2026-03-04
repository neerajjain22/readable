import Image from "next/image"
import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import RotatingText from "../components/RotatingText"
import pageStyles from "../styles/Page.module.css"

const logos = ["GrowthOps", "Northline", "Stacklane", "Ecomera", "Finovo", "CodePeak"]

const aiChannelProblems = [
  "Don't know how AI describes their brand",
  "Don't know how often AI recommends competitors",
  "Don't know how many buyers arrive after asking AI",
  "Don't structure pages for AI retrieval",
  "Don't measure AI-influenced pipeline",
]

const featureSections = [
  {
    title: "AI Influence",
    heading: "Understand How AI Describes Your Brand",
    description:
      "Readable analyzes how AI systems talk about your brand across key prompts and categories — showing where positioning is strong, where competitors appear, and how your narrative evolves.",
    points: [
      "AI brand narrative tracking",
      "Prompt cluster analysis",
      "Positioning score and improvement signals",
      "Issue detection in AI responses",
    ],
    image: "/images/ai-influence-dashboard.png",
    alt: "AI Influence dashboard placeholder",
    reverse: false,
  },
  {
    title: "Agent Analytics",
    heading: "Measure AI-Driven Traffic and Buyer Journeys",
    description:
      "Readable tracks how AI assistants influence discovery and visits, helping teams understand where AI-driven users enter the funnel and how they convert.",
    points: [
      "AI agent visit detection",
      "AI platform breakdown (ChatGPT, Claude, Gemini, Perplexity)",
      "Click-through and conversion tracking",
      "AI-influenced funnel analysis",
    ],
    image: "/images/agent-analytics-dashboard.png",
    alt: "Agent Analytics dashboard placeholder",
    reverse: true,
  },
  {
    title: "Agent-Optimized Pages",
    heading: "Create Pages Optimized for AI Systems",
    description:
      "Readable helps teams structure and serve content optimized for AI retrieval, improving how AI assistants reference and recommend your brand.",
    points: [
      "AI-optimized page versions",
      "Agent-specific content delivery",
      "Retrieval-friendly page structures",
      "Content evaluation and updates",
    ],
    image: "/images/agent-optimized-pages.png",
    alt: "Agent-Optimized Pages dashboard placeholder",
    reverse: false,
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

const solutionsByTeam = [
  {
    title: "Growth Teams",
    description: "Prioritize AI-influenced opportunities tied to pipeline and conversion.",
    href: "/solutions/growth-teams",
  },
  {
    title: "Brand Teams",
    description: "Monitor how AI systems describe your brand and competitor narratives.",
    href: "/solutions/brand-teams",
  },
  {
    title: "Product Teams",
    description: "Improve how feature and capability messaging is interpreted by AI systems.",
    href: "/solutions/product-teams",
  },
  {
    title: "Analytics Teams",
    description: "Measure AI-referred sessions and report AI influence with confidence.",
    href: "/solutions/analytics-teams",
  },
]

const caseStudyHighlights = [
  {
    company: "Northline Cloud",
    summary: "Improved clarity on AI positioning trends and turned insights into faster pipeline actions.",
  },
  {
    company: "VitalBand",
    summary: "Separated AI-referred traffic from other channels and improved conversion reporting quality.",
  },
  {
    company: "SouqSphere Group",
    summary: "Aligned multiple brand teams on one view of AI influence and category narrative movement.",
  },
]

export default function HomePage() {
  return (
    <Layout>
      <Seo
        title="Readable | AI Influence & Agent Analytics Platform"
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
                <h1 id="home-hero-title" className={pageStyles.heroTitle}>
                  Understand How AI Influences Your
                  <br />
                  <RotatingText words={["Brand", "Buyers", "Category", "Growth"]} />
                </h1>
                <p className={pageStyles.heroDescription} style={{ marginTop: "24px" }}>
                  Readable helps you understand how AI positions your brand, measure its influence on
                  buyers, and improve the content that shapes decisions.
                </p>

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
                      Analyze My Brand
                    </button>
                  </div>
                  <p className={pageStyles.text} style={{ marginTop: "10px", marginBottom: 0 }}>
                    No credit card. Free sign-up.
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
            <h2 className={pageStyles.heroTitle}>The AI Channels Problem</h2>
            <p className={pageStyles.heroDescription} style={{ lineHeight: 1.7 }}>
              Most companies today:
            </p>
            <ul className={pageStyles.list} style={{ marginTop: "20px", gap: "10px" }}>
              {aiChannelProblems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
            <p className={pageStyles.heroDescription} style={{ lineHeight: 1.7, marginTop: "24px" }}>
              Readable helps teams understand and improve how AI influences discovery, evaluation, and
              conversion.
            </p>
          </div>
        </section>

        <section className={pageStyles.sectionAlt} style={{ paddingTop: "104px", paddingBottom: "104px" }}>
          <div className={pageStyles.container}>
            <h2 className={pageStyles.heroTitle}>See How Readable Works</h2>
            <p className={pageStyles.heroDescription} style={{ lineHeight: 1.7 }}>
              Monitor AI influence, measure AI-driven journeys, and improve the pages AI systems rely on.
            </p>
          </div>
        </section>

        {featureSections.map((feature, index) => (
          <section
            key={feature.title}
            className={index % 2 === 0 ? pageStyles.section : pageStyles.sectionAlt}
            style={{ paddingTop: "104px", paddingBottom: "104px" }}
          >
            <div className={pageStyles.container}>
              <div className={pageStyles.grid2} style={{ gap: "40px", alignItems: "center" }}>
                {feature.reverse ? (
                  <div
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-bg-default)",
                      padding: "24px",
                    }}
                  >
                    <Image src={feature.image} alt={feature.alt} width={640} height={420} />
                  </div>
                ) : null}

                <div>
                  <p
                    className={pageStyles.text}
                    style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, margin: 0 }}
                  >
                    {feature.title}
                  </p>
                  <h2 className={pageStyles.heroTitle} style={{ marginTop: "12px" }}>
                    {feature.heading}
                  </h2>
                  <p className={pageStyles.heroDescription} style={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </p>
                  <ul className={pageStyles.list} style={{ marginTop: "20px", gap: "10px" }}>
                    {feature.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>

                {!feature.reverse ? (
                  <div
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-bg-default)",
                      padding: "24px",
                    }}
                  >
                    <Image src={feature.image} alt={feature.alt} width={640} height={420} />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ))}

        <section className={pageStyles.section} style={{ paddingTop: "104px", paddingBottom: "104px" }}>
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

        <section className={pageStyles.sectionAlt} style={{ paddingTop: "112px", paddingBottom: "112px" }}>
          <div className={pageStyles.container}>
            <h2 className={pageStyles.heroTitle}>Solutions by Team</h2>
            <div className={pageStyles.grid2} style={{ marginTop: "40px", gap: "32px" }}>
              {solutionsByTeam.map((item) => (
                <article key={item.title} className={pageStyles.card} style={{ padding: "32px" }}>
                  <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                  <p className={pageStyles.text} style={{ marginTop: "12px", lineHeight: 1.7 }}>
                    {item.description}
                  </p>
                  <div style={{ marginTop: "16px" }}>
                    <Link href={item.href} className={pageStyles.inlineLink}>
                      View {item.title} →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.section} style={{ paddingTop: "104px", paddingBottom: "104px" }}>
          <div className={pageStyles.container}>
            <h2 className={pageStyles.heroTitle}>Case Studies</h2>
            <p className={pageStyles.heroDescription}>Real outcomes from teams using Readable.</p>
            <div className={pageStyles.grid3} style={{ marginTop: "40px", gap: "32px" }}>
              {caseStudyHighlights.map((item) => (
                <article key={item.company} className={pageStyles.card} style={{ padding: "32px" }}>
                  <h3 style={{ marginTop: 0 }}>{item.company}</h3>
                  <p className={pageStyles.text} style={{ marginTop: "12px", lineHeight: 1.7 }}>
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
            <div style={{ marginTop: "24px" }}>
              <Link href="/case-studies" className={pageStyles.inlineLink}>
                View All Case Studies →
              </Link>
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
              <h2 className={pageStyles.heroTitle}>Understand How AI Is Influencing Your Brand</h2>
              <p className={pageStyles.heroDescription} style={{ marginLeft: "auto", marginRight: "auto" }}>
                Analyze how AI systems describe your brand, measure their impact on discovery, and identify
                opportunities to improve.
              </p>
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/platform/ai-visibility" className={pageStyles.searchButton}>
                  Analyze My Brand
                </Link>
                <Link href="/contact" className={pageStyles.pageLink}>
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
