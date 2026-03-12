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
  return `List 5 competitors for ${input.companyName}.\n\nRules:\n1. Same subCategory (${input.subCategory})\n2. Similar business model (${input.businessModel})\n3. Similar target customer segment (${input.targetCustomerSegment})\n4. Similar geography when possible (${input.primaryGeography})\n5. Similar company scale (${input.companyScale})\n\nCanonical naming rules (strict):\n- Use one canonical brand name per company.\n- Do NOT include aliases/variants for the same company in the same output.\n- If both a short name and a long legal/product variant exist, keep only the most widely recognized canonical name.\n- Example: choose either \"Kaya\" or \"Kaya Skin Clinic\", never both.\n\nHard exclusions:\n- Do NOT include pronouns/placeholders: \"you\", \"i\", \"we\", \"they\", \"our\", \"your\", \"their\", \"it\", \"them\"\n- Do NOT include contextual filler words: \"here\", \"there\", \"this\", \"that\", \"these\", \"those\"\n- Do NOT include generic non-brand terms: \"company\", \"platform\", \"product\", \"service\", \"solution\"\n- Do NOT include geography labels/demonyms/cities as competitors (examples: \"India\", \"Indian\", \"Indians\", \"Bengaluru\", \"Mumbai\", \"US\", \"Europe\").\n- Do NOT include category nouns or generic market words as competitors (examples: \"Cosmetics\", \"Skincare\", \"Marketplace\", \"Retail\", \"Software\").\n- Do NOT include category-mismatched giants and unrelated institutions.\n\nCore category: ${input.category}\n\nReturn exactly a JSON array of 5 company names ranked by similarity.`
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
  return `Validate candidate competitors for ${input.targetCompany}.\n\nTarget context:\n- category: ${input.category}\n- subCategory: ${input.subCategory}\n- businessModel: ${input.businessModel}\n- targetCustomerSegment: ${input.targetCustomerSegment}\n- primaryGeography: ${input.primaryGeography}\n- companyScale: ${input.companyScale}\n\nCandidates:\n${input.competitors.join("\n")}\n\nReject candidates that are:\n- pronouns/placeholders (\"you\", \"i\", \"we\", \"they\", \"our\", \"your\", \"their\", \"it\", \"them\")\n- contextual filler words (\"here\", \"there\", \"this\", \"that\", \"these\", \"those\")\n- generic non-brand terms (\"company\", \"platform\", \"product\", \"service\", \"solution\")\n- geography labels/demonyms/cities (examples: \"India\", \"Indian\", \"Indians\", \"Bengaluru\", \"Mumbai\", \"US\", \"Europe\")\n- category nouns or generic market words (examples: \"Cosmetics\", \"Skincare\", \"Marketplace\", \"Retail\", \"Software\")\n- in a completely different category\n- unrelated business model\n- global enterprise bank vs local fintech app mismatch\n- aliases/variants of another candidate (keep only one canonical name per company)\n\nCanonicalization rule:\n- If two names refer to the same company, keep only one canonical name.\n- Example: keep either \"Kaya\" or \"Kaya Skin Clinic\", not both.\n\nReturn JSON only:\n{\n  "validCompetitors": [],\n  "rejectedCompetitors": [],\n  "reasoningSummary": \"\"\n}`
}
