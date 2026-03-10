export const COMPARISON_QUERIES_SYSTEM_PROMPT =
  "Return at least 8 software comparison queries as a JSON array of strings. No markdown fences and no commentary."

export function buildComparisonQueriesUserPrompt(input: {
  targetBrand: string
  competitors: string[]
  category: string
  subCategory: string
  primaryGeography: string
  targetCustomerSegment: string
}) {
  return `Generate comparison queries involving these brands:\n${[input.targetBrand, ...input.competitors].join("\n")}\n\nContext:\n- category: ${input.category}\n- subCategory: ${input.subCategory}\n- primaryGeography: ${input.primaryGeography}\n- targetCustomerSegment: ${input.targetCustomerSegment}\n\nRules:\n- Keep comparisons within this category/subCategory only\n- Include the target brand in most queries\n- Avoid unrelated companies outside this context\n\nReturn at least 8 queries as a JSON array of strings.`
}
