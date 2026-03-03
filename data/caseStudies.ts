export type CaseStudy = {
  slug: string
  company: string
  industry: string
  summary: string
  outcomes: string[]
  challenge: string
  solution: string
  result: string
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "northline",
    company: "Northline",
    industry: "B2B SaaS",
    summary: "Scaled AI-sourced pipeline visibility across 14 product pages.",
    outcomes: ["+38% AI mention share", "+22% demo requests", "3-week implementation"],
    challenge:
      "Northline saw inconsistent positioning in LLM responses and had no way to measure impact from AI-led discovery.",
    solution:
      "Readable mapped prompt clusters, tracked response quality, and rolled out agent-ready page templates for product and comparison content.",
    result:
      "Within one quarter, Northline improved recommendation consistency and increased high-intent demo conversions from AI-originated sessions.",
  },
  {
    slug: "stacklane",
    company: "Stacklane",
    industry: "Developer Tools",
    summary: "Improved technical category visibility with structured proof pages.",
    outcomes: ["+31% high-quality mentions", "-18% narrative drift", "2x faster content updates"],
    challenge:
      "Developer-focused prompts were returning competitor-biased answers due to missing technical differentiators in public content.",
    solution:
      "Readable identified retrieval gaps and guided Stacklane to launch module-level pages with explicit use cases and implementation details.",
    result:
      "Stacklane increased qualified AI referrals and reduced sales cycle friction caused by inaccurate pre-sales assumptions.",
  },
  {
    slug: "ecomera",
    company: "Ecomera",
    industry: "Ecommerce",
    summary: "Unified agency and in-house teams on one AI performance dashboard.",
    outcomes: ["+27% conversion from AI traffic", "100% weekly reporting coverage", "5 brands onboarded"],
    challenge:
      "Ecomera operated multiple brands with fragmented analytics and no standardized AI visibility reporting.",
    solution:
      "Readable partner workspace enabled multi-brand monitoring, white-labeled reporting, and centralized playbooks for optimization.",
    result:
      "Teams aligned on priorities quickly and shipped weekly improvements that directly lifted conversion across brand sites.",
  },
]
