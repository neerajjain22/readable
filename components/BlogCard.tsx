import Image from "next/image"
import Link from "next/link"
import { BlogPost } from "../data/blogPosts"
import styles from "../styles/components/BlogCard.module.css"

type BlogCardProps = {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/blog/${post.slug}`} className={styles.imageLink}>
        <Image src={post.coverImage} alt={post.title} width={640} height={360} className={styles.image} />
      </Link>
      <div className={styles.body}>
        <p className={styles.meta}>
          {new Date(post.publishedAt).toLocaleDateString()} • {post.readTime}
        </p>
        <h3 className={styles.title}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
      </div>
    </article>
  )
}
