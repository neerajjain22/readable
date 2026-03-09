const SECOND_LEVEL_TLDS = new Set(["co.uk", "org.uk", "gov.uk", "ac.uk", "co.in", "com.au", "co.jp"])

export type NormalizedDomainResult = {
  domain: string
  companySlug: string
}

function ensureUrl(raw: string): URL {
  const value = raw.trim()
  if (!value) {
    throw new Error("A domain is required")
  }

  try {
    return new URL(value.includes("://") ? value : `https://${value}`)
  } catch {
    throw new Error("Invalid domain")
  }
}

export function extractRootDomain(hostname: string): string {
  const normalized = hostname.trim().toLowerCase().replace(/^www\./, "")
  const parts = normalized.split(".").filter(Boolean)

  if (parts.length < 2) {
    throw new Error("Invalid domain")
  }

  const lastTwo = parts.slice(-2).join(".")

  if (parts.length >= 3 && SECOND_LEVEL_TLDS.has(lastTwo)) {
    return parts.slice(-3).join(".")
  }

  return parts.slice(-2).join(".")
}

export function deriveCompanySlug(rootDomain: string): string {
  const normalized = rootDomain.trim().toLowerCase()
  const parts = normalized.split(".").filter(Boolean)

  if (parts.length < 2) {
    throw new Error("Unable to derive company slug")
  }

  const [baseLabel, ...tldParts] = parts
  const tldLabel = tldParts.join("-")
  const slug = `${baseLabel}-${tldLabel}`

  return slug.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

export function normalizeDomain(input: string): NormalizedDomainResult {
  const parsed = ensureUrl(input)
  const domain = extractRootDomain(parsed.hostname)
  const companySlug = deriveCompanySlug(domain)

  if (!companySlug) {
    throw new Error("Unable to derive company slug")
  }

  return { domain, companySlug }
}

export function toDisplayCompanyName(companySlug: string): string {
  return companySlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function toQuerySlug(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function toBrandSlug(brandName: string): string {
  return toQuerySlug(brandName)
}
