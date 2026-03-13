export type ProgrammaticAuthorProfile = {
  name: string
  linkedinUrl: string
  bio: string
}

export type ProgrammaticAuthorPair = {
  mainAuthor: ProgrammaticAuthorProfile
  coAuthor: ProgrammaticAuthorProfile
}

const PROGRAMMATIC_AUTHORS: ProgrammaticAuthorProfile[] = [
  {
    name: "Neeraj Jain",
    linkedinUrl: "https://www.linkedin.com/in/nj123/",
    bio: "Co-founder, Readable.",
  },
  {
    name: "Rajeev Kumar",
    linkedinUrl: "https://www.linkedin.com/in/rajeevku02/",
    bio: "Co-founder, Readable.",
  },
  {
    name: "Kaushik B",
    linkedinUrl: "https://www.linkedin.com/in/vkaushikbalasubramanian/",
    bio: "Founding member, Readable.",
  },
  {
    name: "Ankit Biyani",
    linkedinUrl: "https://www.linkedin.com/in/biyaniankit/",
    bio: "Founding member, Readable.",
  },
]

function hashString(input: string) {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function getAuthorPairForGuideSlug(slug: string): ProgrammaticAuthorPair {
  if (PROGRAMMATIC_AUTHORS.length < 2) {
    throw new Error("At least two authors are required for deterministic author assignment.")
  }

  const normalizedSlug = slug.trim().toLowerCase()
  const count = PROGRAMMATIC_AUTHORS.length

  const mainIndex = hashString(`main:${normalizedSlug}`) % count

  let coAuthorIndex = hashString(`co:${normalizedSlug}`) % (count - 1)
  if (coAuthorIndex >= mainIndex) {
    coAuthorIndex += 1
  }

  return {
    mainAuthor: PROGRAMMATIC_AUTHORS[mainIndex],
    coAuthor: PROGRAMMATIC_AUTHORS[coAuthorIndex],
  }
}
