type TemplateShape = {
  slugPattern: string
  name: string
}

type CollectionTextOptions = {
  platformToken?: string
}

function cleanPlaceholderToken(raw: string) {
  return raw.replace(/[{}]/g, "").trim()
}

function titleCase(input: string) {
  const upperTokens = new Set(["ai", "seo", "aeo", "cms", "b2b", "chatgpt"])

  return input
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => {
      const normalized = part.toLowerCase()
      if (upperTokens.has(normalized)) {
        return normalized.toUpperCase()
      }

      return normalized.charAt(0).toUpperCase() + normalized.slice(1)
    })
    .join(" ")
}

function toActionPhraseFromSlug(slug: string) {
  return slug.replace(/-/g, " ").trim().toLowerCase()
}

function toPlatformLabel(token: string) {
  const normalized = token.trim().toLowerCase()

  if (normalized.length <= 4) {
    return normalized.toUpperCase()
  }

  return titleCase(normalized)
}

function resolvePlatformToken(template: TemplateShape, options?: CollectionTextOptions) {
  if (options?.platformToken) {
    return options.platformToken
  }

  const placeholderMatch = template.slugPattern.match(/\{([^}]+)\}/)
  return placeholderMatch ? cleanPlaceholderToken(placeholderMatch[1]) : "platform"
}

export function getCollectionSlugFromPattern(slugPattern: string) {
  return slugPattern
    .replace(/\{[^}]+\}/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getCollectionSlugSuffix(token: string) {
  const normalized = token.trim().toLowerCase().replace(/_/g, "-")

  if (normalized === "business-category" || normalized === "business-categorys" || normalized === "business-categories") {
    return "business-categories"
  }

  return ""
}

export function getCollectionSlug(template: TemplateShape, options?: CollectionTextOptions) {
  const base = getCollectionSlugFromPattern(template.slugPattern)
  const token = resolvePlatformToken(template, options)
  const suffix = getCollectionSlugSuffix(token)

  return suffix ? `${base}-${suffix}` : base
}

export function getCollectionTitle(template: TemplateShape, options?: CollectionTextOptions) {
  const base = getCollectionSlugFromPattern(template.slugPattern)
  const readableBase = titleCase(base)
  const token = resolvePlatformToken(template, options)
  const tokenLabel = toPlatformLabel(token)
  const normalizedBase = readableBase.toLowerCase()

  if (normalizedBase.endsWith(" for")) {
    return `${readableBase} ${tokenLabel} Platforms`
  }

  return `${readableBase} on ${tokenLabel} Platforms`
}

export function getCollectionDescription(
  template: TemplateShape,
  totalGuides: number,
  options?: CollectionTextOptions,
) {
  return getCollectionIntro(template, totalGuides, options)
}

function trimToMaxChars(input: string, maxChars: number) {
  const normalized = input.replace(/\s+/g, " ").trim()
  if (normalized.length <= maxChars) {
    return normalized
  }

  const cutoff = normalized.slice(0, maxChars)
  const lastSpace = cutoff.lastIndexOf(" ")
  const safeCutoff = lastSpace > 0 ? cutoff.slice(0, lastSpace) : cutoff

  return `${safeCutoff.trimEnd()}...`
}

export function getCollectionCardSummary(
  template: TemplateShape,
  totalGuides: number,
  options?: CollectionTextOptions,
) {
  const token = resolvePlatformToken(template, options)
  const tokenLabel = toPlatformLabel(token)
  const topicPhrase = toActionPhraseFromSlug(getCollectionSlugFromPattern(template.slugPattern))
  const guideLabel = totalGuides === 1 ? "guide" : "guides"

  return trimToMaxChars(
    `Learn how to ${topicPhrase} across ${tokenLabel} platforms with practical, platform-specific guidance. This collection currently includes ${totalGuides} published ${guideLabel}.`,
    200,
  )
}

export function getCollectionIntro(
  template: TemplateShape,
  totalGuides: number,
  options?: CollectionTextOptions,
) {
  const token = resolvePlatformToken(template, options)
  const tokenLabel = toPlatformLabel(token)
  const topicPhrase = toActionPhraseFromSlug(getCollectionSlugFromPattern(template.slugPattern))
  const guideLabel = totalGuides === 1 ? "guide" : "guides"

  return `Understanding how AI systems interact with your website is becoming essential for modern marketing and analytics teams.

This collection explores how to ${topicPhrase} across different ${tokenLabel} platforms. Each guide explains how AI assistants access website content, how their requests appear in analytics tools and server logs, and how teams can identify when AI systems interact with their sites.

Use these guides to compare behavior across platforms and understand how AI traffic appears in different environments. As new platforms are added to this guide series, they automatically appear here so the collection stays current over time. This collection currently includes ${totalGuides} published ${guideLabel}.`
}
