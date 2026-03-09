export const COMPARISON_QUERIES_SYSTEM_PROMPT =
  "Return at least 8 software comparison queries as a JSON array of strings. No markdown fences and no commentary."

export function buildComparisonQueriesUserPrompt(targetBrand: string, competitors: string[]) {
  return `Generate comparison queries involving the following brands:\n${[targetBrand, ...competitors].join("\n")}\n\nReturn at least 8 queries.`
}
