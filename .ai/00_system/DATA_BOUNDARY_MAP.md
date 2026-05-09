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
- Internal developer AI is a separate local-tooling boundary: OpenRouter is a first-class Hermes provider/model lane for sessions, delegated subagents, and one-shot workers without making public learner AI live.

Risk:
- future payment/AI behavior depends on env flags, provider selection, webhook integrity, live provider contracts, and explicit data-retention/cost boundaries

## Developer AI provider boundary

Key locations:
- app/product AI abstraction: `src/lib/ai/provider.ts`
- developer AI runbook: `.ai/00_system/OPENROUTER_DEVELOPER_AI_RUNBOOK.md`
- Hermes local config/env and delegation settings: `~/.hermes/config.yaml` and `~/.hermes/.env`
- AI worker lanes used alongside Hermes/OpenRouter: Codex, OpenCode/OpenCode Go, Command Code, and Kimi
- standalone Codex config/auth, if used: `~/.codex/config.toml` and `~/.codex/auth.json`

Boundary summary:
- Developer AI may route prompts, code excerpts, logs, and local docs through OpenRouter and upstream model providers.
- OpenRouter is a provider/router lane inside the Hermes agent bench, not a separate public feature and not proof that learner AI is live.
- Product runtime AI keys belong in app server/deployment env; developer AI keys belong in local tool env/auth stores.
- Do not expose either boundary through `NEXT_PUBLIC_*`.

Risk:
- OpenRouter may forward prompts to third-party providers. Do not send secrets, private env values, service-role keys, production/student records, confidential logs, or full database exports through developer AI unless that data boundary has explicit human approval.

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
