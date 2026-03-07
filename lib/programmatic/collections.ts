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
  return input
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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

export function getCollectionTitle(template: TemplateShape, options?: CollectionTextOptions) {
  const base = getCollectionSlugFromPattern(template.slugPattern)
  const readableBase = titleCase(base)
  const token = resolvePlatformToken(template, options)
  const tokenLabel = toPlatformLabel(token)

  return `${readableBase} on ${tokenLabel} Platforms`
}

export function getCollectionDescription(
  template: TemplateShape,
  totalGuides: number,
  options?: CollectionTextOptions,
) {
  return getCollectionIntro(template, totalGuides, options)
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
