import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const name = "Answer Engine Optimization for {entity}"
const slugPattern = "aeo-for-{entity}"
const contentType = "guide"
const sections = [
  "Introduction",
  "What is Answer Engine Optimization",
  "Why AEO matters for {entity}",
  "How AI assistants discover {entity}",
  "How AI assistants evaluate {entity}",
  "Content strategies for {entity}",
  "Technical SEO for AEO",
  "Common mistakes {entity} businesses make",
  "How Readable helps",
  "FAQ",
  "Summary",
]

const contentTemplate = `## Introduction

## What is Answer Engine Optimization

## Why AEO matters for {entity}

## How AI assistants discover {entity}

## How AI assistants evaluate {entity}

## Content strategies for {entity}

## Technical SEO for AEO

## Common mistakes {entity} businesses make

## How Readable helps

## FAQ

## Summary`

async function main() {
  const existing = await prisma.template.findFirst({
    where: {
      slugPattern,
    },
  })

  if (existing) {
    console.log("Template already exists")
    return
  }

  const latestVersion = await prisma.template.findFirst({
    where: { name },
    orderBy: { version: "desc" },
    select: { version: true },
  })

  const version = latestVersion ? latestVersion.version + 1 : 1

  await prisma.template.create({
    data: {
      name,
      slugPattern,
      contentType,
      sections,
      contentTemplate,
      version,
    },
  })

  console.log("Template created successfully")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
