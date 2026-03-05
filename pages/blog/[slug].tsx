import { GetStaticPaths, GetStaticProps } from "next"
import Image from "next/image"
import Link from "next/link"
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import Layout from "../../components/Layout"
import Seo from "../../components/Seo"
import Breadcrumbs from "../../components/Breadcrumbs"
import BlogCard from "../../components/BlogCard"
import { Post, PostMeta, getAllPosts, getPostBySlug, getPostSlugs } from "../../lib/posts"
import styles from "../../styles/Page.module.css"

type BlogPostPageProps = {
  post: Omit<Post, "content"> & { readTime: string }
  source: MDXRemoteSerializeResult
  related: PostMeta[]
}

export default function BlogPostPage({ post, source, related }: BlogPostPageProps) {
  return (
    <Layout>
      <Seo
        title={`${post.title} | Readable Blog`}
        description={post.description}
        path={`/blog/${post.slug}`}
        image={post.image}
        type="article"
        publishedTime={post.date}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.date,
          author: { "@type": "Person", name: post.author },
          description: post.description,
          image: post.image,
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
              {new Date(post.date).toLocaleDateString()} • {post.readTime} • {post.author}
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
              <MDXRemote {...source} />
            </div>
            <p className={styles.text}>
              Continue in <Link href="/docs" className={styles.inlineLink}>Docs</Link>.
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
  paths: getPostSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async (context) => {
  const slug = String(context.params?.slug || "")
  const post = getPostBySlug(slug)

  if (!post) {
    return { notFound: true }
  }

  const source = await serialize(post.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  })

  const all = getAllPosts()
  const related = all.filter((item) => item.slug !== post.slug).slice(0, 3)
  const readTime = `${Math.max(1, Math.round(post.content.trim().split(/\s+/).filter(Boolean).length / 220))} min read`

  return {
    props: {
      post: {
        title: post.title,
        description: post.description,
        date: post.date,
        author: post.author,
        slug: post.slug,
        image: post.image,
        readTime,
      },
      source,
      related,
    },
  }
}
