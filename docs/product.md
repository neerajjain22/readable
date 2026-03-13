# Product

## What TryReadable Does
TryReadable helps companies understand how AI systems perceive, describe, and influence their brand.

The platform analyzes AI-generated responses about brands and turns that into visibility and positioning insights.

## Primary Users
- Marketers
- Growth teams
- Brand teams
- Agencies

## Key Implemented Features
- Full marketing website
- Homepage with rotating hero text
- AI visibility analysis entry flow (`/analyze`)
- AI visibility report pages (`/ai-visibility/[companySlug]`)
- AI query intelligence pages (`/ai-search/[querySlug]`)
- Recent AI visibility reports listing (`/recent-ai-visibility-reports`)
- Platform pages
- Solutions pages
- Pricing page
- Agency partner page
- Resources and documentation pages
- Blog system with MDX posts
- Editorial guides system with MDX content
- Dynamic blog routes
- Case studies listing page
- Modal-based email capture for case study downloads
- Header navigation with dropdowns
- App Router migration completed
- Programmatic SEO guide engine
- Programmatic moderation workflow (draft/review/publish/reject)
- Dynamic guide hubs/collections/articles under `/guides`
- Programmatic sitemap safety (published only)
- Programmatic callout/CTA generation in MDX
- Internal linking engine with AI-generated anchor keywords
- Admin route protection via HTTP Basic Auth
- AI visibility evidence pipeline (category, competitors, buyer/comparison queries, response evidence)
- AI visibility processing/status APIs with async generation lifecycle
- AI visibility background processor endpoint + cron-driven recovery
- AI visibility queue scalability index on report processing fields (`status`, `updatedAt`)
- Shared LLM reliability guardrails (timeout + bounded retries + jitter)
- AI search query page metadata path optimized for lightweight DB reads
- ISR-based caching for high-traffic routes (`/`, `/guides`, `/sitemap.xml`) to reduce repeated DB load

## Current Development Focus
Programmatic SEO + AI visibility intelligence:
1. Add/maintain templates and entities
2. Generate draft guides safely
3. Human moderation before publishing
4. Keep internal linking and callouts deterministic
5. Protect admin workflows and noindex draft content
6. Keep AI visibility reports evidence-based and conversion-oriented
7. Maintain reliable async processing and recovery for report generation

Implementation references:
- Programmatic generator: `scripts/generateProgrammaticPages.ts`
- Internal link migration: `scripts/migrateInternalLinks.ts`
- Moderation UI: `app/admin/programmatic/*`
- Programmatic route: `app/guides/[slug]/page.tsx`
- AI visibility pipeline: `lib/ai-visibility/report.ts`
- AI visibility prompt set: `lib/ai/prompts/*`
- AI visibility processing route: `app/api/ai-visibility/process/route.ts`
