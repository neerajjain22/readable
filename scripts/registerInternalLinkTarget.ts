import { PrismaClient } from "@prisma/client"
import { generateKeywordsForArticle } from "../lib/internalLinks/generateKeywords.ts"

const prisma = new PrismaClient()
const MAX_KEYWORDS_PER_ARTICLE = 6

export async function registerInternalLinkTarget(
  slug: string,
  title: string,
  summary: string,
  db: PrismaClient = prisma,
) {
  const trimmedSlug = slug.trim()
  const trimmedTitle = title.trim()
  const trimmedSummary = summary.trim()

  if (!trimmedSlug || !trimmedTitle) {
    throw new Error("slug and title are required to register an internal link target")
  }

  const target = await db.internalLinkTarget.upsert({
    where: { slug: trimmedSlug },
    update: { title: trimmedTitle },
    create: {
      slug: trimmedSlug,
      title: trimmedTitle,
    },
  })

  const generatedKeywords = await generateKeywordsForArticle(trimmedTitle, trimmedSummary)
  const keywords = generatedKeywords.slice(0, MAX_KEYWORDS_PER_ARTICLE)

  for (const keyword of keywords) {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) {
      continue
    }

    const existing = await db.internalLinkKeyword.findUnique({
      where: { keyword: normalized },
    })
    if (existing) {
      continue
    }

    await db.internalLinkKeyword.create({
      data: {
        keyword: normalized,
        targetId: target.id,
      },
    })
  }

  return target
}

async function runFromCli() {
  const slug = process.argv[2] || ""
  const title = process.argv[3] || ""
  const summary = process.argv.slice(4).join(" ")

  if (!slug || !title || !summary) {
    console.error("Usage: node scripts/registerInternalLinkTarget.ts <slug> <title> <summary>")
    process.exit(1)
  }

  await registerInternalLinkTarget(slug, title, summary)
  console.log(`Registered internal link target: ${slug}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFromCli()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
