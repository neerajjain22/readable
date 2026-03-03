import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import FAQAccordion from "../components/FAQAccordion"
import { faqItems } from "../data/faqs"
import styles from "../styles/Page.module.css"

export default function FaqPage() {
  return (
    <Layout>
      <Seo
        title="FAQ | Readable"
        description="Frequently asked questions about Readable pricing, implementation, platform capabilities, and agency partnerships."
        path="/faq"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
            <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
            <p className={styles.heroDescription}>
              Search common questions across platform, pricing, implementation, and partner workflows.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <FAQAccordion items={faqItems} showSearch />
          </div>
        </section>
      </main>
    </Layout>
  )
}
