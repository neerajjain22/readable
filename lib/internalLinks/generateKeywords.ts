const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_MODEL = process.env.OPENROUTER_KEYWORDS_MODEL || "openai/gpt-4o-mini"

function parseKeywordArray(raw: string): string[] {
  const start = raw.indexOf("[")
  const end = raw.lastIndexOf("]")
  const candidate = start >= 0 && end > start ? raw.slice(start, end + 1) : raw

  try {
    const parsed = JSON.parse(candidate) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
  } catch {
    return raw
      .split("\n")
      .map((line) => line.replace(/^[-*0-9.\s]+/, "").trim())
      .filter(Boolean)
  }
}

function normalizeKeywords(input: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const keyword of input) {
    const cleaned = keyword.replace(/^"+|"+$/g, "").trim()
    if (!cleaned) {
      continue
    }

    const wordCount = cleaned.split(/\s+/).filter(Boolean).length
    if (wordCount === 0 || wordCount > 4) {
      continue
    }

    const key = cleaned.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    result.push(cleaned)
  }

  return result.slice(0, 6)
}

export async function generateKeywordsForArticle(title: string, summary: string): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing")
  }

  const prompt = `Generate 4-6 internal-link anchor phrases for this article.

Title: ${title}
Summary: ${summary}

Rules:
- Return JSON array only.
- 4 to 6 phrases.
- Max 4 words per phrase.
- Use natural anchor text that can appear in articles.
- Avoid generic anchors like "SEO strategy" or "learn more".
- Prefer specific entity-driven phrases.`

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tryreadable.ai",
      "X-Title": "Readable",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You generate internal linking anchor phrases for SEO.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenRouter keyword generation failed: ${response.status} ${text}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const raw = payload.choices?.[0]?.message?.content?.trim() || ""
  const parsed = parseKeywordArray(raw)

  return normalizeKeywords(parsed)
}
