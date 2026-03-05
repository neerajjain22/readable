import { NextResponse } from "next/server"
import { getCaseStudyBySlug } from "../../../lib/case-study-data"
import { logCaseStudyDownload, saveLead } from "../../../lib/db"

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
])

type DownloadPayload = {
  email?: string
  slug?: string
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

function isBusinessEmail(email: string): boolean {
  const normalized = normalizeEmail(email)
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)

  if (!validEmail) {
    return false
  }

  const domain = normalized.split("@")[1]

  if (!domain) {
    return false
  }

  return !PERSONAL_DOMAINS.has(domain)
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DownloadPayload
    const email = normalizeEmail(payload.email ?? "")
    const slug = (payload.slug ?? "").trim().toLowerCase()

    if (!email || !slug) {
      return NextResponse.json({ success: false, error: "Email and case study are required." }, { status: 400 })
    }

    if (!isBusinessEmail(email)) {
      return NextResponse.json({ success: false, error: "Please use your business email" }, { status: 400 })
    }

    const study = getCaseStudyBySlug(slug)

    if (!study) {
      return NextResponse.json({ success: false, error: "Requested case study was not found." }, { status: 404 })
    }

    await saveLead(email, "case-study-download")
    await logCaseStudyDownload(email, slug)

    return NextResponse.json({
      success: true,
      downloadUrl: study.file,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to process download right now. Please try again." },
      { status: 500 },
    )
  }
}
