type EntityInput = {
  name: string
  slug: string
}

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"
const DEFAULT_OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
const REQUEST_TIMEOUT_MS = Number(process.env.LLM_REQUEST_TIMEOUT_MS || 45000)

function resolveProvider() {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase()

  if (provider !== "openai" && provider !== "openrouter") {
    throw new Error("Unsupported LLM_PROVIDER. Use 'openai' or 'openrouter'.")
  }

  return provider
}

function buildPrompt(topic: string, sectionTitle: string, entity: EntityInput) {
  return `You are writing a long-form technical SEO guide.

Topic:
${topic}

Section:
${sectionTitle}

Entity:
${entity.name}

Requirements:

• Write 200–300 words
• Clear explanations
• Mention the entity naturally
• Mention ChatGPT and AI agents
• Avoid marketing language
• Avoid repetition
• Write in clear paragraphs`
}

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI request failed: ${response.status} ${text}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return payload.choices?.[0]?.message?.content?.trim() || ""
}

async function callOpenRouter(prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenRouter request failed: ${response.status} ${text}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return payload.choices?.[0]?.message?.content?.trim() || ""
}

export async function generateSectionContent(topic: string, sectionTitle: string, entity: EntityInput) {
  const prompt = buildPrompt(topic, sectionTitle, entity)
  const provider = resolveProvider()

  const content =
    provider === "openrouter" ? await callOpenRouter(prompt) : await callOpenAI(prompt)

  if (!content) {
    throw new Error("LLM returned empty content")
  }

  return content
}
