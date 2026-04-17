# Backend System Map

**Last Updated:** 2026-04-17

## Key backend anchors

- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/actions/`
- `src/lib/queries/`
- `DATABASE_SCHEMA.sql`
- `supabase/migrations/`
- `src/app/api/*/route.ts`

## Current backend scale

- `156` files under `src/lib/actions/`
- `19` files under `src/lib/queries/`
- `89` migration files under `supabase/migrations/`
- schema snapshot header currently reports `86 tables`, `2 views`, and `39 functions`, but it is older than several later RLS/authz migrations

## Domain clusters

- admin content, questions, taxonomy, assets, and pipeline
- quiz-v2 sessions, review, and analytics
- wiki and taxonomy retrieval
- entitlements, payments, checkout, and webhooks
- signals, blindspots, and cron-compute routes
- developer DB/testing utilities

## Current API route handlers

- `api/admin/flags`
- `api/ai/*`
- `api/cron/*`
- `api/payments/checkout`
- `api/webhooks/*`
- `auth/callback`

## Data-governance note

- `DATABASE_SCHEMA.sql` is the strongest snapshot, but not yet a complete current source of truth for all later RLS/authz changes
- current access-control review still requires reading the relevant 2026-04-11 and 2026-04-12 migrations alongside the snapshot
