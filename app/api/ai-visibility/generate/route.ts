import { NextResponse } from "next/server"
import { generateAiVisibilityReport } from "../../../../lib/ai-visibility/report"
import { AI_VISIBILITY_STATUS } from "../../../../lib/ai-visibility/repository"

type GeneratePayload = {
  domain?: string
  forceRefresh?: boolean
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
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
      startedGeneration: result.startedGeneration,
      redirectNow: status === AI_VISIBILITY_STATUS.COMPLETED,
      requestId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate report right now."
    const lower = message.toLowerCase()
    const missingAiConfig =
      lower.includes("missing anthropic_api_key") ||
      lower.includes("ai configuration error")
    const statusCode =
      lower.includes("invalid domain") || lower.includes("required") || missingAiConfig ? 400 : 500
    console.error(`[ai-visibility][${requestId}] generate route failed`, error)

    const safeMessage = missingAiConfig
      ? "AI provider is not configured. Please set ANTHROPIC_API_KEY in environment variables and restart the server."
      : message

    return NextResponse.json({ success: false, error: safeMessage, requestId }, { status: statusCode })
  }
}
