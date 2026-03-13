export type ProgrammaticEntity = {
  name: string
  slug: string
  metadata?: Record<string, unknown> | null
}

function getPreferredLabel(entity: ProgrammaticEntity) {
  const value = entity.metadata?.preferredLabel
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }

  return entity.name
}

function replaceTokens(input: string, entity: ProgrammaticEntity): string {
  const metadata = entity.metadata ?? {}
  const preferredLabel = getPreferredLabel(entity)

  return input
    .replaceAll("{entity}", preferredLabel)
    .replaceAll("{ENTITY}", preferredLabel)
    .replaceAll("{cms}", preferredLabel)
    .replaceAll("{CMS}", preferredLabel)
    .replaceAll("{name}", preferredLabel)
    .replaceAll("{slug}", entity.slug)
    .replace(/\{meta\.([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
      const value = metadata[key]
      return typeof value === "string" ? value : ""
    })
}

export function generateContent(contentTemplate: string, entity: ProgrammaticEntity): string {
  return replaceTokens(contentTemplate, entity).trim()
}

export function generateTitle(titleTemplate: string, entity: ProgrammaticEntity): string {
  return replaceTokens(titleTemplate, entity).trim()
}
