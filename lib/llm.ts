import { generateText } from "./services/llm.ts"

type EntityInput = {
  name: string
  slug: string
}

function buildPrompt(topic: string, sectionTitle: string, entity: EntityInput) {
  return `You are writing a long-form technical SEO guide in an expert-led voice.

Topic:
${topic}

Section:
${sectionTitle}

Entity:
${entity.name}

Requirements:

• Write 200–300 words
• Use a practical, expert point of view (confident and specific, not generic encyclopedia tone)
• Include at least one concrete scenario or example relevant to ${entity.name}
• Include at least one actionable recommendation a team can implement
• When comparison is relevant, include one compact markdown table (2–4 rows) instead of only prose
• Use short bullet points where helpful to avoid large text walls
• Include one concise "Expert tip:" sentence with a practical implementation nuance
• Where relevant, include natural contextual references (for example: "Read more about...") rather than keyword-stuffed anchor phrasing
• Mention the entity naturally
• Mention ChatGPT and AI agents where relevant
• Avoid marketing hype and broad filler statements
• Avoid repetition across sections
• Write in clear paragraphs with concise transitions
• Avoid generic openers like "In today's digital landscape" or "As technology evolves"
• Do not output raw HTML tags (for example: <main>, <nav>, <article>, <section>, <div>)`
}

export async function generateSectionContent(
  topic: string,
  sectionTitle: string,
  entity: EntityInput
) {
  const prompt = buildPrompt(topic, sectionTitle, entity)
  return generateText([{ role: "user", content: prompt }], { temperature: 0.6 })
}
