import { generateText } from "./services/llm"

type EntityInput = {
  name: string
  slug: string
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
• Write in clear paragraphs
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
