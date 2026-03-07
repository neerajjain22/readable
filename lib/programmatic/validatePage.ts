import { prisma } from "../prisma"

type ValidatePageInput = {
  slug: string
  title: string
  content: string
}

export async function validatePage(input: ValidatePageInput) {
  if (!input.slug || !input.title || !input.content) {
    throw new Error("Missing required page fields")
  }

  const existing = await prisma.generatedPage.findUnique({ where: { slug: input.slug } })
  if (existing) {
    throw new Error(`Slug already exists: ${input.slug}`)
  }

  return true
}
