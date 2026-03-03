export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  author: string
  role: string
  publishedAt: string
  readTime: string
  tags: string[]
  coverImage: string
  content: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-visibility-playbook-for-b2b",
    title: "The AI Visibility Playbook for B2B Teams",
    excerpt:
      "How revenue teams can measure and improve brand presence inside LLM answers and AI buying journeys.",
    author: "Maya Carter",
    role: "VP Marketing",
    publishedAt: "2026-02-08",
    readTime: "7 min read",
    tags: ["AI Visibility", "B2B", "Positioning"],
    coverImage: "/images/blog-ai-visibility.svg",
    content: [
      "AI buying journeys are now a top-of-funnel channel. Prospects ask LLMs for vendor shortlists, feature comparisons, and implementation advice before they ever land on your website.",
      "Readable helps you monitor how models describe your product category, where your brand appears, and which competitor narratives are winning in AI answers.",
      "The highest-performing teams treat AI visibility like pipeline infrastructure: define baseline coverage, track weekly shifts, prioritize pages that influence answers, and connect improvements back to opportunities.",
      "Start with one category page, one comparison page, and one proof page. Then iterate with structured metadata, FAQ patterns, and clear value language so AI systems can retrieve your positioning correctly.",
    ],
  },
  {
    slug: "agent-analytics-explained",
    title: "Agent Analytics Explained: From Bot Logs to Revenue Insights",
    excerpt:
      "A practical framework for turning AI agent visits into clear business signals for marketing and product teams.",
    author: "Ethan Brooks",
    role: "Head of Demand Gen",
    publishedAt: "2026-01-27",
    readTime: "6 min read",
    tags: ["Agent Analytics", "Attribution", "Pipeline"],
    coverImage: "/images/blog-agent-analytics.svg",
    content: [
      "Most analytics stacks treat agent traffic as noise. That means high-intent AI referrals are invisible in normal dashboards.",
      "Readable identifies known agent signatures, maps source patterns, and categorizes sessions by intent type so teams can separate exploration from evaluation behavior.",
      "When you tie agent-originated journeys to conversion milestones, you can answer strategic questions: which pages influence AI recommendations, which segments are underrepresented, and where handoff drops happen.",
      "The result is clearer prioritization across content, product messaging, and lifecycle workflows.",
    ],
  },
  {
    slug: "building-agent-ready-pages",
    title: "Building Agent-Ready Pages That Convert",
    excerpt:
      "Design principles for pages that help AI systems understand your product and guide buyers to action.",
    author: "Sonia Patel",
    role: "Director of Digital",
    publishedAt: "2025-12-18",
    readTime: "8 min read",
    tags: ["Agent-Ready Pages", "Conversion", "Content Design"],
    coverImage: "/images/blog-agent-ready-pages.svg",
    content: [
      "Agent-ready pages are not long SEO documents. They are structured decision assets built for retrieval and human clarity.",
      "Each page should answer three questions quickly: what problem this solves, who it is for, and what proof supports the claim.",
      "Use semantic headings, concise capability blocks, implementation details, and explicit comparison language so model output remains accurate across prompts.",
      "Finally, add conversion paths that work for both human readers and assistant-mediated workflows: demos, product docs, and case studies with clear outcomes.",
    ],
  },
  {
    slug: "ai-positioning-metrics-that-matter",
    title: "AI Positioning Metrics That Actually Matter",
    excerpt:
      "Move beyond vanity mentions and track the signals that correlate with pipeline and closed-won velocity.",
    author: "Lena Ortiz",
    role: "Product Marketing Lead",
    publishedAt: "2025-11-06",
    readTime: "5 min read",
    tags: ["Metrics", "Positioning", "Revenue"],
    coverImage: "/images/blog-positioning-metrics.svg",
    content: [
      "Count of mentions is useful but incomplete. Winning teams measure position quality, recommendation confidence, and scenario-level consistency.",
      "Readable reports whether your brand appears as a primary recommendation, a secondary option, or not at all for target prompts.",
      "Pair these metrics with downstream behavior to identify the pages and narratives that influence revenue outcomes.",
    ],
  },
  {
    slug: "agency-blueprint-for-ai-services",
    title: "Agency Blueprint: Packaging AI Visibility as a Service",
    excerpt:
      "How agencies can operationalize AI visibility deliverables across multiple clients with repeatable workflows.",
    author: "Jordan Lee",
    role: "Partner Success",
    publishedAt: "2025-10-22",
    readTime: "7 min read",
    tags: ["Agencies", "Partnerships", "Delivery"],
    coverImage: "/images/blog-agency-blueprint.svg",
    content: [
      "Agencies are adding AI visibility audits, agent analytics reporting, and structured page programs to retain strategic relevance.",
      "Readable supports multi-client rollups, branded reports, and partner workflows that reduce analyst hours while improving consistency.",
      "A strong offer combines baseline benchmarking, monthly opportunity reports, and implementation guidance tied to business outcomes.",
    ],
  },
  {
    slug: "from-seo-to-ai-go-to-market",
    title: "From SEO to AI Go-to-Market: Evolving Your Content Stack",
    excerpt:
      "A migration path for teams who want to keep SEO performance while expanding into AI-mediated discovery.",
    author: "Ravi Menon",
    role: "Growth Strategy",
    publishedAt: "2025-09-30",
    readTime: "6 min read",
    tags: ["Go-to-Market", "SEO", "AI Discovery"],
    coverImage: "/images/blog-seo-to-ai.svg",
    content: [
      "SEO remains foundational, but AI interfaces have added new retrieval and synthesis layers to buyer research.",
      "The fastest path is extension, not replacement: preserve high-performing search assets, then add model-readable proof structures and prompt-aligned narratives.",
      "Readable gives teams shared visibility into ranking-like behavior for AI answers, helping content and product marketing align around one roadmap.",
    ],
  },
]
