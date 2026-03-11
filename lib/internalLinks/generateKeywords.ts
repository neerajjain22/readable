import { generateText } from "../services/llm"

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

  const raw = await generateText(
    [
      { role: "system", content: "You generate internal linking anchor phrases for SEO." },
      { role: "user", content: prompt },
    ],
    { model: "haiku", temperature: 0.3 }
  )

  const parsed = parseKeywordArray(raw)
  return normalizeKeywords(parsed)
}
