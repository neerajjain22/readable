import type { Metadata } from "next"
import Link from "next/link"
import { getRecentCompletedReportsPage } from "../../lib/ai-visibility/repository"
import styles from "./page.module.css"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 20

export const metadata: Metadata = {
  title: "Recent AI Visibility Reports",
  description: "Latest AI visibility reports generated on Readable.",
}

type PageProps = {
  searchParams?: {
    page?: string
  }
}

function parsePage(raw?: string) {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }

  return Math.floor(parsed)
}

function formatDate(date: Date) {
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  const day = `${date.getUTCDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function pageHref(page: number) {
  return `/recent-ai-visibility-reports?page=${page}`
}

export default async function RecentAiVisibilityReportsPage({ searchParams }: PageProps) {
  const requestedPage = parsePage(searchParams?.page)
  const { total, reports } = await getRecentCompletedReportsPage({ page: requestedPage, pageSize: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <h1 className={styles.title}>Recently Generated Reports</h1>
          <p className={styles.subtitle}>AI visibility reports available publicly.</p>

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
                    <td>{formatDate(report.lastAnalyzedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className={styles.pagination} aria-label="Recent reports pagination">
            {hasPrevious ? (
              <Link href={pageHref(currentPage - 1)} className={styles.pageLink}>
                Previous
              </Link>
            ) : (
              <span className={styles.pageLinkDisabled}>Previous</span>
            )}

            <div className={styles.pageNumbers}>
              {pageNumbers.map((page) => (
                <Link
                  key={page}
                  href={pageHref(page)}
                  className={page === currentPage ? styles.pageNumberActive : styles.pageNumber}
                >
                  {page}
                </Link>
              ))}
            </div>

            {hasNext ? (
              <Link href={pageHref(currentPage + 1)} className={styles.pageLink}>
                Next
              </Link>
            ) : (
              <span className={styles.pageLinkDisabled}>Next</span>
            )}
          </nav>
        </div>
      </section>
    </main>
  )
}
