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
- Database: Postgres via `@vercel/postgres`
- Content: MDX (blog), JSON (case studies)

## Core Directories
- `app/`
- `components/`
- `lib/`
- `content/`
- `public/`
- `styles/`

## Routing Structure
All routes live in `app/`.

Important routes:
- `app/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/case-studies/page.tsx`
- `app/platform/*`
- `app/solutions/*`
- `app/book-demo/page.tsx`
- `app/contact/page.tsx`

## API Layer
API handlers are under `app/api/*`.

Example:
- `app/api/case-study-download/route.ts`

Removed legacy OTP APIs:
- `app/api/request-case-study/route.ts`
- `app/api/verify-email/route.ts`

## Content System
Blog:
- Source: `content/blog`
- Format: MDX
- Dynamic route: `/blog/[slug]`
- Loader: `lib/posts.ts`

Case studies:
- Data: `content/case-studies`
- PDFs: `public/case-studies`
- Loader: `lib/case-study-data.ts`
- Page: `app/case-studies/page.tsx`
- Client modal: `app/case-studies/CaseStudiesClient.tsx`

## Components
Shared UI components are in `components/`.

Notable files:
- `components/Header.tsx`
- `components/footer.tsx`

Interactive components should explicitly use `"use client"`.

## Styling
- Global styles: `styles/globals.css`
- Page/component styles: CSS Modules in `styles/`
- UI direction: clean SaaS layout, minimal UI, modular CSS
