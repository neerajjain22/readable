import Anthropic from "@anthropic-ai/sdk"

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type ModelName = "sonnet" | "haiku"

type LLMOptions = {
  temperature?: number
  maxTokens?: number
  model?: ModelName
}

export const MODELS: Record<ModelName, string> = {
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5-20251001",
}

const DEFAULT_LLM_REQUEST_TIMEOUT_MS = 15_000
const DEFAULT_LLM_MAX_RETRIES = 1
const MAX_LLM_RETRIES = 3
const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504])

let cachedClient: Anthropic | null = null
let cachedApiKey = ""

function parsePositiveInt(input: string | undefined, fallback: number) {
  const parsed = Number(input)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.floor(parsed)
}

const LLM_REQUEST_TIMEOUT_MS = Math.max(
  1_000,
  parsePositiveInt(process.env.LLM_REQUEST_TIMEOUT_MS, DEFAULT_LLM_REQUEST_TIMEOUT_MS),
)

const LLM_MAX_RETRIES = Math.min(
  MAX_LLM_RETRIES,
  Math.max(0, parsePositiveInt(process.env.LLM_MAX_RETRIES, DEFAULT_LLM_MAX_RETRIES)),
)

class LLMTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`LLM request timed out after ${timeoutMs}ms`)
    this.name = "LLMTimeoutError"
  }
}

function getAnthropicClient() {
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim()
  if (!apiKey) {
    throw new Error(
      "AI configuration error: Missing ANTHROPIC_API_KEY. Add it to your environment variables and restart the server.",
    )
  }

  if (cachedClient && cachedApiKey === apiKey) {
    return cachedClient
  }

  cachedApiKey = apiKey
  cachedClient = new Anthropic({ apiKey })
  return cachedClient
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new LLMTimeoutError(timeoutMs))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

function isRetryableLlmError(error: unknown) {
  if (error instanceof LLMTimeoutError) {
    return true
  }

  const status = (error as { status?: unknown })?.status
  if (typeof status === "number" && RETRYABLE_STATUS_CODES.has(status)) {
    return true
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error || "").toLowerCase()
  return (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("rate limit") ||
    message.includes("temporarily unavailable") ||
    message.includes("overloaded") ||
    message.includes("socket hang up") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("aborterror")
  )
}

function computeRetryDelayMs(attempt: number) {
  const baseDelay = 250 * Math.pow(2, attempt)
  const jitter = Math.floor(Math.random() * 200)
  return baseDelay + jitter
}

export async function generateText(
  messages: ChatMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const { temperature = 0.1, maxTokens = 4096, model = "sonnet" } = options

  const systemMessages = messages.filter((m) => m.role === "system")
  const nonSystemMessages = messages.filter((m) => m.role !== "system")
  const systemText = systemMessages.map((m) => m.content).join("\n\n") || undefined

  const client = getAnthropicClient()
  const request = {
    model: MODELS[model],
    max_tokens: maxTokens,
    temperature,
    ...(systemText ? { system: systemText } : {}),
    messages: nonSystemMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  }

  let lastError: unknown = null
  for (let attempt = 0; attempt <= LLM_MAX_RETRIES; attempt += 1) {
    try {
      const response = await withTimeout(client.messages.create(request), LLM_REQUEST_TIMEOUT_MS)
      const text = response.content.find((b) => b.type === "text")
      if (!text || text.type !== "text" || !text.text.trim()) {
        throw new Error("Claude returned empty content")
      }

      return text.text.trim()
    } catch (error) {
      lastError = error
      const shouldRetry = attempt < LLM_MAX_RETRIES && isRetryableLlmError(error)
      if (!shouldRetry) {
        throw error
      }

      await sleep(computeRetryDelayMs(attempt))
    }
  }

  throw lastError instanceof Error ? lastError : new Error("LLM request failed after retries")
}

function extractJsonObjectOrArray(input: string): string {
  const cleaned = input.replace(/^```json\s*/i, "").replace(/^```/, "").replace(/```$/, "").trim()
  const arrayStart = cleaned.indexOf("[")
  const objectStart = cleaned.indexOf("{")

  let start = -1
  let opening = ""
  let closing = ""

  if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
    start = arrayStart
    opening = "["
    closing = "]"
  } else if (objectStart !== -1) {
    start = objectStart
    opening = "{"
    closing = "}"
  }

  if (start === -1) return cleaned

  let depth = 0
  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i]
    if (char === opening) depth++
    if (char === closing) depth--
    if (depth === 0) return cleaned.slice(start, i + 1)
  }

  return cleaned
}

export async function generateJson<T>(
  messages: ChatMessage[],
  options: LLMOptions = {}
): Promise<T> {
  const raw = await generateText(messages, { ...options, temperature: 0 })
  const cleaned = extractJsonObjectOrArray(raw)

  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(`LLM returned invalid JSON: ${raw}`)
  }
}
