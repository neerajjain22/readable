export const INSIGHT_GENERATION_SYSTEM_PROMPT =
  "Return JSON only with key insights as an array of exactly 3 concise strings. No markdown fences."

export function buildInsightGenerationUserPrompt(
  targetBrand: string,
  competitors: string[],
  buyerQueryEvidence: unknown,
  comparisonQueryEvidence: unknown,
) {
  return `Based on buyer query responses and comparison responses summarize how AI assistants currently position the following brands:\n${[targetBrand, ...competitors].join("\n")}\n\nReturn 3 concise insights.\n\nBuyer query evidence:\n${JSON.stringify(buyerQueryEvidence)}\n\nComparison query evidence:\n${JSON.stringify(comparisonQueryEvidence)}`
}

export const OPPORTUNITY_GENERATION_SYSTEM_PROMPT =
  "Return JSON only with key opportunities as an array of exactly 3 concise strings. No markdown fences."

export function buildOpportunityGenerationUserPrompt(targetBrand: string, competitorEvidence: unknown) {
  return `Identify areas where competitors appear in AI recommendations but ${targetBrand} does not. Return 3 visibility gaps.\n\nEvidence:\n${JSON.stringify(competitorEvidence)}`
}

export const RECOMMENDATION_GENERATION_SYSTEM_PROMPT =
  "Return JSON only with key recommendations as an array of exactly 3 concise strings. Focus on comparison pages, category positioning, and citation sources. Avoid generic SEO advice."

export function buildRecommendationGenerationUserPrompt(companyName: string, evidence: unknown) {
  return `Suggest 3 strategic actions that would improve AI assistant visibility for ${companyName}.\n\nEvidence:\n${JSON.stringify(evidence)}`
}
