# Architecture

**Last audit:** 2026-04-29

## System overview

SlateCamp is a Next.js 16 App Router app with Supabase-backed auth/data, Server Actions for most mutations, API route handlers for AI/payments/cron/webhooks, and client-heavy interactive surfaces for quiz, 3D Lab, wiki, notes, and admin editors.

## Current structure

| Layer | Files/Paths | Role |
| --- | --- | --- |
| App router | src/app/ | Pages, route groups, layouts, loading/error boundaries, route handlers. |
| Components | src/components/ | Shared and domain UI components. |
| Features | src/features/ | Large modules: 3D Lab and wall configurator. |
| Server logic | src/lib/actions/; src/lib/queries/; src/lib/supabase/ | Mutations, reads, auth/data clients, server helpers. |
| State | src/stores/; src/hooks/ | Zustand stores and reusable client hooks. |
| Database | DATABASE_SCHEMA.sql; supabase/migrations/ | Schema snapshot and migration chronology. |
| Docs/ops | .ai/; docs/; AGENTS.md hierarchy | Operational intelligence and agent guidance. |


## Request flow

1. `middleware.ts` sets `x-pathname` and delegates to `src/lib/supabase/middleware.ts`.
2. Supabase middleware handles static/API bypass, legacy redirects, local dev force-user bypass, public path checks, demo mode, session refresh, and privileged route gating.
3. Route layouts/pages render Server Components by default and mount Client Components where interactivity is needed.
4. Server Actions/queries in `src/lib/` read/write Supabase.
5. Route handlers in `src/app/api/` handle AI, cron, payments, webhooks, and admin flag overrides.

## Rendering/client boundaries

Server-first intent, but many files are client components due to 3D rendering, quiz timers/state, rich editors, navigation, wiki interactions, and notes.

## Caching/revalidation/error handling

- Next route loading/error files are widely present: 92 loading files and 7 error boundaries.
- Server actions use `revalidatePath`/cache tags in selected domains (`src/lib/actions/cache-tags.ts`).
- Payment webhooks use `processed_webhook_events` for idempotency.
- AI routes use rate limiting and timeout signals.

See `routes.md`, `api-and-server.md`, `security.md`, and `codebase-map.md` for detailed inventories.
