type PublishedPageEntityLink = {
  slug: string
  entity: {
    name: string
  }
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function addInternalLinks(
  content: string,
  pages: PublishedPageEntityLink[],
  maxLinksPerEntity = 3,
) {
  let updated = content

  for (const page of pages) {
    const name = page.entity?.name?.trim()
    if (!name) {
      continue
    }

    const regex = new RegExp(`\\b${escapeRegExp(name)}\\b`, "g")
    let replacements = 0

    updated = updated.replace(regex, (match) => {
      if (replacements >= maxLinksPerEntity) {
        return match
      }

      replacements += 1
      return `[${match}](/guides/${page.slug})`
    })
  }

  return updated
}

export function extractLevelTwoHeadings(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, "").trim())
    .filter(Boolean)
}

export function headingToAnchor(heading: string) {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export type GuideSection = {
  heading: string
  body: string
}

export function splitGuideSections(content: string): GuideSection[] {
  const rawSections = content.split(/^##\s+/gm).filter(Boolean)

  return rawSections
    .map((raw) => {
      const [headingLine, ...rest] = raw.split("\n")
      return {
        heading: (headingLine || "").trim(),
        body: rest.join("\n").trim(),
      }
    })
    .filter((section) => section.heading.length > 0)
}

export function getSummaryPoints(headings: string[], maxItems = 4) {
  return headings.slice(0, maxItems)
}

export function getFirstParagraph(content: string) {
  const paragraphs = content
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  return paragraphs[0] || ""
}

export type FaqItem = {
  question: string
  answer: string
}

export function parseFaqItems(faqBody: string): FaqItem[] {
  const lines = faqBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const items: FaqItem[] = []
  let currentQuestion = ""
  let currentAnswer: string[] = []

  const flushItem = () => {
    if (currentQuestion && currentAnswer.length > 0) {
      items.push({
        question: currentQuestion,
        answer: currentAnswer.join(" ").trim(),
      })
    }
    currentQuestion = ""
    currentAnswer = []
  }

  for (const line of lines) {
    const normalizedLine = line.replace(/^[-*]\s*/, "")
    const isQuestion = normalizedLine.endsWith("?")

    if (isQuestion) {
      flushItem()
      currentQuestion = normalizedLine
      continue
    }

    if (!currentQuestion) {
      continue
    }

    currentAnswer.push(normalizedLine)
  }

  flushItem()
  return items
}
