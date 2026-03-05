import { sql } from "@vercel/postgres"

let initialized = false

type ApiAccessRequestInput = {
  name: string
  email: string
  company: string
  website: string
  useCase: string
  details: string
}

async function ensureTables() {
  if (initialized) {
    return
  }

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      source TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS case_study_downloads (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      case_study_slug TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS api_access_requests (
      id BIGSERIAL PRIMARY KEY,
      name TEXT,
      email TEXT,
      company TEXT,
      website TEXT,
      use_case TEXT,
      details TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  initialized = true
}

export async function saveLead(email: string, source: string) {
  await ensureTables()
  await sql`
    INSERT INTO leads (email, source)
    VALUES (${email}, ${source})
  `
}

export async function logCaseStudyDownload(email: string, slug: string) {
  await ensureTables()
  await sql`
    INSERT INTO case_study_downloads (email, case_study_slug)
    VALUES (${email}, ${slug})
  `
}

export async function saveApiAccessRequest(input: ApiAccessRequestInput) {
  await ensureTables()
  await sql`
    INSERT INTO api_access_requests (name, email, company, website, use_case, details)
    VALUES (${input.name}, ${input.email}, ${input.company}, ${input.website}, ${input.useCase}, ${input.details})
  `
}
