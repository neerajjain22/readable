import { PrismaClient } from "@prisma/client"
import {
  getUserDefinedEntitySpecificity,
  mergeEntitySpecificityProfiles,
} from "../lib/programmatic/entitySpecificity.ts"

const prisma = new PrismaClient()

type EntityCreateInput = {
  name: string
  metadata?: {
    preferredLabel?: string
    specificNouns?: string[]
    avoidGenericNouns?: string[]
  }
  copyFromSlug?: string
}

const categories: EntityCreateInput[] = [
  {
    name: "Insurance Brokers",
    metadata: {
      preferredLabel: "Independent Insurance Brokers",
      specificNouns: [
        "Independent Insurance Brokers",
        "Commercial Lines Producers",
        "Small Business Policyholders",
      ],
      avoidGenericNouns: ["brokers", "clients"],
    },
  },
  {
    name: "Lawyers",
    metadata: {
      preferredLabel: "Personal Injury Attorneys",
      specificNouns: [
        "Personal Injury Attorneys",
        "Medical Malpractice Plaintiffs",
        "Workers' Compensation Claimants",
      ],
      avoidGenericNouns: ["lawyers", "clients"],
    },
  },
  {
    name: "B2B SaaS",
    metadata: {
      preferredLabel: "B2B SaaS Revenue Teams",
      specificNouns: [
        "B2B SaaS Revenue Teams",
        "Demand Generation Managers",
        "Product-Led Growth Operators",
      ],
      avoidGenericNouns: ["businesses", "companies"],
    },
  },
]

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function main() {
  for (const input of categories) {
    const name = input.name
    const slug = slugify(name)

    const existing = await prisma.entity.findFirst({
      where: {
        slug,
      },
    })

    if (existing) {
      console.log(`${name} already exists`)
      continue
    }

    const userSpecificity = getUserDefinedEntitySpecificity(input.metadata)
    const hasDirectSpecificity =
      Boolean(userSpecificity.preferredLabel) ||
      (userSpecificity.specificNouns?.length || 0) > 0 ||
      (userSpecificity.avoidGenericNouns?.length || 0) > 0

    let copiedSpecificity: ReturnType<typeof getUserDefinedEntitySpecificity> | undefined

    if (!hasDirectSpecificity && input.copyFromSlug) {
      const source = await prisma.entity.findUnique({
        where: { slug: input.copyFromSlug },
        select: { metadata: true },
      })

      if (!source) {
        throw new Error(`Cannot create '${name}': copyFromSlug '${input.copyFromSlug}' does not exist.`)
      }

      const parsedSource = getUserDefinedEntitySpecificity(source.metadata)
      const hasSourceSpecificity =
        Boolean(parsedSource.preferredLabel) ||
        (parsedSource.specificNouns?.length || 0) > 0 ||
        (parsedSource.avoidGenericNouns?.length || 0) > 0

      if (!hasSourceSpecificity) {
        throw new Error(
          `Cannot create '${name}': source '${input.copyFromSlug}' does not have specificity metadata to copy.`,
        )
      }

      copiedSpecificity = parsedSource
    }

    if (!hasDirectSpecificity && !copiedSpecificity) {
      throw new Error(
        `Cannot create '${name}': provide metadata (preferredLabel/specificNouns/avoidGenericNouns) or set copyFromSlug.`,
      )
    }

    const mergedSpecificity = mergeEntitySpecificityProfiles(
      hasDirectSpecificity ? userSpecificity : undefined,
      copiedSpecificity,
    )

    await prisma.entity.create({
      data: {
        name,
        slug,
        type: "business_category",
        metadata: mergedSpecificity,
      },
    })

    console.log(`${name} created`)
  }

  console.log("Entities creation completed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
