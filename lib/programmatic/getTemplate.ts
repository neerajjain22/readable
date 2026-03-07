import { prisma } from "../prisma"

export async function getTemplate(templateId?: string) {
  if (templateId) {
    return prisma.template.findUnique({ where: { id: templateId } })
  }

  return prisma.template.findFirst({
    orderBy: [{ createdAt: "desc" }, { version: "desc" }],
  })
}
