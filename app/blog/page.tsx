import type { Metadata } from "next"
import Link from "next/link"
import Breadcrumbs from "../../components/Breadcrumbs"
import BlogCard from "../../components/BlogCard"
import { getAllPosts } from "../../lib/posts"
import styles from "../../styles/Page.module.css"

export const metadata: Metadata = {
  title: "Blog | Readable",
  description: "Insights on AI influence, agent analytics, and conversion strategy from the Readable team.",
}

const PAGE_SIZE = 15

type BlogPageProps = {
  searchParams?: {
    page?: string
  }
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const posts = getAllPosts()
  const page = Math.max(1, Number(searchParams?.page || 1))
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = posts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
          <h1 className={styles.heroTitle}>Readable Blog</h1>
          <p className={styles.heroDescription}>
            Practical guidance for teams building measurable AI discovery programs.
          </p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.grid3}>
            {paginated.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          <nav className={styles.pagination} aria-label="Blog pagination">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              const href = pageNumber === 1 ? "/blog" : `/blog?page=${pageNumber}`
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.pageLink} ${pageNumber === safePage ? styles.pageLinkActive : ""}`}
                >
                  {pageNumber}
                </Link>
              )
            })}
          </nav>
        </div>
      </section>
    </main>
  )
}
