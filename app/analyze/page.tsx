import type { Metadata } from "next"
import AnalyzeClient from "./AnalyzeClient"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Analyze AI Visibility",
  description: "Generate an AI Visibility Report for your company website.",
}

export default function AnalyzePage({
  searchParams,
}: {
  searchParams?: { domain?: string; refresh?: string }
}) {
  const initialDomain = (searchParams?.domain || "").trim()
  const forceRefresh = searchParams?.refresh === "1"

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <h1 className={styles.title}>Generate AI Visibility Report</h1>
          <p className={styles.subtitle}>
            We analyze how AI perceives your company and influences buyer recommendations.
          </p>
          <AnalyzeClient initialDomain={initialDomain} forceRefresh={forceRefresh} />
        </div>
      </section>
    </main>
  )
}
