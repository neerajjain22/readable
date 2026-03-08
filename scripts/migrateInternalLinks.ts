import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { PrismaClient } from "@prisma/client"
import { getAllGuides, getGuideBySlug } from "../lib/guides.ts"
import { getPostBySlug, getPostSlugs } from "../lib/posts.ts"
import { injectInternalLinks } from "../lib/internalLinks/injectInternalLinks.ts"
import { registerInternalLinkTarget } from "./registerInternalLinkTarget.ts"

const prisma = new PrismaClient()

function getSummaryFromContent(content: string) {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  return cleaned.slice(0, 220)
}

async function registerProgrammaticTargets() {
  const pages = await prisma.generatedPage.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
    },
  })

  for (const page of pages) {
    await registerInternalLinkTarget(page.slug, page.title, getSummaryFromContent(page.content), prisma)
  }
}

async function migrateProgrammaticContent() {
  const pages = await prisma.generatedPage.findMany({
    select: {
      id: true,
      slug: true,
      content: true,
    },
  })

  for (const page of pages) {
    const updated = await injectInternalLinks(page.content, { excludeSlug: page.slug })
    if (updated === page.content) {
      continue
    }

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        content: page.content,
      },
    })

    await prisma.generatedPage.update({
      where: { id: page.id },
      data: { content: updated },
    })
  }
}

async function migrateEditorialGuides() {
  const guides = getAllGuides()

  for (const guide of guides) {
    const fullGuide = getGuideBySlug(guide.slug)
    if (!fullGuide) {
      continue
    }

    const routeSlug = `resources/guides/${guide.slug}`
    await registerInternalLinkTarget(
      routeSlug,
      guide.title,
      guide.description || getSummaryFromContent(fullGuide.content),
      prisma,
    )

    const injected = await injectInternalLinks(fullGuide.content, { excludeSlug: routeSlug })
    if (injected === fullGuide.content) {
      continue
    }

    const filePath = path.join(process.cwd(), "content", "guides", `${guide.slug}.mdx`)
    const source = fs.readFileSync(filePath, "utf8")
    const parsed = matter(source)
    const output = matter.stringify(injected, parsed.data)
    fs.writeFileSync(filePath, output, "utf8")
  }
}

async function migrateBlogPosts() {
  const slugs = getPostSlugs()

  for (const slug of slugs) {
    const post = getPostBySlug(slug)
    if (!post) {
      continue
    }

    const routeSlug = `blog/${post.slug}`
    await registerInternalLinkTarget(
      routeSlug,
      post.title,
      post.description || getSummaryFromContent(post.content),
      prisma,
    )

    const injected = await injectInternalLinks(post.content, { excludeSlug: routeSlug })
    if (injected === post.content) {
      continue
    }

    const filePath = path.join(process.cwd(), "content", "blog", `${slug}.mdx`)
    const source = fs.readFileSync(filePath, "utf8")
    const parsed = matter(source)
    const output = matter.stringify(injected, parsed.data)
    fs.writeFileSync(filePath, output, "utf8")
  }
}

async function main() {
  await registerProgrammaticTargets()
  await migrateProgrammaticContent()
  await migrateEditorialGuides()
  await migrateBlogPosts()
  console.log("Internal link migration completed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
