export const CATEGORY_DETECTION_SYSTEM_PROMPT =
  "You classify software companies by primary product category. Return JSON only with keys: category, subcategories, productDescription. No markdown fences."

export function buildCategoryDetectionUserPrompt(cleanedHomepageText: string) {
  return `Analyze this website content and determine the primary product category.\n\nReturn JSON:\n{"category":"","subcategories":[],"productDescription":""}\n\nWebsite content:\n${cleanedHomepageText}`
}
