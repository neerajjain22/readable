import { prisma } from "../prisma"
import { PAGE_STATUS, type PageStatus } from "./constants"

export async function getGeneratedPageBySlug(slug: string) {
  return prisma.generatedPage.findUnique({
    where: { slug },
    include: {
      template: true,
      entity: true,
    },
  })
}

export async function getGeneratedPageById(id: string) {
  return prisma.generatedPage.findUnique({
    where: { id },
    include: {
      template: true,
      entity: true,
      versions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })
}

export async function getProgrammaticPagesForAdmin() {
  return prisma.generatedPage.findMany({
    include: {
      template: true,
      entity: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getPublishedProgrammaticPages() {
  return prisma.generatedPage.findMany({
    where: { status: PAGE_STATUS.PUBLISHED },
    include: {
      template: true,
      entity: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getPublishedGuideCards() {
  return prisma.generatedPage.findMany({
    where: {
      status: PAGE_STATUS.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getPublishedPagesByTemplate(
  templateId: string,
  currentPageId: string,
  limit = 5,
) {
  return prisma.generatedPage.findMany({
    where: {
      templateId,
      status: PAGE_STATUS.PUBLISHED,
      NOT: { id: currentPageId },
    },
    select: {
      slug: true,
      title: true,
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
  })
}

export async function getPublishedPagesByEntity(entityId: string, currentPageId: string, limit = 5) {
  return prisma.generatedPage.findMany({
    where: {
      entityId,
      status: PAGE_STATUS.PUBLISHED,
      NOT: { id: currentPageId },
    },
    select: {
      slug: true,
      title: true,
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
  })
}

export async function getPublishedPagesForInternalLinks() {
  return prisma.generatedPage.findMany({
    where: {
      status: PAGE_STATUS.PUBLISHED,
    },
    select: {
      slug: true,
      entity: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function getPublishedPagesGroupedData() {
  return prisma.generatedPage.findMany({
    where: { status: PAGE_STATUS.PUBLISHED },
    include: {
      template: true,
      entity: true,
    },
    orderBy: [{ templateId: "asc" }, { title: "asc" }],
  })
}

export async function getPublishedPagesWithTemplateAndEntity() {
  return prisma.generatedPage.findMany({
    where: {
      status: PAGE_STATUS.PUBLISHED,
    },
    include: {
      template: true,
      entity: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function updateGeneratedPageStatus(pageId: string, status: PageStatus) {
  return prisma.generatedPage.update({
    where: { id: pageId },
    data: { status },
  })
}

export async function saveGeneratedPageContent(pageId: string, content: string, status?: PageStatus) {
  const page = await prisma.generatedPage.update({
    where: { id: pageId },
    data: {
      content,
      ...(status ? { status } : {}),
    },
  })

  await prisma.pageVersion.create({
    data: {
      pageId,
      content,
    },
  })

  return page
}
