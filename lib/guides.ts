import fs from "fs"
import path from "path"
import matter from "gray-matter"

const GUIDES_DIR = path.join(process.cwd(), "content", "guides")

export type GuideMeta = {
  title: string
  description: string
  slug: string
}

export function getAllGuides(): GuideMeta[] {
  if (!fs.existsSync(GUIDES_DIR)) {
    return []
  }

  return fs
    .readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const fullPath = path.join(GUIDES_DIR, file)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data } = matter(fileContents)
      const fallbackSlug = file.replace(/\.mdx$/, "")
      return {
        title: String(data.title || fallbackSlug),
        description: String(data.description || ""),
        slug: String(data.slug || fallbackSlug),
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}
