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
- `src/lib/payrex/config.ts`
- `src/app/api/payments/checkout/route.ts`
- `src/app/api/webhooks/payrex/route.ts`
- `src/lib/ai/provider.ts`
- `src/app/api/ai/*/route.ts`

Current launch stance:
- Payments are deferred for the current payment-free launch; keep `NEXT_PUBLIC_PAYMENTS_ENABLED=false`.
- LemonSqueezy runtime files and dependency were removed in Plan B cleanup; only legacy schema/type columns remain.
- Learner-facing live AI provider behavior is deferred; launch-facing quiz AI helper UI is disabled.
- Internal developer AI is a separate local-tooling boundary: developer agents are Codex-first with GPT-5.5 where available. OpenRouter belongs to app/runtime learner/user AI when intentionally enabled, not the default developer-agent path.

Risk:
- future payment/AI behavior depends on env flags, provider selection, webhook integrity, live provider contracts, and explicit data-retention/cost boundaries

## AI provider boundary

Key locations:
- app/product AI abstraction: `src/lib/ai/provider.ts`
- app OpenRouter runbook: `.ai/00_system/OPENROUTER_APP_AI_RUNBOOK.md`
- developer AI guidance: `.ai/00_system/CODEX_ENABLEMENT_GUIDE.md` and `.hermes/docs/17-codex-developer-ai.md`
- standalone Codex config/auth, if used: `~/.codex/config.toml` and `~/.codex/auth.json`

Boundary summary:
- Developer AI is Codex-first with GPT-5.5 where available. Do not force Hermes/developer agents through OpenRouter.
- OpenRouter is the preferred app/runtime provider for learner/user AI when public AI is intentionally enabled.
- Product runtime AI keys belong in app server/deployment env. Developer AI auth belongs in local Codex/Hermes provider auth stores.
- Do not expose any provider secret through `NEXT_PUBLIC_*`.

Risk:
- OpenRouter may forward app prompts to third-party providers. Before enabling learner/user AI, verify privacy, data-retention, rate-limit, and cost boundaries.

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
