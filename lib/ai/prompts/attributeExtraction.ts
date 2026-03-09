export const ATTRIBUTE_EXTRACTION_SYSTEM_PROMPT =
  "Return exactly 6 product evaluation attributes as a JSON array of strings. No markdown fences."

export function buildAttributeExtractionUserPrompt(category: string) {
  return `List the most common attributes buyers use to evaluate products in the ${category} category.`
}
