import type { Metadata } from "next"
import { notFound } from "next/navigation"
import GuideCollectionPage from "../../../components/guides/GuideCollectionPage"
import GuideSummary from "../../../components/guides/GuideSummary"
import ProgrammaticLayout from "../../../components/programmatic/ProgrammaticLayout"
import MdxRenderer from "../../../components/programmatic/MdxRenderer"
import AnalyzeWebsiteCTA from "../../../components/programmatic/AnalyzeWebsiteCTA"
import BookDemoCTA from "../../../components/programmatic/BookDemoCTA"
import CalloutBox from "../../../components/guides/CalloutBox"
import FAQAccordion from "../../../components/guides/FAQAccordion"
import RelatedGuides from "../../../components/guides/RelatedGuides"
import TableOfContents from "../../../components/guides/TableOfContents"
import {
  addInternalLinks,
  extractLevelTwoHeadings,
  getFirstParagraph,
  getSummaryPoints,
  parseFaqItems,
  splitGuideSections,
} from "../../../lib/internalLinks"
import { getCollectionIntro, getCollectionSlug, getCollectionSlugFromPattern, getCollectionTitle } from "../../../lib/programmatic/collections"
import { PAGE_STATUS } from "../../../lib/programmatic/constants"
import { prisma } from "../../../lib/prisma"
import pageStyles from "../../../components/programmatic/programmatic.module.css"
import {
  getGeneratedPageBySlug,
  getPublishedPagesForInternalLinks,
} from "../../../lib/programmatic/repository"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tryreadable.ai"
export const dynamic = "force-dynamic"

type RouteParams = {
  params: { slug: string }
}

function getDisplayGuideTitle(title: string, entityName: string) {
  const normalizedEntitySlug = entityName.trim().toLowerCase().replace(/\s+/g, "-")
  const pattern = new RegExp(`\\b${normalizedEntitySlug}\\b`, "gi")
  return title.replace(pattern, entityName)
}

function excerpt(input: string): string {
  return input.replace(/[#*_`>\-]/g, "").replace(/\s+/g, " ").trim().slice(0, 160)
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const page = await getGeneratedPageBySlug(params.slug)

  if (page) {
    const isPublished = page.status === PAGE_STATUS.PUBLISHED

    return {
      title: page.title,
      description: excerpt(page.content),
      alternates: {
        canonical: `${BASE_URL}/guides/${page.slug}`,
      },
      robots: isPublished
        ? {
            index: true,
            follow: true,
          }
        : {
            index: false,
            follow: false,
            nocache: true,
            googleBot: {
              index: false,
              follow: false,
              noimageindex: true,
            },
          },
    }
  }

  const templates = await prisma.template.findMany({
    select: {
      name: true,
      slugPattern: true,
      generatedPages: {
        where: {
          status: PAGE_STATUS.PUBLISHED,
        },
        select: {
          id: true,
          entity: {
            select: {
              type: true,
            },
          },
        },
      },
    },
  })

  const template = templates.find(
    (item) => {
      if (item.generatedPages.length === 0) {
        return false
      }

      const platformToken = item.generatedPages[0]?.entity.type || "platform"
      return (
        getCollectionSlug(item, { platformToken }) === params.slug ||
        getCollectionSlugFromPattern(item.slugPattern) === params.slug
      )
    },
  )

  if (template) {
    const platformToken = template.generatedPages[0]?.entity.type || "platform"
    const collectionTitle = getCollectionTitle(template, { platformToken })
    const canonicalSlug = getCollectionSlug(template, { platformToken })

    return {
      title: collectionTitle,
      description: getCollectionIntro(template, template.generatedPages.length, { platformToken }).slice(0, 160),
      alternates: {
        canonical: `${BASE_URL}/guides/${canonicalSlug}`,
      },
    }
  }

  return {
    title: "Guide Not Found",
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function ProgrammaticGuidePage({ params }: RouteParams) {
  const page = await getGeneratedPageBySlug(params.slug)

  if (page) {
    const publishedPagesForLinks = await getPublishedPagesForInternalLinks()
    const linkedContent = addInternalLinks(page.content, publishedPagesForLinks, 3)
    const headings = extractLevelTwoHeadings(page.content)
    const summaryHeadings = getSummaryPoints(headings, 4)
    const sections = splitGuideSections(linkedContent)
    const formattedDate = new Date(page.updatedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return (
      <ProgrammaticLayout
        title={getDisplayGuideTitle(page.title, page.entity.name)}
        author="Readable Team"
        lastUpdated={formattedDate}
      >
        <GuideSummary headings={summaryHeadings} />
        <div className={pageStyles.contentGrid}>
          <div className={pageStyles.mainContent}>
            {sections.map((section, index) => {
              const isFaqSection = section.heading.toLowerCase() === "faq"
              const faqItems = isFaqSection ? parseFaqItems(section.body) : []
              const nextSection = sections[index + 1]
              const calloutText =
                (index + 1) % 2 === 0 && nextSection ? getFirstParagraph(nextSection.body) : ""

              return (
                <div key={section.heading}>
                  {isFaqSection && faqItems.length > 0 ? (
                    <>
                      <MdxRenderer source={`## ${section.heading}`} />
                      <FAQAccordion items={faqItems} />
                    </>
                  ) : (
                    <MdxRenderer source={`## ${section.heading}\n\n${section.body}`} />
                  )}
                  {calloutText ? <CalloutBox type="insight" text={calloutText} /> : null}
                </div>
              )
            })}
          </div>
          <TableOfContents headings={headings} />
        </div>
        <RelatedGuides
          currentPageId={page.id}
          templateId={page.templateId}
          entityId={page.entityId}
          entityName={page.entity.name}
        />
        <AnalyzeWebsiteCTA />
        <BookDemoCTA />
      </ProgrammaticLayout>
    )
  }

  const templates = await prisma.template.findMany({
    include: {
      generatedPages: {
        where: {
          status: PAGE_STATUS.PUBLISHED,
        },
        include: {
          entity: true,
        },
        orderBy: {
          title: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const matchedTemplate = templates.find(
    (template) => {
      if (template.generatedPages.length === 0) {
        return false
      }

      const platformToken = template.generatedPages[0]?.entity.type || "platform"
      return (
        getCollectionSlug(template, { platformToken }) === params.slug ||
        getCollectionSlugFromPattern(template.slugPattern) === params.slug
      )
    },
  )

  if (!matchedTemplate) {
    notFound()
  }

  return (
    <GuideCollectionPage
      title={getCollectionTitle(matchedTemplate, {
        platformToken: matchedTemplate.generatedPages[0]?.entity.type || "platform",
      })}
      intro={getCollectionIntro(matchedTemplate, matchedTemplate.generatedPages.length, {
        platformToken: matchedTemplate.generatedPages[0]?.entity.type || "platform",
      })}
      guides={matchedTemplate.generatedPages}
    />
  )
}
