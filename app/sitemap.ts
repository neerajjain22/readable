import type { MetadataRoute } from "next"
import { getAllPosts } from "../lib/posts"
import { getAllGuides } from "../lib/guides"

const BASE_URL = "https://www.tryreadable.ai"

const staticRoutes = [
  "",
  "/about",
  "/pricing",
  "/platform",
  "/platform/ai-visibility",
  "/platform/agent-analytics",
  "/platform/agent-ready-pages",
  "/solutions",
  "/solutions/growth-teams",
  "/solutions/brand-teams",
  "/solutions/product-teams",
  "/solutions/analytics-teams",
  "/industries",
  "/partners",
  "/agency-partners",
  "/resources",
  "/resources/guides",
  "/blog",
  "/docs",
  "/case-studies",
  "/careers",
  "/faq",
  "/contact",
  "/book-demo",
  "/privacy",
  "/terms",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }))

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  const guideEntries: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${BASE_URL}/resources/guides/${guide.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticEntries, ...blogEntries, ...guideEntries]
}
