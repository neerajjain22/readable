import { prisma } from "../prisma.ts"

type KeywordTarget = {
  keyword: string
  target: {
    slug: string
  }
}

type InjectOptions = {
  excludeSlug?: string
  maxLinks?: number
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function permutations(tokens: string[]): string[][] {
  if (tokens.length <= 1) {
    return [tokens]
  }

  const result: string[][] = []
  const used = new Array(tokens.length).fill(false)
  const current: string[] = []

  const backtrack = () => {
    if (current.length === tokens.length) {
      result.push([...current])
      return
    }

    for (let index = 0; index < tokens.length; index += 1) {
      if (used[index]) {
        continue
      }
      used[index] = true
      current.push(tokens[index])
      backtrack()
      current.pop()
      used[index] = false
    }
  }

  backtrack()
  return result
}

function buildAnyOrderRegex(keyword: string) {
  const tokens = keyword
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)

  if (tokens.length === 0) {
    return null
  }

  const orderedPatterns = permutations(tokens).map((ordered) => {
    const parts = ordered.map((token) => `\\b${escapeRegExp(token)}\\b`)
    return parts.join("[\\s\\S]{0,80}?")
  })

  return new RegExp(`(${orderedPatterns.join("|")})`, "i")
}

function splitByCodeBlocks(content: string) {
  const segments: Array<{ text: string; protected: boolean }> = []
  let cursor = 0
  const codeFenceRegex = /```[\s\S]*?```/g

  let match = codeFenceRegex.exec(content)
  while (match) {
    const start = match.index
    const end = start + match[0].length
    if (start > cursor) {
      segments.push({ text: content.slice(cursor, start), protected: false })
    }
    segments.push({ text: content.slice(start, end), protected: true })
    cursor = end
    match = codeFenceRegex.exec(content)
  }

  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), protected: false })
  }

  return segments
}

function replaceKeywordOnce(line: string, keyword: string, slug: string) {
  const linkRegex = /\[[^\]]+\]\([^)]+\)/g
  const urlRegex = /https?:\/\/\S+/g
  const protectedRanges: Array<{ start: number; end: number }> = []

  let linkMatch = linkRegex.exec(line)
  while (linkMatch) {
    protectedRanges.push({
      start: linkMatch.index,
      end: linkMatch.index + linkMatch[0].length,
    })
    linkMatch = linkRegex.exec(line)
  }

  let urlMatch = urlRegex.exec(line)
  while (urlMatch) {
    protectedRanges.push({
      start: urlMatch.index,
      end: urlMatch.index + urlMatch[0].length,
    })
    urlMatch = urlRegex.exec(line)
  }

  const keywordRegex = buildAnyOrderRegex(keyword)
  if (!keywordRegex) {
    return { line, changed: false }
  }

  const match = keywordRegex.exec(line)
  if (!match || match.index === undefined) {
    return { line, changed: false }
  }

  const start = match.index
  const end = start + match[0].length
  const intersectsProtected = protectedRanges.some((range) => start < range.end && end > range.start)
  if (intersectsProtected) {
    return { line, changed: false }
  }

  const href = slug.includes("/") ? `/${slug}` : `/guides/${slug}`
  const replacement = `[${match[0]}](${href})`
  const updated = `${line.slice(0, start)}${replacement}${line.slice(end)}`
  return { line: updated, changed: true }
}

export async function injectInternalLinks(content: string, options?: InjectOptions) {
  const maxLinks = options?.maxLinks ?? 6
  if (maxLinks <= 0) {
    return content
  }

  const keywordRows = (await prisma.internalLinkKeyword.findMany({
    include: { target: true },
  })) as KeywordTarget[]

  const candidates = keywordRows
    .filter((row) => row.target.slug !== options?.excludeSlug)
    .sort((a, b) => b.keyword.length - a.keyword.length)

  if (candidates.length === 0) {
    return content
  }

  const usedKeywords = new Set<string>()
  let inserted = 0
  const segments = splitByCodeBlocks(content)

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    if (inserted >= maxLinks) {
      break
    }

    const segment = segments[segmentIndex]
    if (segment.protected) {
      continue
    }

    const lines = segment.text.split("\n")

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      if (inserted >= maxLinks) {
        break
      }

      const line = lines[lineIndex]
      if (line.trim().startsWith("#")) {
        continue
      }

      for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
        if (inserted >= maxLinks) {
          break
        }

        const candidate = candidates[candidateIndex]
        const key = candidate.keyword.toLowerCase()
        if (usedKeywords.has(key)) {
          continue
        }

        const replaced = replaceKeywordOnce(lines[lineIndex], candidate.keyword, candidate.target.slug)
        if (!replaced.changed) {
          continue
        }

        lines[lineIndex] = replaced.line
        usedKeywords.add(key)
        inserted += 1
        break
      }
    }

    segments[segmentIndex] = {
      ...segment,
      text: lines.join("\n"),
    }
  }

  return segments.map((segment) => segment.text).join("")
}
