import crypto from "node:crypto"

const DEFAULT_PROVIDER = "openrouter"
const ENFORCED_OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet"
const ENFORCED_BEDROCK_MODEL = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0"
const REQUEST_TIMEOUT_MS = Number(process.env.LLM_REQUEST_TIMEOUT_MS || 15000)
const MAX_RETRIES = Number(process.env.LLM_MAX_RETRIES || 1)
const MAX_TOKENS = Number(process.env.LLM_MAX_TOKENS || 1024)

type ChatMessage = {
  role: "system" | "user"
  content: string
}

function resolveProvider() {
  const provider = (process.env.LLM_PROVIDER || DEFAULT_PROVIDER).toLowerCase()

  if (provider !== "openrouter" && provider !== "bedrock") {
    throw new Error("Unsupported LLM_PROVIDER. Allowed values: openrouter, bedrock.")
  }

  return provider
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
        model: ENFORCED_OPENROUTER_MODEL,
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

function hashSha256(value: string) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

function hmacSha256(key: Buffer | string, value: string) {
  return crypto.createHmac("sha256", key).update(value, "utf8").digest()
}

function buildAwsSignatureKey(secretAccessKey: string, dateStamp: string, region: string, service: string) {
  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = hmacSha256(kDate, region)
  const kService = hmacSha256(kRegion, service)
  return hmacSha256(kService, "aws4_request")
}

function iso8601Basic(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "")
}

function toBedrockPayload(messages: ChatMessage[], temperature: number) {
  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n")

  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => ({
      role: "user",
      content: [{ type: "text", text: message.content }],
    }))

  return {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: Math.max(64, MAX_TOKENS),
    temperature,
    ...(system ? { system } : {}),
    messages: userMessages,
  }
}

async function callBedrock(messages: ChatMessage[], temperature = 0.1) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const sessionToken = process.env.AWS_SESSION_TOKEN
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new Error("Bedrock credentials are not configured (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/AWS_REGION).")
  }

  const service = "bedrock"
  const host = `bedrock-runtime.${region}.amazonaws.com`
  const path = `/model/${encodeURIComponent(ENFORCED_BEDROCK_MODEL)}/invoke`
  const endpoint = `https://${host}${path}`
  const body = JSON.stringify(toBedrockPayload(messages, temperature))

  const now = new Date()
  const amzDate = iso8601Basic(now)
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = hashSha256(body)

  const signedHeaderKeys = ["content-type", "host", "x-amz-date"]
  const canonicalHeaders: Array<[string, string]> = [
    ["content-type", "application/json"],
    ["host", host],
    ["x-amz-date", amzDate],
  ]

  if (sessionToken) {
    signedHeaderKeys.push("x-amz-security-token")
    canonicalHeaders.push(["x-amz-security-token", sessionToken])
  }

  const canonicalHeadersString = canonicalHeaders
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}\n`)
    .join("")

  const signedHeaders = signedHeaderKeys.sort().join(";")
  const canonicalRequest = [
    "POST",
    path,
    "",
    canonicalHeadersString,
    signedHeaders,
    payloadHash,
  ].join("\n")

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest),
  ].join("\n")

  const signingKey = buildAwsSignatureKey(secretAccessKey, dateStamp, region, service)
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex")

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Amz-Date": amzDate,
        ...(sessionToken ? { "X-Amz-Security-Token": sessionToken } : {}),
        Authorization: authorization,
      },
      body,
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Bedrock request failed: ${response.status} ${text}`)
    }

    const payload = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>
      output_text?: string
    }

    const fromContent =
      payload.content?.find((entry) => entry?.type === "text" && typeof entry?.text === "string")?.text || ""

    return (fromContent || payload.output_text || "").trim()
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function generateText(messages: ChatMessage[], temperature = 0.1): Promise<string> {
  const provider = resolveProvider()
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      let result = ""

      if (provider === "bedrock") {
        try {
          result = await callBedrock(messages, temperature)
        } catch (bedrockError) {
          const openRouterResult = await callOpenRouter(messages, temperature)
          if (!openRouterResult) {
            throw bedrockError
          }
          result = openRouterResult
        }
      } else {
        result = await callOpenRouter(messages, temperature)
      }

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
