export const BUYER_QUERIES_SYSTEM_PROMPT =
  "Return exactly 12 realistic buyer queries as a JSON array of strings. No markdown fences and no commentary."

export function buildBuyerQueriesUserPrompt(category: string) {
  return `Generate realistic queries buyers ask AI assistants when researching ${category} software. Return exactly 12 queries.`
}
