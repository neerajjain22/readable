import { NextResponse } from "next/server"
import { processQueuedAiVisibilityReports } from "../../../../lib/ai-visibility/report"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

function parsePositiveInt(input: string | null, fallback: number, max: number) {
  const parsed = Number(input)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.min(Math.round(parsed), max)
}

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return ""
  }

  return authorization.slice("bearer ".length).trim()
}

function isAuthorized(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true as const }
  }

  const expectedToken = (process.env.AI_VISIBILITY_PROCESS_SECRET || process.env.CRON_SECRET || "").trim()
  if (!expectedToken) {
    return { ok: false as const, status: 500, message: "AI visibility processor secret is not configured." }
  }

  const providedToken = readBearerToken(request)
  if (providedToken !== expectedToken) {
    return { ok: false as const, status: 401, message: "Unauthorized" }
  }

  return { ok: true as const }
}

async function handle(request: Request) {
  const auth = isAuthorized(request)
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.message }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const companySlug = (searchParams.get("companySlug") || "").trim().toLowerCase()
  const limit = parsePositiveInt(searchParams.get("limit"), 1, 3)

  const result = await processQueuedAiVisibilityReports({
    companySlug: companySlug || undefined,
    maxReports: limit,
    force: Boolean(companySlug),
  })

  return NextResponse.json({
    success: true,
    ...result,
  })
}

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}
