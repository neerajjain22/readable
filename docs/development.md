# Development

## Environment
- Deployment platform: Vercel
- Database: PostgreSQL via Prisma

Key env vars:
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `LLM_PROVIDER`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_KEYWORDS_MODEL`
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

## Development Notes
- Keep App Router as the active routing model.
- Maintain compatibility with existing production routes and styles.
- Validate changes incrementally and avoid broad refactors.
- `/admin/programmatic` requires basic auth credentials in local env.
