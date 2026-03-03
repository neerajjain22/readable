export type FAQItem = {
  question: string
  answer: string
  category: "Platform" | "Pricing" | "Implementation" | "Partners"
}

export const faqItems: FAQItem[] = [
  {
    category: "Platform",
    question: "What AI systems does Readable monitor?",
    answer:
      "Readable tracks major LLM-driven discovery surfaces and known AI agent traffic patterns so teams can see how their brand appears in real buyer research workflows.",
  },
  {
    category: "Platform",
    question: "What is AI Visibility?",
    answer:
      "AI Visibility measures how often and how accurately your brand is recommended in model-generated answers for important category and solution prompts.",
  },
  {
    category: "Platform",
    question: "What are Agent-Ready Pages?",
    answer:
      "Agent-Ready Pages are structured web pages designed for both humans and AI retrieval systems, improving understanding, citation quality, and conversion flow.",
  },
  {
    category: "Pricing",
    question: "Do you offer annual pricing?",
    answer:
      "Yes. Professional and Enterprise plans support annual contracts. Contact sales for volume pricing and partner terms.",
  },
  {
    category: "Implementation",
    question: "How long does implementation take?",
    answer:
      "Most teams launch their first dashboards in less than two weeks. Full program rollout usually takes 4-6 weeks depending on content scope.",
  },
  {
    category: "Implementation",
    question: "Do I need engineering support?",
    answer:
      "Core onboarding can be led by marketing and growth teams. Engineering is optional for advanced instrumentation and custom integrations.",
  },
  {
    category: "Partners",
    question: "Do you support agencies managing multiple clients?",
    answer:
      "Yes. The Agency Partner experience includes multi-client workspaces, white-label exports, and role-based collaboration.",
  },
  {
    category: "Partners",
    question: "Is there a referral program?",
    answer:
      "Readable offers referral and co-delivery models for qualified partners. Apply on the Partner page to review fit and terms.",
  },
]
