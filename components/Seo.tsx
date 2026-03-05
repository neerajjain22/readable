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
  void SITE_URL
  void title
  void description
  void path
  void image
  void type
  void publishedTime
  void structuredData
  return null
}
