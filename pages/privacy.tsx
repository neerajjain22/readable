import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/Page.module.css"

export default function PrivacyPage() {
  return (
    <Layout>
      <Seo
        title="Privacy Policy | Readable"
        description="Readable privacy policy covering data collection, usage, retention, and user rights."
        path="/privacy"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
            <h1 className={styles.heroTitle}>Privacy Policy</h1>
            <p className={styles.heroDescription}>Effective date: March 3, 2026</p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <article className={styles.container}>
            <h2>1. Information We Collect</h2>
            <p className={styles.text}>
              We collect account details, usage data, analytics events, and support communications required to
              provide and improve Readable services.
            </p>
            <h2>2. How We Use Information</h2>
            <p className={styles.text}>
              We use data to operate the platform, deliver reporting, secure accounts, improve product quality,
              and communicate service updates.
            </p>
            <h2>3. Sharing and Subprocessors</h2>
            <p className={styles.text}>
              We share data with trusted infrastructure and service providers under contractual safeguards and
              only as necessary for service delivery.
            </p>
            <h2>4. Data Retention</h2>
            <p className={styles.text}>
              We retain customer data for the contract term and a limited period thereafter to support legal,
              audit, and operational requirements.
            </p>
            <h2>5. Security</h2>
            <p className={styles.text}>
              We implement technical and organizational controls designed to protect customer data, including
              access controls, encryption, and monitoring.
            </p>
            <h2>6. Your Rights</h2>
            <p className={styles.text}>
              Depending on jurisdiction, you may request access, correction, deletion, or portability of
              personal information by contacting privacy@readable.ai.
            </p>
          </article>
        </section>
      </main>
    </Layout>
  )
}
