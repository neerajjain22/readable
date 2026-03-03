import Head from "next/head"

type SeoProps = {
  title: string
  description: string
  path?: string
  image?: string
  type?: "website" | "article"
  publishedTime?: string
  structuredData?: Record<string, unknown>
}

const SITE_URL = "https://readable-r1c19idvd-readable2.vercel.app"

export default function Seo({
  title,
  description,
  path = "/",
  image = "/images/og-default.svg",
  type = "website",
  publishedTime,
  structuredData,
}: SeoProps) {
  const canonical = `${SITE_URL}${path}`
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}

      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      ) : null}
    </Head>
  )
}
