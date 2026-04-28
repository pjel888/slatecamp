# Data Model and Integrations Audit

**Last Updated:** 2026-04-28

## Database Tables Used

### Direct Queries from Developer Portal

| Table | Purpose | Used By | Access Pattern |
|-------|---------|---------|----------------|
| `profiles` | User count | `/developer` (overview) | `select count` |
| `wiki_articles` | Article count | `/developer` (overview) | `select count` |
| `questions` | Question count | `/developer` (overview) | `select count` |
| `quiz_sessions` | Session count | `/developer` (overview) | `select count` |
| `feature_flags` | Feature flag list | `/developer/tools/console` | `select key, enabled` |
| `review_sessions` | Test data generation | `/developer/tools/test-data` | `insert` |
| `exam_profiles` | Test data generation | `/developer/tools/test-data` | `select` |
| `subjects` | Test data generation | `/developer/tools/test-data` | `select` |
| `organizations` | Test data generation | `/developer/tools/test-data` | `insert` |
| `organization_members` | Test data generation | `/developer/tools/test-data` | `insert` |
| `audit_logs` | Audit log viewing | `/developer/tools/logs` | `select` |
| `analytics_events` | Application errors | `/developer/tools/logs` | `select` |

### RPC Functions Used

| Function | Purpose | Used By |
|----------|---------|---------|
| `get_table_info_for_dev` | Table metadata | `/developer/tools/db` |

## Migrations Relevant to Developer Route

No migrations are specific to the developer route. The developer portal is a read-only/documentation surface with the exception of test data generation.

## RLS Policies

The developer portal relies on standard RLS policies:
- `profiles`, `wiki_articles`, `questions`, `quiz_sessions` — read via standard policies
- `review_sessions`, `organizations`, `organization_members` — test data actions use authenticated user context
- `audit_logs` — service client bypasses RLS (super admin only)
- `analytics_events` — admin client bypasses RLS (developer portal access required)

## External APIs

| Service | Endpoint | Purpose | Used By |
|---------|----------|---------|---------|
| Supabase Status | `https://status.supabase.com/api/v2/summary.json` | Service health | `/developer`, `/developer/status` |

## SDKs

- `@supabase/supabase-js` — Database queries
- `@supabase/ssr` — Server-side auth

## Environment Variables

| Name | Purpose | Required | Where Used |
|------|---------|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | Middleware, client init |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | Middleware, client init |
| `NEXT_PUBLIC_APP_URL` | App URL for env detection | Yes | `src/app/developer/layout.tsx` |
| `ALLOW_DEV_PORTAL_BYPASS` | Bypass developer portal restriction | No | `src/lib/entitlements/dev-overrides.ts` |
| `DEV_FORCE_USER_ID` | Force user ID for local dev | No | `src/lib/supabase/middleware.ts` |
| `DEV_FORCE_TIER` | Force tier for local dev | No | `src/lib/entitlements/dev-overrides.ts` |
| `DISABLE_DEV_FORCE_USER_ID` | Disable force user | No | `src/lib/supabase/middleware.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for audit logs | Yes (for logs) | `src/lib/audit/audit-queries.ts` |

**Note:** Secret values are never rendered in the developer portal. The architecture page lists env var names only.

## Analytics/Monitoring

| Tool | Purpose | Used By |
|------|---------|---------|
| Application error logger | Persist operational errors | `src/lib/logging/server.ts` |
| Entitlement audit events | Log access/denial decisions | `src/lib/entitlements/audit.ts` |

## Caches

| Cache | Purpose | Used By |
|-------|---------|---------|
| `React.cache` | `getDeveloperRepoMetrics` | `/developer` |
| `next.revalidate` | Supabase status API (60s) | `src/lib/developer/status-snapshot.ts` |

## Local/Dev-Only Infrastructure

| Component | Purpose | Notes |
|-----------|---------|-------|
| `src/lib/mocks/status.ts` | Mock database/infrastructure status | Used when live telemetry unavailable |
| `src/lib/dev/dev-mode.ts` | Dev mode config and tier resolution | Used for local development |

## Evidence

- Tables: `src/lib/actions/dev/`, `src/app/developer/page.tsx`
- Env vars: `src/lib/developer/architecture-data.ts`
- External APIs: `src/lib/developer/status-snapshot.ts`
- Mocks: `src/lib/mocks/status.ts`
