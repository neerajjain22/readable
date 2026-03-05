import fs from "fs"
import path from "path"
import matter from "gray-matter"

const POSTS_DIR = path.join(process.cwd(), "content", "blog")

export type Post = {
  title: string
  description: string
  date: string
  author: string
  slug: string
  image: string
  content: string
}

export type PostMeta = Omit<Post, "content"> & {
  readTime: string
}

function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 220))
  return `${minutes} min read`
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return []
  }
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
}

export function getPostBySlug(slug: string): Post | null {
  const safeSlug = slug.replace(/\.mdx$/, "")
  const fullPath = path.join(POSTS_DIR, `${safeSlug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    return null
  }
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return {
    title: String(data.title || safeSlug),
    description: String(data.description || ""),
    date: String(data.date || ""),
    author: String(data.author || "Neeraj Jain"),
    slug: String(data.slug || safeSlug),
    image: String(data.image || ""),
    content,
  }
}

export function getAllPosts(): PostMeta[] {
  const posts = getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => Boolean(post))
    .map((post) => ({
      title: post.title,
      description: post.description,
      date: post.date,
      author: post.author,
      slug: post.slug,
      image: post.image,
      readTime: readingTime(post.content),
    }))

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}
