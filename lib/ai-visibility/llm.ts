const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"
const DEFAULT_OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
const REQUEST_TIMEOUT_MS = Number(process.env.LLM_REQUEST_TIMEOUT_MS || 45000)
const MAX_RETRIES = Number(process.env.LLM_MAX_RETRIES || 2)

type ChatMessage = {
  role: "system" | "user"
  content: string
}

function resolveProvider() {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase()

  if (provider !== "openai" && provider !== "openrouter") {
    throw new Error("Unsupported LLM_PROVIDER. Use 'openai' or 'openrouter'.")
  }

  return provider
}

async function callOpenAI(messages: ChatMessage[], temperature = 0.1) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_OPENAI_MODEL,
        messages,
        temperature,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenAI request failed: ${response.status} ${text}`)
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    return payload.choices?.[0]?.message?.content?.trim() || ""
  } finally {
    clearTimeout(timeoutId)
  }
}

async function callOpenRouter(messages: ChatMessage[], temperature = 0.1) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_OPENROUTER_MODEL,
        messages,
        temperature,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenRouter request failed: ${response.status} ${text}`)
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    return payload.choices?.[0]?.message?.content?.trim() || ""
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function generateText(messages: ChatMessage[], temperature = 0.1): Promise<string> {
  const provider = resolveProvider()
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result =
        provider === "openrouter"
          ? await callOpenRouter(messages, temperature)
          : await callOpenAI(messages, temperature)

      if (!result) {
        throw new Error("LLM returned empty content")
      }

      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown LLM failure")
      if (attempt < MAX_RETRIES) {
        const delayMs = 250 * (attempt + 1)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new Error(`LLM request failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message || "unknown error"}`)
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

  if (start === -1) {
    return cleaned
  }

  let depth = 0
  for (let i = start; i < cleaned.length; i += 1) {
    const char = cleaned[i]
    if (char === opening) depth += 1
    if (char === closing) depth -= 1
    if (depth === 0) {
      return cleaned.slice(start, i + 1)
    }
  }

  return cleaned
}

export async function generateJson<T>(messages: ChatMessage[]): Promise<T> {
  const raw = await generateText(messages, 0)
  const cleaned = extractJsonObjectOrArray(raw)

  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(`LLM returned invalid JSON: ${raw}`)
  }
}
