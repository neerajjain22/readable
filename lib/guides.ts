import fs from "fs"
import path from "path"
import matter from "gray-matter"

const GUIDES_DIR = path.join(process.cwd(), "content", "guides")

export type GuideMeta = {
  title: string
  description: string
  slug: string
  author: string
}

export type Guide = GuideMeta & {
  content: string
}

export function getGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) {
    return []
  }

  return fs
    .readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
}

export function getGuideBySlug(slug: string): Guide | null {
  const safeSlug = slug.replace(/\.mdx$/, "")
  const fullPath = path.join(GUIDES_DIR, `${safeSlug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return {
    title: String(data.title || safeSlug),
    description: String(data.description || ""),
    slug: String(data.slug || safeSlug),
    author: String(data.author || "Readable Team"),
    content,
  }
}

export function getAllGuides(): GuideMeta[] {
  return getGuideSlugs()
    .map((slug) => getGuideBySlug(slug))
    .filter((guide): guide is Guide => Boolean(guide))
    .map((guide) => ({
      title: guide.title,
      description: guide.description,
      slug: guide.slug,
      author: guide.author,
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}
