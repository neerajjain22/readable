import fs from "node:fs"
import path from "node:path"

export type CaseStudy = {
  slug: string
  category: string
  industry: string
  result: string
  summary: string
  file: string
}

const caseStudiesDir = path.join(process.cwd(), "content", "case-studies")

function isCaseStudy(data: unknown): data is CaseStudy {
  if (!data || typeof data !== "object") {
    return false
  }

  const item = data as Record<string, unknown>

  return (
    typeof item.slug === "string" &&
    typeof item.category === "string" &&
    typeof item.industry === "string" &&
    typeof item.result === "string" &&
    typeof item.summary === "string" &&
    typeof item.file === "string"
  )
}

export function getAllCaseStudies(): CaseStudy[] {
  if (!fs.existsSync(caseStudiesDir)) {
    return []
  }

  const files = fs
    .readdirSync(caseStudiesDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))

  return files
    .map((file) => {
      const fullPath = path.join(caseStudiesDir, file)
      const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8")) as unknown
      return isCaseStudy(parsed) ? parsed : null
    })
    .filter((study): study is CaseStudy => !!study)
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  const normalized = slug.trim().toLowerCase()
  return getAllCaseStudies().find((study) => study.slug === normalized) ?? null
}
