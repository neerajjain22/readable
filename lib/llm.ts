import { generateText } from "./services/llm.ts"

type EntityInput = {
  name: string
  slug: string
  metadata?: Record<string, unknown> | null
}

export type EntitySpecificityHints = {
  preferredLabel: string
  specificNouns: string[]
  avoidGenericNouns: string[]
}

function buildPrompt(
  topic: string,
  sectionTitle: string,
  entity: EntityInput,
  specificityHints?: EntitySpecificityHints,
) {
  const specificNounLine =
    specificityHints && specificityHints.specificNouns.length > 0
      ? specificityHints.specificNouns.join(", ")
      : "None provided"
  const avoidGenericLine =
    specificityHints && specificityHints.avoidGenericNouns.length > 0
      ? specificityHints.avoidGenericNouns.join(", ")
      : "None provided"
  const preferredLabel = specificityHints?.preferredLabel || entity.name

  return `You are writing a long-form technical SEO guide in an expert-led voice.

Topic:
${topic}

Section:
${sectionTitle}

Entity:
${entity.name}

Specificity guidance:
- Preferred entity label: ${preferredLabel}
- Specific nouns to use where relevant: ${specificNounLine}
- Generic nouns to avoid when a specific alternative exists: ${avoidGenericLine}

Requirements:

• Write 200–300 words
• Use a practical, expert point of view (confident and specific, not generic encyclopedia tone)
• Include at least one concrete scenario or example relevant to ${entity.name}
• Include at least one actionable recommendation a team can implement
• Include one non-obvious takeaway that goes beyond basic definitions
• Include one decision rule in this form or equivalent: "If X, prioritize Y"
• Include one practical tradeoff or common mistake to avoid
• When comparison is relevant, include one compact markdown table (2–4 rows) instead of only prose
• Use short bullet points where helpful to avoid large text walls
• Include one concise "Expert tip:" sentence with a practical implementation nuance
• Where relevant, include natural contextual references (for example: "Read more about...") rather than keyword-stuffed anchor phrasing
• Mention the entity naturally
• Use concrete, domain-specific nouns (for example, role or audience names) rather than vague labels like "clients" or "businesses"
• Include at least one specific noun from the specificity guidance when relevant to the section
• Mention ChatGPT and AI agents where relevant
• Avoid marketing hype and broad filler statements
• Avoid repetition across sections
• Write in clear paragraphs with concise transitions
• Avoid generic openers like "In today's digital landscape" or "As technology evolves"
• Do not write only definitional restatements; provide implementation-level guidance
• Do not output raw HTML tags (for example: <main>, <nav>, <article>, <section>, <div>)`
}

export async function generateSectionContent(
  topic: string,
  sectionTitle: string,
  entity: EntityInput,
  specificityHints?: EntitySpecificityHints,
) {
  const prompt = buildPrompt(topic, sectionTitle, entity, specificityHints)
  return generateText([{ role: "user", content: prompt }], { temperature: 0.6 })
}
