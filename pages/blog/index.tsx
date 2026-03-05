import { GetStaticProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import BlogCard from "../../components/BlogCard"
import { PostMeta, getAllPosts } from "../../lib/posts"
import styles from "../../styles/Page.module.css"

const PAGE_SIZE = 3

type BlogIndexPageProps = {
  posts: PostMeta[]
}

export default function BlogIndexPage({ posts }: BlogIndexPageProps) {
  const router = useRouter()
  const page = Math.max(1, Number(router.query.page || 1))
  const totalPages = Math.ceil(posts.length / PAGE_SIZE)

  const paginated = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <Seo
        title="Blog | Readable"
        description="Insights on AI visibility, agent analytics, and conversion strategy from the Readable team."
        path="/blog"
      />
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
                    className={`${styles.pageLink} ${pageNumber === page ? styles.pageLinkActive : ""}`}
                  >
                    {pageNumber}
                  </Link>
                )
              })}
            </nav>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<BlogIndexPageProps> = async () => {
  return {
    props: {
      posts: getAllPosts(),
    },
  }
}
