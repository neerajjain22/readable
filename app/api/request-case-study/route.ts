import { NextResponse } from "next/server"
import { getCaseStudyBySlug } from "../../../lib/case-study-data"
import {
  assertOtpRateLimit,
  generateOtp,
  getClientIp,
  isBusinessEmail,
  isVerifiedEmail,
  normalizeEmail,
  sendCaseStudyEmail,
  sendOtpEmail,
  storeOtp,
} from "../../../lib/case-study-gate"

type RequestPayload = {
  email?: string
  slug?: string
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    await assertOtpRateLimit(ip)

    const payload = (await request.json()) as RequestPayload
    const email = normalizeEmail(payload.email ?? "")
    const slug = (payload.slug ?? "").trim().toLowerCase()

    if (!email || !slug) {
      return NextResponse.json({ error: "Email and case study are required." }, { status: 400 })
    }

    if (!isBusinessEmail(email)) {
      return NextResponse.json({ error: "Please use a valid business email address." }, { status: 400 })
    }

    const study = getCaseStudyBySlug(slug)
    if (!study) {
      return NextResponse.json({ error: "Requested case study was not found." }, { status: 404 })
    }

    const verified = await isVerifiedEmail(email)

    if (verified) {
      await sendCaseStudyEmail(email, slug)
      return NextResponse.json({ status: "sent" })
    }

    const otp = generateOtp()
    await storeOtp(email, otp)
    await sendOtpEmail(email, otp)

    return NextResponse.json({ status: "otp_sent" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"

    if (message.toLowerCase().includes("too many")) {
      return NextResponse.json({ error: message }, { status: 429 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
