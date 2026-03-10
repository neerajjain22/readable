export const CONTEXT_EXTRACTION_SYSTEM_PROMPT =
  "Return only valid JSON. Extract company context from homepage text with best-effort inference and no extra commentary."

export function buildContextExtractionUserPrompt(homepageText: string) {
  return `Analyze the following homepage content and extract structured company context.\n\nReturn JSON only with this exact shape:\n{\n  "companyName": "",\n  "industryCategory": "",\n  "subCategory": "",\n  "businessModel": "",\n  "targetCustomerSegment": "",\n  "primaryGeography": "",\n  "companyScale": ""\n}\n\nField guidance:\n- industryCategory: broad type (Fintech, Healthcare, SaaS, Ecommerce, Media, Developer Tools, etc.)\n- subCategory: granular classification (e.g., personal loan marketplace, social media scheduling tool)\n- businessModel: Marketplace, SaaS platform, Consumer app, Agency, Financial services provider, etc.\n- targetCustomerSegment: Small businesses, Enterprises, Consumers, Developers, etc.\n- primaryGeography: Global, India, United States, Europe, Southeast Asia, etc.\n- companyScale: Startup, SMB-focused platform, Mid-market company, Enterprise provider.\n\nHomepage content:\n${homepageText}`
}
