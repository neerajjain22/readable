# Development

## Environment
- Deployment platform: Vercel
- Database: Postgres using `@vercel/postgres`

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

## Development Notes
- Keep App Router as the active routing model.
- Maintain compatibility with existing production routes and styles.
- Validate changes incrementally and avoid broad refactors.
