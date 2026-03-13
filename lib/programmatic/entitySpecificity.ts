type SpecificityMetadata = {
  preferredLabel?: unknown
  specificNouns?: unknown
  avoidGenericNouns?: unknown
}

export type EntitySpecificityInput = {
  name: string
  slug: string
  type?: string | null
  metadata?: unknown
}

export type PartialEntitySpecificity = {
  preferredLabel?: string
  specificNouns?: string[]
  avoidGenericNouns?: string[]
}

export type EntitySpecificityProfile = {
  preferredLabel: string
  specificNouns: string[]
  avoidGenericNouns: string[]
}

const SPECIFICITY_OVERRIDES: Record<string, EntitySpecificityProfile> = {
  lawyers: {
    preferredLabel: "Personal Injury Attorneys",
    specificNouns: [
      "Personal Injury Attorneys",
      "Medical Malpractice Plaintiffs",
      "Workers' Compensation Claimants",
    ],
    avoidGenericNouns: ["lawyers", "clients"],
  },
  "insurance-brokers": {
    preferredLabel: "Independent Insurance Brokers",
    specificNouns: [
      "Independent Insurance Brokers",
      "Commercial Lines Producers",
      "Small Business Policyholders",
    ],
    avoidGenericNouns: ["brokers", "clients"],
  },
  "b2b-saas": {
    preferredLabel: "B2B SaaS Revenue Teams",
    specificNouns: [
      "B2B SaaS Revenue Teams",
      "Demand Generation Managers",
      "Product-Led Growth Operators",
    ],
    avoidGenericNouns: ["businesses", "companies"],
  },
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function normalizePhrase(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  return normalizePhrase(value)
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const items: string[] = []

  for (const entry of value) {
    const normalized = normalizeString(entry)
    if (!normalized) {
      continue
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    items.push(normalized)
  }

  return items
}

function addUnique(target: string[], values: string[]) {
  const seen = new Set(target.map((value) => value.toLowerCase()))

  for (const value of values) {
    const normalized = normalizeString(value)
    if (!normalized) {
      continue
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    target.push(normalized)
    seen.add(key)
  }
}

function toMetadataShape(metadata: unknown): SpecificityMetadata {
  if (!isObject(metadata)) {
    return {}
  }

  return metadata as SpecificityMetadata
}

export function getUserDefinedEntitySpecificity(metadata: unknown): PartialEntitySpecificity {
  const parsed = toMetadataShape(metadata)

  return {
    preferredLabel: normalizeString(parsed.preferredLabel) || undefined,
    specificNouns: normalizeStringArray(parsed.specificNouns),
    avoidGenericNouns: normalizeStringArray(parsed.avoidGenericNouns),
  }
}

function getGenericSpecificNouns(input: EntitySpecificityInput, preferredLabel: string) {
  if ((input.type || "").toLowerCase() === "cms") {
    return [
      `${preferredLabel} Site Owners`,
      `${preferredLabel} Implementation Teams`,
      `${preferredLabel} SEO Managers`,
    ]
  }

  return [
    preferredLabel,
    `${preferredLabel} Buyers`,
    `${preferredLabel} Decision-Makers`,
  ]
}

export function getDeterministicEntitySpecificity(input: EntitySpecificityInput): PartialEntitySpecificity {
  const override = SPECIFICITY_OVERRIDES[input.slug.toLowerCase()]
  if (override) {
    return {
      preferredLabel: override.preferredLabel,
      specificNouns: [...override.specificNouns],
      avoidGenericNouns: [...override.avoidGenericNouns],
    }
  }

  const preferredLabel = normalizeString(input.name) || input.slug.replace(/-/g, " ")

  return {
    preferredLabel,
    specificNouns: getGenericSpecificNouns(input, preferredLabel),
    avoidGenericNouns: ["businesses", "companies"],
  }
}

export function mergeEntitySpecificityProfiles(
  user?: PartialEntitySpecificity | null,
  deterministic?: PartialEntitySpecificity | null,
  llm?: PartialEntitySpecificity | null,
): EntitySpecificityProfile {
  const preferredLabel =
    normalizeString(user?.preferredLabel) ||
    normalizeString(deterministic?.preferredLabel) ||
    normalizeString(llm?.preferredLabel) ||
    "General Teams"

  let specificNouns = normalizeStringArray(user?.specificNouns)
  if (specificNouns.length === 0) {
    specificNouns = normalizeStringArray(deterministic?.specificNouns)
  }
  if (specificNouns.length < 2) {
    const combined = [...specificNouns]
    addUnique(combined, normalizeStringArray(llm?.specificNouns))
    specificNouns = combined
  }
  if (specificNouns.length === 0) {
    specificNouns = [preferredLabel]
  } else {
    addUnique(specificNouns, [preferredLabel])
  }

  let avoidGenericNouns = normalizeStringArray(user?.avoidGenericNouns)
  if (avoidGenericNouns.length === 0) {
    avoidGenericNouns = normalizeStringArray(deterministic?.avoidGenericNouns)
  }
  if (avoidGenericNouns.length === 0) {
    avoidGenericNouns = normalizeStringArray(llm?.avoidGenericNouns)
  }

  return {
    preferredLabel,
    specificNouns,
    avoidGenericNouns,
  }
}

export function buildSpecificityMetadata(
  existingMetadata: unknown,
  profile: EntitySpecificityProfile,
): Record<string, unknown> {
  const base = isObject(existingMetadata) ? { ...existingMetadata } : {}

  return {
    ...base,
    preferredLabel: profile.preferredLabel,
    specificNouns: profile.specificNouns,
    avoidGenericNouns: profile.avoidGenericNouns,
  }
}
