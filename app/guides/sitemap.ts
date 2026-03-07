import type { MetadataRoute } from "next"
import { getPublishedProgrammaticPages } from "../../lib/programmatic/repository"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tryreadable.ai"
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getPublishedProgrammaticPages()

  return pages.map((page) => ({
    url: `${BASE_URL}/guides/${page.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
    lastModified: page.updatedAt,
  }))
}
