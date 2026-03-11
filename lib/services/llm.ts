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

const client = new Anthropic()

export async function generateText(
  messages: ChatMessage[],
  options: LLMOptions = {}
): Promise<string> {
  const { temperature = 0.1, maxTokens = 4096, model = "sonnet" } = options

  const systemMessages = messages.filter((m) => m.role === "system")
  const nonSystemMessages = messages.filter((m) => m.role !== "system")
  const systemText = systemMessages.map((m) => m.content).join("\n\n") || undefined

  const response = await client.messages.create({
    model: MODELS[model],
    max_tokens: maxTokens,
    temperature,
    ...(systemText ? { system: systemText } : {}),
    messages: nonSystemMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  })

  const text = response.content.find((b) => b.type === "text")
  if (!text || text.type !== "text" || !text.text.trim()) {
    throw new Error("Claude returned empty content")
  }

  return text.text.trim()
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
