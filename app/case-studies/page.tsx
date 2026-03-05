import type { Metadata } from "next"
import CaseStudiesClient from "./CaseStudiesClient"
import { getAllCaseStudies } from "../../lib/case-study-data"

export const metadata: Metadata = {
  title: "Case Studies | Readable",
  description:
    "See how teams improve AI discovery outcomes using Readable, with gated case studies delivered to verified business email.",
}

export default function CaseStudiesPage() {
  const studies = getAllCaseStudies()
  return <CaseStudiesClient studies={studies} />
}
