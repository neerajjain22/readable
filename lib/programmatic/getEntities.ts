import { prisma } from "../prisma"

export async function getEntities(type?: string) {
  return prisma.entity.findMany({
    where: type ? { type } : undefined,
    orderBy: { name: "asc" },
  })
}
