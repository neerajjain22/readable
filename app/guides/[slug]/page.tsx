import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { isValidElement } from "react"
import Breadcrumbs from "../../../components/Breadcrumbs"
import GuideCollectionPage from "../../../components/guides/GuideCollectionPage"
import GuideSummary from "../../../components/guides/GuideSummary"
import ProgrammaticLayout from "../../../components/programmatic/ProgrammaticLayout"
import MdxRenderer from "../../../components/programmatic/MdxRenderer"
import AnalyzeWebsiteCTA from "../../../components/programmatic/AnalyzeWebsiteCTA"
import BookDemoCTA from "../../../components/programmatic/BookDemoCTA"
import FAQAccordion from "../../../components/guides/FAQAccordion"
import RelatedGuides from "../../../components/guides/RelatedGuides"
import TableOfContents from "../../../components/guides/TableOfContents"
import {
  extractLevelTwoHeadings,
  getSummaryPoints,
  parseFaqItems,
  splitGuideSections,
} from "../../../lib/internalLinks"
import { getCollectionIntro, getCollectionSlug, getCollectionSlugFromPattern, getCollectionTitle } from "../../../lib/programmatic/collections"
import { PAGE_STATUS } from "../../../lib/programmatic/constants"
import { getGuideBySlug } from "../../../lib/guides"
import { renderMdx } from "../../../lib/mdx/renderMdx"
import { prisma } from "../../../lib/prisma"
import pageStyles from "../../../components/programmatic/programmatic.module.css"
import sharedStyles from "../../../styles/Page.module.css"
import GuideToc from "../../resources/guides/[slug]/GuideToc"
import editorialPageStyles from "../../resources/guides/[slug]/page.module.css"
import {
  getGeneratedPageBySlug,
} from "../../../lib/programmatic/repository"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tryreadable.ai"
export const dynamic = "force-dynamic"

type RouteParams = {
  params: { slug: string }
}

type TocItem = {
  id: string
  title: string
}

function getDisplayGuideTitle(title: string, entityName: string) {
  const normalizedEntitySlug = entityName.trim().toLowerCase().replace(/\s+/g, "-")
  const pattern = new RegExp(`\\b${normalizedEntitySlug}\\b`, "gi")
  return title.replace(pattern, entityName)
}

function excerpt(input: string): string {
  return input.replace(/[#*_`>\-]/g, "").replace(/\s+/g, " ").trim().slice(0, 160)
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

function getRawHtmlToc(content: string): TocItem[] {
  return Array.from(content.matchAll(/<article[^>]*id="([^"]+)"[^>]*>[\s\S]*?<h2>([\s\S]*?)<\/h2>/g)).map(
    (match) => ({
      id: match[1],
      title: stripHtml(match[2]),
    }),
  )
}

function getMarkdownToc(content: string): TocItem[] {
  return Array.from(content.matchAll(/^##\s+(.+)$/gm)).map((match) => {
    const title = match[1].trim()
    return { id: slugify(title), title }
  })
}

function getTextFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map((child) => getTextFromNode(child)).join("")
  }

  if (isValidElement(node)) {
    return getTextFromNode(node.props.children)
  }

  return ""
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

  const guide = getGuideBySlug(params.slug)

  if (guide) {
    return {
      title: `${guide.title} | Readable Guides`,
      description: guide.description,
      alternates: {
        canonical: `${BASE_URL}/guides/${guide.slug}`,
      },
      openGraph: {
        title: `${guide.title} | Readable Guides`,
        description: guide.description,
        type: "article",
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
    const headings = extractLevelTwoHeadings(page.content)
    const summaryHeadings = getSummaryPoints(headings, 4)
    const sections = splitGuideSections(page.content)
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
            {sections.map((section) => {
              const isFaqSection = section.heading.toLowerCase() === "faq"
              const faqItems = isFaqSection ? parseFaqItems(section.body) : []

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
    const guide = getGuideBySlug(params.slug)

    if (!guide) {
      notFound()
    }

    const isRawHtmlGuide = guide.content.trimStart().startsWith("<")
    const tocItems = isRawHtmlGuide ? getRawHtmlToc(guide.content) : getMarkdownToc(guide.content)

    return (
      <main className={sharedStyles.page}>
        <section className={sharedStyles.section}>
          <div className={sharedStyles.container}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Guides", href: "/guides" },
                { label: guide.title },
              ]}
            />
            <h1 className={sharedStyles.heroTitle}>{guide.title}</h1>
            <p className={sharedStyles.text}>{guide.author}</p>
          </div>
        </section>

        <section className={sharedStyles.sectionAlt}>
          <article className={sharedStyles.container}>
            <div className={editorialPageStyles.layout}>
              <div className={`${sharedStyles.heroDescription} ${editorialPageStyles.content}`}>
                {isRawHtmlGuide ? (
                  <div dangerouslySetInnerHTML={{ __html: guide.content }} />
                ) : (
                  renderMdx(guide.content, {
                    h2: ({ children, ...props }) => {
                      const headingText = getTextFromNode(children)
                      const id = slugify(headingText)

                      return (
                        <h2 id={id} {...props}>
                          {children}
                        </h2>
                      )
                    },
                  })
                )}
              </div>
              {tocItems.length > 0 ? <GuideToc items={tocItems} /> : null}
            </div>
          </article>
        </section>
      </main>
    )
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
