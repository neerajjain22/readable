import Image from "next/image"
import Link from "next/link"
import { PostMeta } from "../lib/posts"
import styles from "../styles/components/BlogCard.module.css"

type BlogCardProps = {
  post: PostMeta
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/blog/${post.slug}`} className={styles.imageLink}>
        <Image src={post.image} alt={post.title} width={640} height={360} className={styles.image} />
      </Link>
      <div className={styles.body}>
        <p className={styles.meta}>
          {new Date(post.date).toLocaleDateString()} • {post.readTime}
        </p>
        <h3 className={styles.title}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className={styles.excerpt}>{post.description}</p>
      </div>
    </article>
  )
}
