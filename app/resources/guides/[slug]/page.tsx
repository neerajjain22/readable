import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import Breadcrumbs from "../../../../components/Breadcrumbs"
import { getGuideBySlug, getGuideSlugs } from "../../../../lib/guides"
import styles from "../../../../styles/Page.module.css"

type GuidePageProps = {
  params: {
    slug: string
  }
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
          <div className={styles.heroDescription}>
            {isRawHtmlGuide ? (
              <div dangerouslySetInnerHTML={{ __html: guide.content }} />
            ) : (
              <MDXRemote
                source={guide.content}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                components={{
                  img: (props) => (
                    <img
                      {...props}
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        height: "auto",
                        display: "block",
                        margin: "24px auto",
                      }}
                    />
                  ),
                }}
              />
            )}
          </div>
        </article>
      </section>
    </main>
  )
}
