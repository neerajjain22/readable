# Conventions

## Next.js Conventions
- Use App Router only.
- Prefer Server Components.
- Use `"use client"` only when needed for interactivity/browser APIs.

## TypeScript and Dependencies
- Use TypeScript throughout.
- Avoid adding new libraries unless there is clear necessity.

## Routing Safety
- Preserve existing URLs.
- Avoid route-breaking changes.
- Do not change route structure unless explicitly requested.

## Styling Conventions
- Use CSS Modules for page/component styles.
- Keep global styles in `styles/globals.css`.
- Do not introduce alternate styling systems.

## Change Discipline For AI Agents
- Keep scope focused on requested work.
- Avoid unrelated refactors.
- Preserve current UI behavior unless a change is explicitly requested.
