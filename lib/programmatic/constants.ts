export const PAGE_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  PUBLISHED: "published",
  REJECTED: "rejected",
} as const

export const CONTENT_TYPE = {
  GUIDE: "guide",
  PERCEPTION: "perception",
} as const

export type PageStatus = (typeof PAGE_STATUS)[keyof typeof PAGE_STATUS]
