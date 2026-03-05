import { NextResponse } from "next/server"
import { saveApiAccessRequest } from "../../../lib/db"

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
])

type ApiAccessRequestPayload = {
  name?: string
  email?: string
  company?: string
  website?: string
  use_case?: string
  details?: string
}

function normalize(value: string): string {
  return value.trim()
}

function normalizeEmail(raw: string): string {
  return normalize(raw).toLowerCase()
}

function isBusinessEmail(email: string): boolean {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (!validEmail) {
    return false
  }

  const domain = email.split("@")[1]
  if (!domain) {
    return false
  }

  return !PERSONAL_DOMAINS.has(domain)
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ApiAccessRequestPayload

    const name = normalize(payload.name ?? "")
    const email = normalizeEmail(payload.email ?? "")
    const company = normalize(payload.company ?? "")
    const website = normalize(payload.website ?? "")
    const useCase = normalize(payload.use_case ?? "")
    const details = normalize(payload.details ?? "")

    if (!name || !email || !company || !website || !useCase || !details) {
      return NextResponse.json(
        { success: false, error: "Please complete all required fields." },
        { status: 400 },
      )
    }

    if (!isBusinessEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please use your business email address." },
        { status: 400 },
      )
    }

    if (!isValidHttpUrl(website)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid company website URL." },
        { status: 400 },
      )
    }

    await saveApiAccessRequest({
      name,
      email,
      company,
      website,
      useCase,
      details,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to submit request right now. Please try again." },
      { status: 500 },
    )
  }
}
