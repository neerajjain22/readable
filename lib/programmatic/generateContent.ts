export type ProgrammaticEntity = {
  name: string
  slug: string
  metadata?: Record<string, unknown> | null
}

function replaceTokens(input: string, entity: ProgrammaticEntity): string {
  const metadata = entity.metadata ?? {}

  return input
    .replaceAll("{entity}", entity.name)
    .replaceAll("{ENTITY}", entity.name)
    .replaceAll("{cms}", entity.name)
    .replaceAll("{CMS}", entity.name)
    .replaceAll("{name}", entity.name)
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
