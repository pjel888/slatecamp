# ROUTE_SURFACE_MAP

## Current route counts

- `124` pages
- `16` layouts
- `95` loading files
- `9` error boundaries
- `12` route handlers

## Major route surfaces

| Surface | Purpose | Ownership shape | Risk profile | Key dependencies | Documentation state |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | primary learner experience | route groups + shared components + actions + queries | high | `src/components/dashboard`, `src/lib/actions`, Supabase, entitlements | broad docs exist, but route-by-route runtime understanding still needs curated summaries |
| `/admin` | content, review, publishing, taxonomy, knowledge/question management | route-heavy internal tool surface | high | `src/components/admin`, `src/lib/actions/admin`, `src/lib/admin`, auth/roles | under-documented for Codex operations; this run adds explicit audit/plan |
| `/developer` | internal docs, tools, status, DB/log inspection | internal engineering support surface | high leverage, medium trust risk | `src/app/developer/*`, `src/lib/actions/dev`, `src/lib/mocks/status`, audit/logging | strongest Codex leverage surface, but currently mixes mock and real views |
| `/ceo` via `(protected)` | business analytics, financials, team | small but sensitive protected portal | medium-high | entitlements, finance/payment data, protected layouts | documented, but lower operational frequency |
| `/quiz` | mode setup, sessions, results, review | runtime flow surface with shared engine | high | `src/lib/quiz`, `src/lib/actions/quiz-v2`, stores | Unified to canonical underscored keys (focus_review, full_exam). Architecture is sound. |
| `/calculators` | grouped material calculators | bounded surface | medium | route-local libs/stores, shared UI | moderate |
| `/tools` | standalone utility tools | bounded surface | medium | calculators/tools libs, shared UI | moderate |
| `/api` | AI, payments, cron, admin flags, webhooks, auth callback | route handlers + external integrations | high | env vars, auth, payments, Supabase, cron secret | sensitive and under a single runtime map would help Codex |

## High-value future Codex audit targets

1. `/developer`
2. `/admin`
3. `/api/webhooks` and `/api/cron`
4. `dashboard/3d-lab`
5. `dashboard/testing` and `quiz/*`
