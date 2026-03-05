import { NextResponse } from "next/server"
import { saveJobApplication } from "../../../lib/db"

type JobApplicationPayload = {
  name?: string
  email?: string
  linkedin?: string
  portfolio?: string
  role?: string
  intro?: string
}

function normalize(value: string): string {
  return value.trim()
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as JobApplicationPayload

    const name = normalize(payload.name ?? "")
    const email = normalize(payload.email ?? "").toLowerCase()
    const linkedin = normalize(payload.linkedin ?? "")
    const portfolio = normalize(payload.portfolio ?? "")
    const role = normalize(payload.role ?? "")
    const intro = normalize(payload.intro ?? "")

    if (!name || !email || !linkedin || !role || !intro) {
      return NextResponse.json(
        { success: false, error: "Please complete all required fields." },
        { status: 400 },
      )
    }

    await saveJobApplication({
      name,
      email,
      linkedin,
      portfolio,
      role,
      intro,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to submit application right now. Please try again." },
      { status: 500 },
    )
  }
}
