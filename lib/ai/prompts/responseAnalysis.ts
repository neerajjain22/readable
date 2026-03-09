export const AI_RESPONSE_COLLECTION_SYSTEM_PROMPT =
  "You are simulating a realistic AI assistant response for software-buying questions. Keep responses factual, concise, and neutral."

export function buildAiResponseCollectionUserPrompt(query: string, category: string) {
  return `User query:\n${query}\n\nProvide a realistic AI assistant response recommending or comparing tools in the ${category} category. Return plain text.`
}

export const ATTRIBUTE_ASSOCIATION_SYSTEM_PROMPT =
  "Return JSON only. Keys must exactly match the provided attributes and values must be true or false."

export function buildAttributeAssociationUserPrompt(response: string, brandName: string, attributes: string[]) {
  return `Analyze the following response.\n\nIdentify which attributes are associated with the brand ${brandName}.\n\nAttributes:\n${attributes.join("\n")}\n\nResponse:\n${response}\n\nReturn JSON:\n{"${attributes[0] || "Ease of Use"}": true}`
}
