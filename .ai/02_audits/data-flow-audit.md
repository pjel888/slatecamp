# Data Flow Audit

**Last Updated:** 2026-04-16

## Core shape
- Server actions under `src/lib/actions/` are the primary mutation surface.
- Query helpers are lighter-weight and concentrated under `src/lib/queries/`.
- `src/lib/supabase/server.ts` provides server/static/service access paths.
- Route handlers are limited and focused on AI, payments/webhooks, cron jobs, admin flags, and auth callback.

## Key patterns
- RPC use exists for specialized operations (`select_next_item`, article search, dev DB viewer).
- Actions often wrap Supabase calls in try/catch and return structured error objects.
- Entitlement and audit logging logic is embedded in high-value flows like `quiz-v2/start-session.ts`.
