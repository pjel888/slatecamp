# DATA_BOUNDARY_MAP

## Purpose

This map explains where data and runtime responsibility crosses boundaries in SlateCamp so future Codex sessions can reason about safety and validation faster.

## Core boundaries

### Server vs client

- Server-first App Router by default
- Client-heavy areas still exist broadly across admin and 3D surfaces
- main server entry boundary: `src/app/*`, `src/lib/actions/*`, `src/lib/queries/*`
- main client state boundary: `src/stores/*`, client components in `src/components/*`

## Route handlers

Current route-handler families:
- `api/admin/flags`
- `api/ai/*`
- `api/cron/*`
- `api/payments/checkout`
- `api/webhooks/*`
- `auth/callback`

Risk:
- route handlers cross env/auth/payment/external boundaries and need explicit validation and docs. **CAGE behavioral traces now use strict Zod schemas to ensure data integrity at the API boundary.**

## Server actions

- main mutation surface: `src/lib/actions/`
- current scale: `156` files
- heavy admin orchestration is concentrated in `src/lib/actions/admin/*`

Risk:
- behavior is distributed and easy to misread without caller/context tracing

## Supabase clients/helpers

Key files:
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/middleware.ts`

Observed risks:
- dev impersonation and service-role bypass logic is present
- runtime authority differs between browser, server, admin/service, and middleware contexts

## Auth and entitlements

Key files:
- `src/lib/entitlements/get-viewer-entitlements.ts`
- `src/lib/entitlements/policy.ts`
- `src/lib/entitlements/resolve-role.ts`
- `src/lib/admin/roles.ts`
- `src/lib/supabase/middleware.ts`

Boundary summary:
- route access decisions depend on role resolution, profile/user-role rows, feature flags, and dev overrides
- `/admin`, `/developer`, and `/ceo` are gated differently

## Payments and external integrations

Key files:
- `src/lib/payments/provider.ts`
- `src/lib/lemonsqueezy/config.ts`
- `src/lib/payrex/config.ts`
- `src/app/api/payments/checkout/route.ts`
- `src/app/api/webhooks/lemonsqueezy/route.ts`
- `src/app/api/webhooks/payrex/route.ts`

Risk:
- payment behavior depends on env flags, provider selection, and webhook integrity

## Runtime-truth vs mock-truth

Important developer-surface split:
- `src/lib/actions/dev/db-viewer.ts` is real runtime-backed
- `src/lib/mocks/status.ts` is explicitly mock-backed

Impact:
- `/developer` pages should be documented as real vs mock so Codex does not over-trust mock inspection surfaces

## Current friction for Codex

- env usage is spread across runtime helpers, scripts, admin/dev tools, and payments
- schema truth requires both `DATABASE_SCHEMA.sql` and recent migrations
- access-control truth requires multiple files, not one contract
