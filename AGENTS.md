# AGENTS.md

This repository includes AI-readable context files to help coding agents work safely and consistently.

## Mandatory Read Order
Before making any code changes:
1. Read `AGENTS.md`
2. Read `docs/architecture.md`
3. Read `docs/ai-context.md`

## Repository Rules For AI Agents
- Respect the existing architecture.
- Avoid refactoring unrelated code.
- Maintain current UI and routes.
- Implement features incrementally.
- Use App Router patterns only.
- Prefer Server Components, and use `"use client"` only when required.
- Preserve CSS Modules and existing styling conventions.
- Avoid introducing new dependencies unless necessary.
- Before making changes, list the files you plan to modify and wait for confirmation.
