import matter from "gray-matter"

export type PerceptionScore = {
  name: string
  score: number
}

export type HeadToHeadParam = {
  parameter: string
  input_score: number
  competitor_score: number
}

export type HeadToHeadCompetitor = {
  name: string
  params: HeadToHeadParam[]
}

export type HeadToHeadSummary = {
  input_company: string
  competitors: HeadToHeadCompetitor[]
}

export type PerceptionBlogMeta = {
  meta_description: string
  target_keyword: string
  secondary_keywords: string[]
  key_findings: string[]
  faq: Array<{ question: string; answer: string }>
  company_name: string
  company_website: string
  industry: string
  competitors: string[]
  sonic_task_id: string
  perception_scores: PerceptionScore[]
  head_to_head_summary: HeadToHeadSummary | null
}

const EMPTY_META: PerceptionBlogMeta = {
  meta_description: "",
  target_keyword: "",
  secondary_keywords: [],
  key_findings: [],
  faq: [],
  company_name: "",
  company_website: "",
  industry: "",
  competitors: [],
  sonic_task_id: "",
  perception_scores: [],
  head_to_head_summary: null,
}

export function parsePerceptionFrontmatter(content: string): {
  metadata: PerceptionBlogMeta
  markdown: string
} {
  try {
    const { data, content: markdown } = matter(content)
    return {
      metadata: {
        meta_description: data.meta_description || "",
        target_keyword: data.target_keyword || "",
        secondary_keywords: data.secondary_keywords || [],
        key_findings: data.key_findings || [],
        faq: data.faq || [],
        company_name: data.company_name || "",
        company_website: data.company_website || "",
        industry: data.industry || "",
        competitors: data.competitors || [],
        sonic_task_id: data.sonic_task_id || "",
        perception_scores: data.perception_scores || [],
        head_to_head_summary: data.head_to_head_summary || null,
      },
      markdown,
    }
  } catch {
    return { metadata: { ...EMPTY_META }, markdown: content }
  }
}

export function buildPerceptionContent(
  metadata: Omit<PerceptionBlogMeta, "faq"> & {
    faq: Array<{ question: string; answer: string }>
  },
  body: string,
): string {
  return matter.stringify(body, metadata)
}
