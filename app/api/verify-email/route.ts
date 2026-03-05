import { NextResponse } from "next/server"
import { getCaseStudyBySlug } from "../../../lib/case-study-data"
import {
  assertVerifyRateLimit,
  clearOtp,
  getClientIp,
  isBusinessEmail,
  markVerifiedEmail,
  normalizeEmail,
  readOtp,
  sendCaseStudyEmail,
} from "../../../lib/case-study-gate"

type VerifyPayload = {
  email?: string
  otp?: string
  slug?: string
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    await assertVerifyRateLimit(ip)

    const payload = (await request.json()) as VerifyPayload
    const email = normalizeEmail(payload.email ?? "")
    const otp = (payload.otp ?? "").trim()
    const slug = (payload.slug ?? "").trim().toLowerCase()

    if (!email || !otp || !slug) {
      return NextResponse.json({ error: "Email, OTP, and case study are required." }, { status: 400 })
    }

    if (!isBusinessEmail(email)) {
      return NextResponse.json({ error: "Please use a valid business email address." }, { status: 400 })
    }

    const study = getCaseStudyBySlug(slug)
    if (!study) {
      return NextResponse.json({ error: "Requested case study was not found." }, { status: 404 })
    }

    const storedOtp = await readOtp(email)

    if (!storedOtp || storedOtp.otp !== otp) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 })
    }

    await markVerifiedEmail(email)
    await clearOtp(email)
    await sendCaseStudyEmail(email, slug)

    return NextResponse.json({ status: "verified_and_sent" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"

    if (message.toLowerCase().includes("too many")) {
      return NextResponse.json({ error: message }, { status: 429 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
