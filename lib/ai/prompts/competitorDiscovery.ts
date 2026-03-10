export const COMPETITOR_DISCOVERY_SYSTEM_PROMPT =
  "Return only a JSON array of 5 real company/product brand names ranked by contextual similarity. No commentary and no markdown fences."

export function buildCompetitorDiscoveryUserPrompt(input: {
  category: string
  companyName: string
  subCategory: string
  businessModel: string
  targetCustomerSegment: string
  primaryGeography: string
  companyScale: string
}) {
  return `List 5 competitors for ${input.companyName}.\n\nRules:\n1. Same subCategory (${input.subCategory})\n2. Similar business model (${input.businessModel})\n3. Similar target customer segment (${input.targetCustomerSegment})\n4. Similar geography when possible (${input.primaryGeography})\n5. Similar company scale (${input.companyScale})\n\nHard exclusions:\n- Do NOT include pronouns/placeholders: "you", "i", "we", "they", "our", "your", "their", "it", "them"\n- Do NOT include contextual filler words: "here", "there", "this", "that", "these", "those"\n- Do NOT include generic non-brand terms: "company", "platform", "product", "service", "solution"\n- Do NOT include category-mismatched giants and unrelated institutions.\n\nCore category: ${input.category}\n\nReturn exactly a JSON array of 5 company names ranked by similarity.`
}

export const COMPETITOR_VALIDATION_SYSTEM_PROMPT =
  "Return only valid JSON. Evaluate if competitors are contextually valid for the target company."

export function buildCompetitorValidationUserPrompt(input: {
  targetCompany: string
  category: string
  subCategory: string
  businessModel: string
  targetCustomerSegment: string
  primaryGeography: string
  companyScale: string
  competitors: string[]
}) {
  return `Validate candidate competitors for ${input.targetCompany}.\n\nTarget context:\n- category: ${input.category}\n- subCategory: ${input.subCategory}\n- businessModel: ${input.businessModel}\n- targetCustomerSegment: ${input.targetCustomerSegment}\n- primaryGeography: ${input.primaryGeography}\n- companyScale: ${input.companyScale}\n\nCandidates:\n${input.competitors.join("\n")}\n\nReject candidates that are:\n- pronouns/placeholders ("you", "i", "we", "they", "our", "your", "their", "it", "them")\n- contextual filler words ("here", "there", "this", "that", "these", "those")\n- generic non-brand terms ("company", "platform", "product", "service", "solution")\n- in a completely different category\n- unrelated business model\n- global enterprise bank vs local fintech app mismatch.\n\nReturn JSON only:\n{\n  "validCompetitors": [],\n  "rejectedCompetitors": [],\n  "reasoningSummary": \"\"\n}`
}
