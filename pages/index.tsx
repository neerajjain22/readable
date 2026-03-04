import Image from "next/image"
import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import RotatingText from "../components/RotatingText"
import AIInfluencePreview from "../components/product-placeholders/AIInfluencePreview"
import AgentAnalyticsPreview from "../components/product-placeholders/AgentAnalyticsPreview"
import AgentOptimizedPagesPreview from "../components/product-placeholders/AgentOptimizedPagesPreview"
import pageStyles from "../styles/Page.module.css"

const logos = [
  { src: "/images/logos/CapillaryTech.webp", alt: "CapillaryTech logo" },
  { src: "/images/logos/Dominos-logo.png", alt: "Domino's logo" },
  { src: "/images/logos/Ultrahuman.f1670267324.png", alt: "Ultrahuman logo" },
  { src: "/images/logos/beato-logo.c19ba735.svg", alt: "BeatO logo" },
  { src: "/images/logos/plush-images.png", alt: "Plush logo" },
  { src: "/images/logos/sugarfit-logo-against-light.png", alt: "Sugarfit logo" },
  { src: "/images/logos/vlcc-personal-care-logo-png_seeklogo-521769.png", alt: "VLCC logo" },
]

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
                  background:
                    "radial-gradient(circle at 70% 20%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(circle at 30% 80%, rgba(99,102,241,0.10), transparent 60%), #F8FAFC",
                  borderRadius: "20px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "18px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                    background: "#FFFFFF",
                    padding: "16px",
                    display: "grid",
                    gap: "12px",
                    transform: "translateY(-3px)",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      background: "#FFFFFF",
                      padding: "12px",
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6B7280",
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      AI Influence Snapshot
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                      Analyzing: yourbrand.com
                    </p>
                  </div>

                  <article
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      background: "#FFFFFF",
                      padding: "12px",
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6B7280",
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      AI Influence Score
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: "24px", fontWeight: 600, lineHeight: 1.1 }}>
                      74 / 100
                    </p>
                    <div
                      aria-hidden="true"
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        height: "8px",
                        borderRadius: "999px",
                        background: "#E5E7EB",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "74%",
                          height: "100%",
                          background: "var(--color-accent)",
                        }}
                      />
                    </div>
                    <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                      Strong visibility in category prompts
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                      2 positioning issues detected
                    </p>
                  </article>

                  <article
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      background: "#FFFFFF",
                      padding: "12px",
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6B7280",
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      How AI Describes Your Brand
                    </p>
                    <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.6 }}>
                      "Readable helps companies understand how AI systems influence brand discovery and buyer
                      journeys."
                    </p>
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap", minWidth: 0 }}>
                      {["ChatGPT", "Claude", "Gemini", "Perplexity"].map((source) => (
                        <span
                          key={source}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            background: "#EEF2FF",
                            color: "#4338CA",
                            lineHeight: 1.3,
                          }}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </article>

                  <article
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      background: "#FFFFFF",
                      padding: "12px",
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#6B7280",
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      Opportunities Detected
                    </p>
                    <ul className={pageStyles.list} style={{ marginTop: "10px", gap: "8px" }}>
                      <li style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                        Competitor mentioned in 3 high value prompts
                      </li>
                      <li style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                        Product positioning inconsistent
                      </li>
                      <li style={{ fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                        Missing comparison content
                      </li>
                    </ul>
                  </article>
                </div>
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
          aria-label="Teams from these companies use Readable"
        >
          <div className={pageStyles.container}>
            <p
              className={pageStyles.text}
              style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, margin: 0 }}
            >
              Teams from more than 100 companies use Readable everyday
            </p>
            <div className={pageStyles.logoMarquee} style={{ marginTop: "24px" }}>
              <div className={pageStyles.logoTrack}>
                {[...logos, ...logos].map((logo, index) => (
                  <Image
                    key={`${logo.src}-${index}`}
                    src={logo.src}
                    alt={logo.alt}
                    width={160}
                    height={32}
                    className={pageStyles.logoImage}
                  />
                ))}
              </div>
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
                  <div>
                    {feature.title === "Agent Analytics" ? (
                      <AgentAnalyticsPreview />
                    ) : (
                      <Image src={feature.image} alt={feature.alt} width={640} height={420} />
                    )}
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
                  <div>
                    {feature.title === "AI Influence" ? (
                      <AIInfluencePreview />
                    ) : feature.title === "Agent-Optimized Pages" ? (
                      <AgentOptimizedPagesPreview />
                    ) : (
                      <Image src={feature.image} alt={feature.alt} width={640} height={420} />
                    )}
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
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{item.name}</p>
                      <p className={pageStyles.text} style={{ marginTop: "4px", marginBottom: 0 }}>
                        {item.role} - {item.company}
                      </p>
                    </div>
                    <a
                      href={item.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.name} LinkedIn profile`}
                      className={pageStyles.linkedinIcon}
                    >
                      <Image src="/images/icons/linkedin.svg" alt="LinkedIn profile" width={20} height={20} />
                    </a>
                  </div>
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
                <Link href="/book-demo" className={pageStyles.pageLink}>
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
