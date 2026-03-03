import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Hero from "../components/Hero"
import LogoStrip from "../components/LogoStrip"
import FeatureCard from "../components/FeatureCard"
import Testimonial from "../components/Testimonial"
import CTASection from "../components/CTASection"
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

      <main>
        <Hero />
        <LogoStrip logos={logos} />

        <section className={pageStyles.section}>
          <div className={pageStyles.container}>
            <h2 className={pageStyles.heroTitle}>The Readable Platform</h2>
            <p className={pageStyles.heroDescription}>
              Rebranded from SonicLinker, Readable is built to help teams win in AI-mediated discovery
              with clear positioning, reliable analytics, and conversion-ready content architecture.
            </p>
            <div className={`${pageStyles.grid3} ${pageStyles.mtMd}`}>
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.sectionAlt}>
          <div className={pageStyles.container}>
            <h2 className={pageStyles.heroTitle}>What Teams Are Saying</h2>
            <div className={`${pageStyles.grid3} ${pageStyles.mtMd}`}>
              {testimonials.map((item) => (
                <Testimonial key={item.name} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className={pageStyles.section}>
          <div className={pageStyles.container}>
            <div className={pageStyles.grid2}>
              <div>
                <h2 className={pageStyles.heroTitle}>Built for Agencies and Multi-Brand Teams</h2>
                <p className={pageStyles.heroDescription}>
                  Manage clients, publish white-labeled reports, and run repeatable AI visibility programs
                  without custom tooling for every account.
                </p>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </section>

        <CTASection
          title="Start Understanding Your AI Presence"
          description="Book a live walkthrough and get a practical roadmap to improve how AI systems recommend your brand."
          primaryLabel="Book a Demo"
          primaryHref="/contact"
          secondaryLabel="See Pricing"
          secondaryHref="/pricing"
        />
      </main>
    </Layout>
  )
}
