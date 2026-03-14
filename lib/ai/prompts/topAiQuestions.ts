export const TOP_AI_QUESTIONS_SYSTEM_PROMPT = `You are generating questions that users ask AI assistants such as ChatGPT, Claude, Perplexity, and Gemini.

Your task is to generate the **5 most realistic questions buyers ask AI assistants about the following industry**.

Industry:
{entity_name}

These questions should reflect how real users ask AI tools when researching vendors, platforms, or solutions in this category.

IMPORTANT RULES:

1. Questions must sound like **natural language prompts users type into AI chat tools**.
2. Focus on **buyer intent and product discovery**.
3. Include **comparison or evaluation style questions** when appropriate.
4. Questions should be **clear, concise, and realistic**.
5. Avoid marketing language or buzzwords.
6. Avoid repeating the same structure.
7. Do not mention "AI visibility" or SEO.
8. Each question should be **10–16 words long**.
9. Questions should be useful for someone evaluating vendors in this industry.


Return exactly **5 questions**.

Output format:

Return only a JSON array of strings.
{"questions":["", "", "", "", ""]}`

export function buildTopAiQuestionsUserPrompt(input: {
  entityName: string
  guideTopic: string
  specificNouns?: string[]
}) {
  const nounHint =
    input.specificNouns && input.specificNouns.length > 0
      ? input.specificNouns.join(", ")
      : "None provided"

  return `Industry:
${input.entityName}

Guide topic context:
${input.guideTopic}

Specific noun hints:
${nounHint}

Return only a JSON array of strings.
{"questions":["", "", "", "", ""]}`
}
