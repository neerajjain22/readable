import { GetStaticPaths, GetStaticProps } from "next"
import Image from "next/image"
import Link from "next/link"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import BlogCard from "../../components/BlogCard"
import { BlogPost, blogPosts } from "../../data/blogPosts"
import styles from "../../styles/Page.module.css"

type BlogPostPageProps = {
  post: BlogPost
  related: BlogPost[]
}

export default function BlogPostPage({ post, related }: BlogPostPageProps) {
  return (
    <Layout>
      <Seo
        title={`${post.title} | Readable Blog`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.coverImage}
        type="article"
        publishedTime={post.publishedAt}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.publishedAt,
          author: { "@type": "Person", name: post.author },
          description: post.excerpt,
        }}
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
            <h1 className={styles.heroTitle}>{post.title}</h1>
            <p className={styles.text}>
              {new Date(post.publishedAt).toLocaleDateString()} • {post.readTime} • {post.author}, {post.role}
            </p>
            <div className={styles.mtMd}>
              <Image src={post.coverImage} alt={post.title} width={1200} height={620} />
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <article className={styles.container}>
            {post.content.map((paragraph) => (
              <p key={paragraph} className={styles.heroDescription}>
                {paragraph}
              </p>
            ))}
            <p className={styles.text}>
              Tags: {post.tags.join(", ")}. Continue in <Link href="/docs" className={styles.inlineLink}>Docs</Link>.
            </p>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2>Related posts</h2>
            <div className={`${styles.grid3} ${styles.mtMd}`}>
              {related.map((item) => (
                <BlogCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: blogPosts.map((post) => ({ params: { slug: post.slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async (context) => {
  const slug = String(context.params?.slug)
  const post = blogPosts.find((item) => item.slug === slug)

  if (!post) {
    return { notFound: true }
  }

  const related = blogPosts.filter((item) => item.slug !== slug).slice(0, 3)

  return {
    props: {
      post,
      related,
    },
  }
}
