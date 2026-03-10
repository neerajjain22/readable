# AI Context

## Quick Summary
- Project: TryReadable
- Framework: Next.js 14 + App Router
- Language: TypeScript
- Styling: CSS Modules + `styles/globals.css`
- Deployment: Vercel
- DB: PostgreSQL + Prisma
- Content: MDX blog/editorial guides + DB-backed programmatic guides

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
- `scripts/`
- `prisma/`

Important routes:
- `app/page.tsx`
- `app/analyze/page.tsx`
- `app/ai-visibility/[companySlug]/page.tsx`
- `app/ai-search/[querySlug]/page.tsx`
- `app/recent-ai-visibility-reports/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/guides/page.tsx`
- `app/guides/[slug]/page.tsx`
- `app/guides/cms/page.tsx`
- `app/admin/programmatic/page.tsx`
- `app/admin/programmatic/[id]/page.tsx`
- `app/case-studies/page.tsx`
- `app/platform/*`
- `app/solutions/*`
- `app/book-demo/page.tsx`
- `app/contact/page.tsx`

## API and Data Flows
API layer:
- `app/api/*`
- Active endpoint: `app/api/case-study-download/route.ts`
- AI visibility endpoints:
  - `app/api/ai-visibility/generate/route.ts`
  - `app/api/ai-visibility/status/route.ts`
  - `app/api/ai-visibility/process/route.ts`

Case study download flow (current):
1. User selects a case study.
2. Modal captures business email.
3. Email is validated.
4. Email is written to Postgres.
5. PDF download starts immediately.

DB helper:
- `lib/db.ts`
- Prisma singleton: `lib/prisma.ts`
- Programmatic repository: `lib/programmatic/repository.ts`
- AI visibility services:
  - `lib/ai-visibility/report.ts`
  - `lib/ai-visibility/repository.ts`
  - `lib/ai/prompts/*`
  - `lib/ai-visibility/llm.ts` (supports `LLM_PROVIDER=openrouter|bedrock`; Bedrock falls back to OpenRouter if configured)

Legacy removed APIs:
- `app/api/request-case-study/route.ts`
- `app/api/verify-email/route.ts`

## Content Loading
Blog:
- Source: `content/blog` (MDX)
- Loader: `lib/posts.ts`
- Route: `/blog/[slug]`

Editorial guides:
- Source: `content/guides` (MDX)
- Loader: `lib/guides.ts`
- Route: `/resources/guides/[slug]`

Programmatic guides:
- Source: PostgreSQL (`GeneratedPage`)
- MDX renderer: `components/programmatic/MdxRenderer.tsx`
- Route: `/guides/[slug]`
- Generation: `scripts/generateProgrammaticPages.ts`
- Moderation UI: `/admin/programmatic`

Case studies:
- Data: `content/case-studies` (JSON)
- PDF assets: `public/case-studies`
- Loader: `lib/case-study-data.ts`
- UI: `app/case-studies/page.tsx`, `app/case-studies/CaseStudiesClient.tsx`

AI visibility:
- Report route: `/ai-visibility/[companySlug]`
- Query route: `/ai-search/[querySlug]`
- Recent reports route: `/recent-ai-visibility-reports`
- Analyze flow: `/analyze` -> generate -> poll status -> redirect when completed
- Status lifecycle: `processing` | `completed` | `failed`
- Public visibility rule: only `completed` reports are shown
- Processing reliability:
  - DB-backed job claiming for `processing` reports
  - heartbeat updates to keep active processing fresh
  - recoverability through `/api/ai-visibility/process`
  - periodic processing via Vercel cron (`vercel.json`)

## Programmatic + Internal Linking Workflows
- Generator creates draft pages section-by-section with LLM.
- Callout boxes are generated and stored in MDX during generation.
- `--refresh-callouts` mode updates only callouts + versions.
- Internal linking engine:
  - registers destination pages in `InternalLinkTarget`
  - generates keywords in `InternalLinkKeyword` using OpenRouter
  - injects links into MDX at generation/migration time
  - avoids headings/code blocks/existing links/URLs

## Security Notes
- Admin moderation routes are HTTP Basic Auth protected by `middleware.ts`.
- Required env vars:
  - `ADMIN_BASIC_AUTH_USER`
  - `ADMIN_BASIC_AUTH_PASS`
- Programmatic/admin pages should remain noindex unless published.

## Coding Rules For Future AI Sessions
- Respect existing architecture and route map.
- Do not refactor unrelated modules.
- Preserve UI structure and styling patterns.
- Prefer incremental, low-risk edits.
- Use App Router and TypeScript conventions consistently.
