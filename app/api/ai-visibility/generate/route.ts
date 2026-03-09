import { NextResponse } from "next/server"
import { generateAiVisibilityReport } from "../../../../lib/ai-visibility/report"
import { AI_VISIBILITY_STATUS } from "../../../../lib/ai-visibility/repository"

type GeneratePayload = {
  domain?: string
  forceRefresh?: boolean
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GeneratePayload
    const domain = (payload.domain || "").trim()

    if (!domain) {
      return NextResponse.json({ success: false, error: "Domain is required." }, { status: 400 })
    }

    const result = await generateAiVisibilityReport(domain, {
      forceRefresh: Boolean(payload.forceRefresh),
    })

    const status = result.report.status

    return NextResponse.json({
      success: true,
      companySlug: result.companySlug,
      status,
      cached: result.cached,
      redirectNow: status === AI_VISIBILITY_STATUS.COMPLETED,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate report right now."
    const lower = message.toLowerCase()
    const statusCode = lower.includes("invalid domain") || lower.includes("required") ? 400 : 500

    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}
