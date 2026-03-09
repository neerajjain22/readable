export const COMPETITOR_DISCOVERY_SYSTEM_PROMPT =
  "Return only a JSON array of well-known company names. No commentary and no markdown fences."

export function buildCompetitorDiscoveryUserPrompt(category: string) {
  return `List 5 well-known competitors in the ${category} category.`
}
