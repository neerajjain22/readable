import { sql } from "@vercel/postgres"

let initialized = false

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
