# ROUTE_SURFACE_MAP

## Current route counts

- `118` pages
- `14` layouts
- `95` loading files
- `7` error boundaries
- `11` route handlers

## Major route surfaces

| Surface | Purpose | Ownership shape | Risk profile | Key dependencies | Documentation state |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | primary learner experience | route groups + shared components + actions + queries | high | `src/components/dashboard`, `src/lib/actions`, Supabase, entitlements | broad docs exist, but route-by-route runtime understanding still needs curated summaries |
| `/admin` | content, review, publishing, taxonomy, knowledge/question management | route-heavy internal tool surface | high | `src/components/admin`, `src/lib/actions/admin`, `src/lib/admin`, auth/roles | under-documented for Codex operations; this run adds explicit audit/plan |
| `/developer` | internal docs, tools, status, DB/log inspection | internal engineering support surface | high leverage, medium trust risk | `src/app/developer/*`, `src/lib/actions/dev`, `src/lib/mocks/status`, audit/logging | strongest Codex leverage surface, but currently mixes mock and real views |
| `/ceo` via `(protected)` | business analytics, financials, team | small but sensitive protected portal | medium-high | entitlements, finance/payment data, protected layouts | documented, but lower operational frequency |
| `/dashboard/quiz` | canonical dashboard-owned quiz hub, sessions, results, review | runtime flow surface with shared engine and dashboard shell/sidebar | high | `src/app/dashboard/quiz`, `src/components/testing/hub`, `src/components/quiz-v2`, `src/lib/quiz`, `src/lib/actions/quiz-v2`, stores | Canonical learner quiz route. `/quiz/*` and `/dashboard/drills*` are compatibility redirects. |
| `/tools` | canonical public utility and calculator namespace | bounded surface | medium | `src/app/tools`, calculator engines/stores, shared UI | current; `/calculators/*` redirects here |
| `/api` | AI, payments, cron, admin flags, webhooks, auth callback | route handlers + external integrations | high | env vars, auth, payments, Supabase, cron secret | sensitive and under a single runtime map would help Codex |

## High-value future Codex audit targets

1. `/developer`
2. `/admin`
3. `/api/webhooks` and `/api/cron`
4. `dashboard/3d-lab`
5. `dashboard/quiz/*` plus legacy `/quiz/*` and `/dashboard/drills*` redirect compatibility


## 2026-05-01 quiz route consolidation note

- Canonical learner quiz entry is `/dashboard/quiz`; `/quiz` and `/dashboard/drills` redirect there and should not receive new product work.
- Canonical history is `/dashboard/quiz/sessions`; `/quiz/sessions` and `/dashboard/drills/sessions` redirect there.
- Canonical session/result/review URLs are `/dashboard/quiz/session/[sessionId]`, `/dashboard/quiz/session/[sessionId]/results`, and `/dashboard/quiz/session/[sessionId]/review`; legacy `/quiz/session/*` and modeful `/quiz/[mode]/session/*` URLs remain compatibility wrappers.
- The standard Quiz is the only general quiz mode. Design Quiz and Endurance Quiz remain separate because they test different task shapes.


## 2026-04-30 tools/calculators route consolidation note

- Canonical public utility namespace is `/tools`.
- Former `/calculators` route pages were removed; `/calculators` and `/calculators/:path*` redirect to `/tools` and `/tools/:path*`.
- Calculator engines and Zustand stores remain under `src/app/calculators/_lib` and `_stores` until a later non-route code-ownership move.
