export const TOP_AI_QUESTIONS_SYSTEM_PROMPT =
  "Return JSON only. Generate exactly 5 realistic buyer-style AI chat questions as an array of strings. No markdown."

export function buildTopAiQuestionsUserPrompt(input: {
  entityName: string
  guideTopic: string
  specificNouns?: string[]
}) {
  const nounHint =
    input.specificNouns && input.specificNouns.length > 0
      ? input.specificNouns.join(", ")
      : "None provided"

  return `Generate top questions users ask AI assistants about this entity.

Entity: ${input.entityName}
Guide topic: ${input.guideTopic}
Specific noun hints: ${nounHint}

Requirements:
- Exactly 5 questions
- Natural buyer phrasing used in AI chat tools
- Keep each question concise (roughly 6-14 words)
- No marketing language or sales claims
- Avoid duplicate phrasing patterns
- Keep the questions tightly relevant to ${input.entityName}
- Include at least one comparison-style question when reasonable

Output JSON only:
{"questions":["", "", "", "", ""]}`
}
