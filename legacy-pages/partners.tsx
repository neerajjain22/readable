import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import PartnerBlock from "../components/PartnerBlock"
import CTASection from "../components/CTASection"
import styles from "../styles/Page.module.css"

const partnerSections = [
  {
    title: "Agency Partner Program",
    description: "Package AI visibility and agent analytics as a recurring strategic service.",
    items: ["Partner enablement", "Delivery playbooks", "Co-marketing opportunities"],
  },
  {
    title: "White-Label Reporting",
    description: "Deliver executive-ready reports under your brand without building custom tooling.",
    items: ["Brandable exports", "Client-ready narratives", "Scheduled report delivery"],
  },
  {
    title: "Revenue Share & Referrals",
    description: "Choose referral or co-delivery commercial models based on engagement type.",
    items: ["Referral incentives", "Joint success planning", "Quarterly business reviews"],
  },
  {
    title: "Multi-Client Operations",
    description: "Run all client workspaces from one partner console with role-based controls.",
    items: ["Workspace rollups", "Team permissions", "Client portfolio benchmarking"],
  },
]

export default function PartnersPage() {
  return (
    <Layout>
      <Seo
        title="Agency Partners | Readable"
        description="Join the Readable Agency Partner Program with white-label reporting, multi-client dashboards, and partner enablement."
        path="/partners"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Agency Partners" }]} />
            <h1 className={styles.heroTitle}>Agency Partner Program</h1>
            <p className={styles.heroDescription}>
              Help clients win in AI discovery with repeatable services powered by the Readable platform.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              {partnerSections.map((section) => (
                <PartnerBlock key={section.title} {...section} />
              ))}
            </div>
            <article className={`${styles.card} ${styles.mtMd}`}>
              <h2>Onboarding Process</h2>
              <ol className={styles.list}>
                <li>Apply and complete partner qualification.</li>
                <li>Attend enablement and implementation workshops.</li>
                <li>Launch first client workspace with partner success support.</li>
                <li>Scale delivery with standardized reports and quarterly planning.</li>
              </ol>
            </article>
          </div>
        </section>

        <CTASection
          title="Apply to Partner"
          description="Tell us about your client base and service model. We’ll share partnership options and onboarding steps."
          primaryLabel="Apply to Partner"
          primaryHref="/contact"
        />
      </main>
    </Layout>
  )
}
