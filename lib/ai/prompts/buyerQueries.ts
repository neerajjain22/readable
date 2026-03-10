export const BUYER_QUERIES_SYSTEM_PROMPT =
  "Return exactly 12 realistic buyer queries as a JSON array of strings. No markdown fences and no commentary."

export function buildBuyerQueriesUserPrompt(input: {
  category: string
  subCategory: string
  businessModel: string
  targetCustomerSegment: string
  primaryGeography: string
}) {
  return `Generate realistic buyer queries for this context:\n- category: ${input.category}\n- subCategory: ${input.subCategory}\n- businessModel: ${input.businessModel}\n- targetCustomerSegment: ${input.targetCustomerSegment}\n- primaryGeography: ${input.primaryGeography}\n\nRules:\n- Match target customer segment, geography, and product category\n- Avoid unrelated categories\n- Keep them natural and specific to buyer intent\n\nReturn exactly 12 queries as a JSON array of strings.`
}
