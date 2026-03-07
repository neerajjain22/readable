import { redirect } from "next/navigation"

type LegacyGuidePageProps = {
  params: {
    slug: string
  }
}

export default function LegacyGuidePageRedirect({ params }: LegacyGuidePageProps) {
  redirect(`/guides/${params.slug}`)
}
