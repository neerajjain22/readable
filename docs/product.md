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
- Platform pages
- Solutions pages
- Pricing page
- Agency partner page
- Resources and documentation pages
- Blog system with MDX posts
- Dynamic blog routes
- Case studies listing page
- Modal-based email capture for case study downloads
- Header navigation with dropdowns
- App Router migration completed

## Current Development Focus
Case Study Download Flow Refactor.

Previous OTP-based verification was removed.

Current flow:
1. User selects case study.
2. Modal requests business email.
3. Email is validated.
4. Email is stored in Postgres.
5. PDF download starts immediately.

Implementation references:
- API: `app/api/case-study-download/route.ts`
- DB helper: `lib/db.ts`
