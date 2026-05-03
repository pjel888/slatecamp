# Project Overview

**Last audit:** 2026-04-29

SlateCamp is a Next.js App Router application for Philippine Licensure Examination for Architects preparation. It combines public marketing, authenticated student study workflows, admin content operations, developer tooling, and owner/CEO operational dashboards.

## Current audited counts

| Metric | Count |
| --- | --- |
| pages | 105 |
| apis | 12 |
| layouts | 14 |
| loadings | 92 |
| errors | 7 |
| server_files | 157 |
| tests | 88 |
| stories | 100 |
| tables | 76 |
| migrations | 92 |
| env | 65 referenced names; 4 launch-required core vars; 11 deferred provider vars |
| features | 27 |
| ip | 16 |


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
