# AI Context

## Quick Summary
- Project: TryReadable
- Framework: Next.js 14 + App Router
- Language: TypeScript
- Styling: CSS Modules + `styles/globals.css`
- Deployment: Vercel
- DB: Postgres (`@vercel/postgres`)
- Content: MDX blog + JSON case studies

## Start Here (Required)
Before making code changes, read in this order:
1. `AGENTS.md`
2. `docs/architecture.md`
3. `docs/ai-context.md`

## Architecture Snapshot
Core directories:
- `app/`
- `components/`
- `lib/`
- `content/`
- `public/`
- `styles/`

Important routes:
- `app/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/case-studies/page.tsx`
- `app/platform/*`
- `app/solutions/*`
- `app/book-demo/page.tsx`
- `app/contact/page.tsx`

## API and Data Flows
API layer:
- `app/api/*`
- Active endpoint: `app/api/case-study-download/route.ts`

Case study download flow (current):
1. User selects a case study.
2. Modal captures business email.
3. Email is validated.
4. Email is written to Postgres.
5. PDF download starts immediately.

DB helper:
- `lib/db.ts`

Legacy removed APIs:
- `app/api/request-case-study/route.ts`
- `app/api/verify-email/route.ts`

## Content Loading
Blog:
- Source: `content/blog` (MDX)
- Loader: `lib/posts.ts`
- Route: `/blog/[slug]`

Case studies:
- Data: `content/case-studies` (JSON)
- PDF assets: `public/case-studies`
- Loader: `lib/case-study-data.ts`
- UI: `app/case-studies/page.tsx`, `app/case-studies/CaseStudiesClient.tsx`

## Coding Rules For Future AI Sessions
- Respect existing architecture and route map.
- Do not refactor unrelated modules.
- Preserve UI structure and styling patterns.
- Prefer incremental, low-risk edits.
- Use App Router and TypeScript conventions consistently.
