import type { Metadata } from "next"
import Link from "next/link"
import ApiAccessRequestForm from "./ApiAccessRequestForm"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "API Docs | Readable",
  description:
    "Request API documentation for Readable AI influence data, agent analytics, and integration workflows.",
}

const apiFeatures = [
  {
    title: "AI Influence Data",
    description: "Access how AI systems describe brands, products, and competitors.",
  },
  {
    title: "Agent Traffic Analytics",
    description: "Retrieve traffic and conversion data from AI assistants.",
  },
  {
    title: "AI Platform Insights",
    description: "Break down visibility across ChatGPT, Claude, Gemini, and other systems.",
  },
  {
    title: "AI-Optimized Content Delivery",
    description: "Serve pages structured for AI discovery and recommendation.",
  },
]

const useCases = [
  {
    title: "Product Teams",
    description: "Embed AI visibility data into internal dashboards.",
  },
  {
    title: "Growth & Analytics Teams",
    description: "Automate AI traffic reporting and performance tracking.",
  },
  {
    title: "Agencies & Platforms",
    description: "Build AI visibility insights into client workflows.",
  },
]

export default function DocsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>API Access for AI Influence & Agent Analytics</h1>
          <p className={styles.heroDescription}>
            Readable provides APIs for accessing AI visibility data, agent traffic insights, and AI-optimized content
            delivery.
          </p>
          <p className={styles.heroDescription}>
            API documentation is available on request for teams building integrations, analytics pipelines, and
            AI-driven products.
          </p>
          <a href="#request-api-docs" className={`btn btn-primary ${styles.ctaButton}`}>
            Request API Access
          </a>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What You Can Build with the Readable API</h2>
          <div className={styles.grid4}>
            {apiFeatures.map((feature) => (
              <article key={feature.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Who Requests API Access</h2>
          <div className={styles.grid3}>
            {useCases.map((useCase) => (
              <article key={useCase.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{useCase.title}</h3>
                <p className={styles.cardText}>{useCase.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="request-api-docs" className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.formHeader}>
            <h2 className={styles.sectionTitle}>Request API Documentation</h2>
            <p className={styles.sectionText}>
              Tell us how you plan to use the Readable API and we will share documentation and access details.
            </p>
          </div>
          <ApiAccessRequestForm />
          <p className={styles.supportText}>
            Need help first? <Link href="/contact">Contact our team</Link>.
          </p>
        </div>
      </section>
    </main>
  )
}
