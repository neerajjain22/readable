import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/Page.module.css"

export default function TermsPage() {
  return (
    <Layout>
      <Seo
        title="Terms of Service | Readable"
        description="Readable terms of service governing use of the platform, billing, and acceptable use."
        path="/terms"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms" }]} />
            <h1 className={styles.heroTitle}>Terms of Service</h1>
            <p className={styles.heroDescription}>Effective date: March 3, 2026</p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <article className={styles.container}>
            <h2>1. Service Scope</h2>
            <p className={styles.text}>
              Readable provides AI visibility analytics, agent traffic insights, and related tools as described
              in your order form and documentation.
            </p>
            <h2>2. Customer Responsibilities</h2>
            <p className={styles.text}>
              Customers are responsible for account security, lawful data use, and compliance with applicable
              laws and contractual obligations.
            </p>
            <h2>3. Fees and Billing</h2>
            <p className={styles.text}>
              Subscription fees are billed per contract terms. Late or unpaid balances may result in service
              suspension.
            </p>
            <h2>4. Acceptable Use</h2>
            <p className={styles.text}>
              Customers may not misuse the service, attempt unauthorized access, reverse engineer platform
              components, or violate third-party rights.
            </p>
            <h2>5. Confidentiality and IP</h2>
            <p className={styles.text}>
              Each party will protect confidential information. Readable retains platform IP; customers retain
              rights to their data.
            </p>
            <h2>6. Termination</h2>
            <p className={styles.text}>
              Either party may terminate per contract terms. On termination, data access and retention follow
              the agreed post-termination process.
            </p>
          </article>
        </section>
      </main>
    </Layout>
  )
}
