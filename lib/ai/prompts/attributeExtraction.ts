export const ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT =
  "Return exactly 6 product evaluation attributes as a JSON array of strings. No markdown fences."

export function buildAttributeExtractionUserPrompt(category: string) {
  return `List the most common attributes buyers use to evaluate products in the ${category} category.`
}

export const RESPONSE_ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT =
  "Extract product evaluation attributes from AI assistant responses. Return JSON only with key attributes as an array of short phrases (2-4 words). No sentences and no markdown."

export function buildResponseAttributeExtractionUserPrompt(category: string, responses: string[]) {
  return `Analyze the AI assistant responses below for ${category} software and extract the most common product capabilities or buyer evaluation criteria.\n\nRules:\n- Return short phrases (2-4 words)\n- Focus on capabilities or evaluation factors\n- Avoid full sentences\n- Normalize similar phrasing into a single canonical attribute\n\nReturn JSON:\n{"attributes":[]}\n\nResponses:\n${responses.join("\n\n---\n\n")}`
}
