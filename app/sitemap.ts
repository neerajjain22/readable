import type { MetadataRoute } from "next"
import { getAllPosts } from "../lib/posts"
import { getCompletedReportsWithQueryData, getRecentCompletedReports } from "../lib/ai-visibility/repository"
import { getPublishedProgrammaticPages } from "../lib/programmatic/repository"
import { prisma } from "../lib/prisma"
import { PAGE_STATUS, CONTENT_TYPE } from "../lib/programmatic/constants"

const BASE_URL = "https://www.tryreadable.ai"
export const dynamic = "force-dynamic"

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
  "/guides",
  "/recent-ai-visibility-reports",
  "/blog",
  "/docs",
  "/case-studies",
  "/careers",
  "/faq",
  "/contact",
  "/book-demo",
  "/privacy",
  "/terms",
  "/ai-perception",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const publishedGuides = await getPublishedProgrammaticPages()
  const guideEntries: MetadataRoute.Sitemap = publishedGuides.map((guide) => ({
    url: `${BASE_URL}/guides/${guide.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
    lastModified: guide.updatedAt,
  }))

  const completedAiReports = await getRecentCompletedReports(500)
  const aiReportEntries: MetadataRoute.Sitemap = completedAiReports.map(
    (report: (typeof completedAiReports)[number]) => ({
    url: `${BASE_URL}/ai-visibility/${report.companySlug}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: report.lastAnalyzedAt,
    }),
  )

  const queryPagesSource = await getCompletedReportsWithQueryData(600)
  const querySlugs = Array.from(
    new Set(
      queryPagesSource.flatMap((report) => {
        const rows = [...(Array.isArray(report.buyerQueries) ? report.buyerQueries : []), ...(Array.isArray(report.comparisonQueries) ? report.comparisonQueries : [])]
        return rows
          .map((row) => (row && typeof row === "object" ? (row as { querySlug?: unknown }).querySlug : ""))
          .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
      }),
    ),
  )

  const aiSearchEntries: MetadataRoute.Sitemap = querySlugs.map((querySlug) => ({
    url: `${BASE_URL}/ai-search/${querySlug}`,
    changeFrequency: "weekly",
    priority: 0.55,
  }))

  const perceptionPages = await prisma.generatedPage.findMany({
    where: {
      status: PAGE_STATUS.PUBLISHED,
      template: { contentType: CONTENT_TYPE.PERCEPTION },
    },
    select: { slug: true, updatedAt: true },
  })

  const perceptionEntries: MetadataRoute.Sitemap = perceptionPages.map((page) => ({
    url: `${BASE_URL}/ai-perception/${page.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: page.updatedAt,
  }))

  return [...staticEntries, ...blogEntries, ...guideEntries, ...aiReportEntries, ...aiSearchEntries, ...perceptionEntries]
}
