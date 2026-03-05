import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import Breadcrumbs from "../../../components/Breadcrumbs"
import BlogCard from "../../../components/BlogCard"
import { getAllPosts, getPostBySlug, getPostSlugs } from "../../../lib/posts"
import styles from "../../../styles/Page.module.css"

type PostPageProps = {
  params: {
    slug: string
  }
}

function getReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 220))} min read`
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
      description: "This blog post could not be found.",
    }
  }

  return {
    title: `${post.title} | Readable Blog`,
    description: post.description,
    openGraph: {
      title: `${post.title} | Readable Blog`,
      description: post.description,
      images: post.image ? [post.image] : [],
      type: "article",
    },
  }
}

export default function BlogPostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const all = getAllPosts()
  const related = all.filter((item) => item.slug !== post.slug).slice(0, 3)
  const readTime = getReadTime(post.content)

  return (
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
            {new Date(post.date).toLocaleDateString()} • {readTime} • {post.author}
          </p>
          {post.image ? (
            <div className={styles.mtMd}>
              <Image src={post.image} alt={post.title} width={1200} height={620} />
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <article className={styles.container}>
          <div className={styles.heroDescription}>
            <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>
          <p className={styles.text}>
            Continue in{" "}
            <Link href="/docs" className={styles.inlineLink}>
              Docs
            </Link>
            .
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
  )
}
