import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const categories = ["Insurance Brokers", "Lawyers", "B2B SaaS"]

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function main() {
  for (const name of categories) {
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

    await prisma.entity.create({
      data: {
        name,
        slug,
        type: "business_category",
        metadata: {},
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
