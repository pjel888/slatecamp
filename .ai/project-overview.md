# Project Overview (Historical Snapshot)

**Last audit:** 2026-04-29 | **Superseded by:** `PROJECT_CONTEXT.md` (2026-05-09)

> ⚠️ **This file is a historical snapshot from 2026-04-29.** Counts below are **stale**. For current verified counts and project context, see `PROJECT_CONTEXT.md`.

SlateCamp is a Next.js App Router application for Philippine Licensure Examination for Architects preparation.

## Historical audited counts (2026-04-29)

| Metric | Old Count (2026-04-29) | Current Verified (2026-05-09) |
| --- | --- | --- |
| pages | 105 | **128** |
| apis | 12 | **12** |
| layouts | 14 | **15** |
| loadings | 92 | **104** |
| errors | 7 | **8** |
| server_files | 157 | **150** |
| tests | 88 | **88** |
| stories | 100 | **113** |
| tables | 76 | **76** (reconfirmed) |
| migrations | 92 | **101** |
| env | 65 referenced names | unchanged |
| features | 27 | unchanged |
| ip | 16 | unchanged


## Current status

Pre-launch MVP. The app has broad implemented functionality; remaining launch risks are mostly hardening, documentation drift, route-surface breadth, and operational monitoring. Payment-provider completeness and live AI provider verification are deferred post-launch work for the current payment-free/live-AI-free launch scope.

## Source-of-truth files

- Routes: `src/app/`
- Server actions: `src/lib/actions/`
- Queries: `src/lib/queries/`
- Schema: `DATABASE_SCHEMA.sql`
- Migrations: `supabase/migrations/`
- Middleware/auth: `middleware.ts`, `src/lib/supabase/middleware.ts`, `src/lib/entitlements/`
- Design: `DESIGN.md`, `src/app/globals.css`
- Commands: `package.json`
- Tests: `src/**/*.test.*`, `e2e/*.spec.ts`, `.ai/00_performance/playwright/*.spec.ts`
