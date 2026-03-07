function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateSlug(slugPattern: string, entityName: string, entitySlug?: string): string {
  const normalizedEntity = entitySlug || slugify(entityName)

  return slugPattern
    .replaceAll("{entity}", normalizedEntity)
    .replaceAll("{ENTITY}", normalizedEntity)
    .replaceAll("{cms}", normalizedEntity)
    .replaceAll("{CMS}", normalizedEntity)
}
