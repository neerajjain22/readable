import type { Metadata } from "next"
import Link from "next/link"
import { getRecentCompletedReports } from "../../lib/ai-visibility/repository"
import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Recent AI Visibility Reports",
  description: "Latest AI visibility reports generated on Readable.",
}

export default async function RecentAiVisibilityReportsPage() {
  const reports = await getRecentCompletedReports(20)

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <h1 className={styles.title}>Recently Generated Reports</h1>
          <p className={styles.subtitle}>Latest 20 AI visibility reports available publicly.</p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Visibility Score</th>
                  <th>Last Analyzed</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: (typeof reports)[number]) => (
                  <tr key={report.companySlug}>
                    <td>
                      <Link href={`/ai-visibility/${report.companySlug}`} className={styles.link}>
                        {report.companyName}
                      </Link>
                    </td>
                    <td>{report.visibilityScore ?? 0}</td>
                    <td>{report.lastAnalyzedAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
