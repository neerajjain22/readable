# Architecture

## Project
- Name: TryReadable
- Purpose: Understand how AI systems perceive, describe, and influence brand visibility and positioning.
- Deployment: Vercel

## Stack
- Framework: Next.js 14
- Routing: App Router (no active Pages Router)
- Language: TypeScript
- Styling: CSS Modules + global styles in `styles/globals.css`
- Database: PostgreSQL via Prisma ORM
- Content: MDX (blog/guides) + DB-backed programmatic guide content

## Core Directories
- `app/`
- `components/`
- `lib/`
- `content/`
- `public/`
- `styles/`
- `scripts/`
- `prisma/`

## Routing Structure
All routes live in `app/`.

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
- `app/guides/sitemap.ts`
- `app/case-studies/page.tsx`
- `app/platform/*`
- `app/solutions/*`
- `app/book-demo/page.tsx`
- `app/contact/page.tsx`
- `app/admin/programmatic/page.tsx`
- `app/admin/programmatic/[id]/page.tsx`

## API Layer
API handlers are under `app/api/*`.

Example:
- `app/api/case-study-download/route.ts`
- `app/api/ai-visibility/generate/route.ts`
- `app/api/ai-visibility/status/route.ts`
- `app/api/ai-visibility/process/route.ts`
- `app/api/report-status/[reportId]/route.ts`
- `app/api/report/[reportId]/route.ts`

Removed legacy OTP APIs:
- `app/api/request-case-study/route.ts`
- `app/api/verify-email/route.ts`

## Content System
Blog:
- Source: `content/blog`
- Format: MDX
- Dynamic route: `/blog/[slug]`
- Loader: `lib/posts.ts`

Editorial guides:
- Source: `content/guides`
- Format: MDX
- Primary route: `/resources/guides/[slug]`
- Loader: `lib/guides.ts`

Programmatic guides:
- Storage: PostgreSQL (`GeneratedPage.content` as MDX)
- Route: `/guides/[slug]`
- Collection pages: `/guides/[collection]` (implemented via slug route resolution)
- Generator: `scripts/generateProgrammaticPages.ts`
- Moderation: `/admin/programmatic` and `/admin/programmatic/[id]`

Case studies:
- Data: `content/case-studies`
- PDFs: `public/case-studies`
- Loader: `lib/case-study-data.ts`
- Page: `app/case-studies/page.tsx`
- Client modal: `app/case-studies/CaseStudiesClient.tsx`

## Database Models (Prisma)
- `Template`
- `Entity`
- `GeneratedPage`
- `PageVersion`
- `InternalLinkTarget`
- `InternalLinkKeyword`
- `AiVisibilityReport`
  - includes indexes on `companySlug` and `(status, updatedAt)` for report queue claim efficiency

## AI Visibility System
- Analyze entry point: `/analyze`
- Report pages: `/ai-visibility/[companySlug]`
- Query intelligence pages: `/ai-search/[querySlug]`
- Recent reports listing: `/recent-ai-visibility-reports`

Processing flow:
1. Domain normalized and slug derived
2. Existing/cached report check (30-day cache window)
3. Processing row upserted in `AiVisibilityReport`
4. Generation pipeline runs and persists evidence + insights
5. Report becomes publicly available only when `status = completed`

UX + durability behavior:
- `/analyze` redirects to `/ai-visibility/{companySlug}` immediately after generation is created/started.
- Report page progressively renders sections while polling:
  - `/api/report-status/{reportId}` for stage flags
  - `/api/report/{reportId}` for partial/full payload updates
- Generation is asynchronous and non-blocking for request handlers.
- Processing jobs are claimed from DB (`processing` rows) using transactional claim logic.
- Active generation rows are heartbeat-updated to avoid stale false-failures.
- Background processor endpoint (`/api/ai-visibility/process`) can recover stale/incomplete work.
- Vercel cron (`vercel.json`) triggers processor endpoint periodically.
- Shared LLM client (`lib/services/llm.ts`) applies centralized request timeout + bounded retries with jitter.

## Programmatic SEO Pipeline
1. Load templates + entities
2. Generate section-level MDX content with LLM
3. Generate callout summaries and inject `<CalloutBox />` into MDX
4. Register internal link targets + AI keyword anchors
5. Inject internal links into article content at generation time
6. Save as `draft` and create version history rows

## Rendering Behavior
- Draft/review programmatic pages are `noindex`
- Published programmatic pages are indexable
- TOC and guide summary are derived from headings
- Internal links are expected to be persisted in stored MDX (not runtime-injected)
- ISR windows:
  - `/` revalidates every 300 seconds
  - `/guides` revalidates every 3600 seconds
  - `/sitemap.xml` revalidates every 86400 seconds

## Security
- `middleware.ts` protects:
  - `/admin/programmatic`
  - `/admin/programmatic/:path*`
- Uses HTTP Basic Auth via:
  - `ADMIN_BASIC_AUTH_USER`
  - `ADMIN_BASIC_AUTH_PASS`
- `middleware.ts` also blocks public traffic on `*.vercel.app` hosts with `404`.
- Exception: `/api/ai-visibility/process` remains accessible for scheduled background processing.

## Components
Shared UI components are in `components/`.

Notable files:
- `components/Header.tsx`
- `components/footer.tsx`
- `components/Breadcrumbs.tsx`
- `components/programmatic/*`
- `components/guides/*`

Interactive components should explicitly use `"use client"`.

## Styling
- Global styles: `styles/globals.css`
- Page/component styles: CSS Modules in `styles/`
- UI direction: clean SaaS layout, minimal UI, modular CSS
