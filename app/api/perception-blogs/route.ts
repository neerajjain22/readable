import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { PAGE_STATUS, CONTENT_TYPE } from "../../../lib/programmatic/constants"
import { buildPerceptionContent } from "../../../lib/perception-blogs/utils"

const API_SECRET = process.env.PERCEPTION_BLOG_API_SECRET || "sonic-perception-test-secret-2024"

type PerceptionBlogPayload = {
  title: string
  blog_markdown: string
  meta_description: string
  target_keyword: string
  secondary_keywords: string[]
  slug: string
  key_findings: string[]
  faq: Array<{ question: string; answer: string }>
  company_name: string
  company_website: string
  industry: string
  competitors: string[]
  sonic_task_id: string
  perception_scores: Array<{ name: string; score: number }>
  head_to_head_summary: {
    input_company: string
    competitors: Array<{
      name: string
      params: Array<{ parameter: string; input_score: number; competitor_score: number }>
    }>
  } | null
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function POST(request: Request) {
  try {
    // Auth
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "")
    if (!API_SECRET || token !== API_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = (await request.json()) as PerceptionBlogPayload

    // Validate required fields
    if (!payload.slug || !payload.title || !payload.blog_markdown || !payload.company_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: slug, title, blog_markdown, company_name" },
        { status: 400 },
      )
    }

    // Upsert template (singleton for all perception blogs)
    let template = await prisma.template.findFirst({
      where: { name: "AI Perception Analysis", contentType: CONTENT_TYPE.PERCEPTION },
    })
    if (!template) {
      template = await prisma.template.create({
        data: {
          name: "AI Perception Analysis",
          slugPattern: "ai-perception-{company}",
          contentTemplate: "",
          contentType: CONTENT_TYPE.PERCEPTION,
          version: 1,
        },
      })
    }

    // Upsert entity for the company
    const entitySlug = slugify(payload.company_name)
    const entity = await prisma.entity.upsert({
      where: { slug: entitySlug },
      update: {
        metadata: {
          website: payload.company_website || "",
          industry: payload.industry || "",
          competitors: payload.competitors || [],
        },
      },
      create: {
        name: payload.company_name,
        slug: entitySlug,
        type: "company",
        metadata: {
          website: payload.company_website || "",
          industry: payload.industry || "",
          competitors: payload.competitors || [],
        },
      },
    })

    // Build content with frontmatter
    const content = buildPerceptionContent(
      {
        meta_description: payload.meta_description || "",
        target_keyword: payload.target_keyword || "",
        secondary_keywords: payload.secondary_keywords || [],
        key_findings: payload.key_findings || [],
        faq: payload.faq || [],
        company_name: payload.company_name,
        company_website: payload.company_website || "",
        industry: payload.industry || "",
        competitors: payload.competitors || [],
        sonic_task_id: payload.sonic_task_id || "",
        perception_scores: payload.perception_scores || [],
        head_to_head_summary: payload.head_to_head_summary || null,
      },
      payload.blog_markdown,
    )

    // Upsert the generated page
    const page = await prisma.generatedPage.upsert({
      where: { slug: payload.slug },
      update: {
        title: payload.title,
        content,
        status: PAGE_STATUS.PUBLISHED,
        templateId: template.id,
        entityId: entity.id,
      },
      create: {
        slug: payload.slug,
        title: payload.title,
        content,
        status: PAGE_STATUS.PUBLISHED,
        templateId: template.id,
        entityId: entity.id,
      },
    })

    // Save version history
    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        content,
      },
    })

    return NextResponse.json({
      success: true,
      slug: payload.slug,
      url: `/ai-perception/${payload.slug}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    console.error("[perception-blogs] POST failed:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "")
    if (!API_SECRET || token !== API_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    if (!slug) {
      return NextResponse.json({ success: false, error: "slug query param required" }, { status: 400 })
    }

    const page = await prisma.generatedPage.findUnique({ where: { slug } })
    if (!page) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 })
    }

    // Delete versions first (FK constraint), then the page
    await prisma.pageVersion.deleteMany({ where: { pageId: page.id } })
    await prisma.generatedPage.delete({ where: { slug } })

    return NextResponse.json({ success: true, deleted: slug })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    console.error("[perception-blogs] DELETE failed:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
