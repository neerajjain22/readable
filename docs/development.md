# Development

## Environment
- Deployment platform: Vercel
- Database: PostgreSQL via Prisma

Key env vars:
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `ANTHROPIC_API_KEY`
- `AI_VISIBILITY_PROCESS_SECRET` (or `CRON_SECRET`)
- `AI_VISIBILITY_HEARTBEAT_MS` (optional override)
- `AI_VISIBILITY_PROCESSING_STALE_SECONDS` (optional override)
- `ADMIN_BASIC_AUTH_USER`
- `ADMIN_BASIC_AUTH_PASS`

## Commands
Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Build project:
```bash
npm run build
```

Generate Prisma client:
```bash
npm run prisma:generate
```

Run Prisma migration (dev):
```bash
npm run prisma:migrate
```

Seed DB:
```bash
npm run prisma:seed
```

Open Prisma Studio:
```bash
npx prisma studio
```

Run programmatic guide generation:
```bash
npm run programmatic:generate
```

Refresh callouts only:
```bash
npm run programmatic:generate -- --refresh-callouts
```

Run internal-link migration:
```bash
npm run migrate:internal-links
```

Run AI visibility query-data backfill:
```bash
npm run ai-visibility:backfill
```

## Development Notes
- Keep App Router as the active routing model.
- Maintain compatibility with existing production routes and styles.
- Validate changes incrementally and avoid broad refactors.
- `/admin/programmatic` requires basic auth credentials in local env.
- AI visibility processing:
  - Generation is async and may continue after initial `/generate` response.
  - `/analyze` redirects to `/ai-visibility/{companySlug}` immediately after job creation/start.
  - Report page progressively fills sections by polling:
    - `/api/report-status/{reportId}`
    - `/api/report/{reportId}`
  - `/api/ai-visibility/process` is intended for background recovery/processing.
  - In production, Vercel cron should call `/api/ai-visibility/process?limit=1`.
  - AI visibility LLM uses Claude Sonnet via Anthropic SDK.
