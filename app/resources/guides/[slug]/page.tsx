import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import type { ReactNode } from "react"
import { isValidElement } from "react"
import remarkGfm from "remark-gfm"
import Breadcrumbs from "../../../../components/Breadcrumbs"
import { getGuideBySlug, getGuideSlugs } from "../../../../lib/guides"
import styles from "../../../../styles/Page.module.css"
import GuideToc from "./GuideToc"
import pageStyles from "./page.module.css"

type GuidePageProps = {
  params: {
    slug: string
  }
}

type TocItem = {
  id: string
  title: string
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
    })
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

export async function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug)

  if (!guide) {
    return {
      title: "Guide Not Found",
      description: "This guide could not be found.",
    }
  }

  return {
    title: `${guide.title} | Readable Guides`,
    description: guide.description,
    openGraph: {
      title: `${guide.title} | Readable Guides`,
      description: guide.description,
      type: "article",
    },
  }
}

export default function GuidePage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug)

  if (!guide) {
    notFound()
  }

  const isRawHtmlGuide = guide.content.trimStart().startsWith("<")
  const tocItems = isRawHtmlGuide ? getRawHtmlToc(guide.content) : getMarkdownToc(guide.content)

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: "Guides", href: "/resources/guides" },
              { label: guide.title },
            ]}
          />
          <h1 className={styles.heroTitle}>{guide.title}</h1>
          <p className={styles.text}>{guide.author}</p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <article className={styles.container}>
          <div className={pageStyles.layout}>
            <div className={`${styles.heroDescription} ${pageStyles.content}`}>
              {isRawHtmlGuide ? (
                <div dangerouslySetInnerHTML={{ __html: guide.content }} />
              ) : (
                <MDXRemote
                  source={guide.content}
                  options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                  components={{
                    h2: ({ children, ...props }) => {
                      const headingText = getTextFromNode(children)
                      const id = slugify(headingText)

                      return (
                        <h2 id={id} {...props}>
                          {children}
                        </h2>
                      )
                    },
                  }}
                />
              )}
            </div>

            {tocItems.length > 0 ? <GuideToc items={tocItems} /> : null}
          </div>
        </article>
      </section>
    </main>
  )
}
