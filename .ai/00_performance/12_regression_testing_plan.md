# 12 — Regression Testing Plan

Generated: 2026-04-27T04:04:04.250Z

## Repeatable commands
- `bun run perf:inventory`
- `bun run perf:environment`
- `bun run perf:frontend`
- `bun run perf:api`
- `bun run perf:supabase`
- `bun run perf:build`
- `bun run perf:hotspots`
- `bun run perf:summary`
- `bun run perf:all`

## What should run where
| Test | CI? | Manual? | Reason |
| --- | --- | --- | --- |
| Inventory/static scans | yes | yes | Fast, deterministic, catches route/query drift. |
| Supabase static query inventory | yes | yes | Read-only and no credentials needed. |
| Hotspot static scan | yes warning-only | yes | Static signals are useful but not pass/fail proof. |
| Build/typecheck perf | yes warning-only initially | yes | Build time is environment-dependent. |
| Frontend Playwright route perf | nightly or pre-release | yes | Valuable but variance requires tolerance. |
| API GET benchmark | nightly when test server available | yes | Needs reachable target and fixtures. |
| Live Supabase EXPLAIN/latency | no by default | yes/staging | Requires safe read-only credentials. |
| AI/payment provider timing | no by default | yes with mocks/staging | External noise and secrets make normal CI unsuitable. |

## Baseline update workflow
1. Run `bun run perf:all` on a clean machine or CI runner.
2. Store JSON artifacts under `.ai/00_performance/results`.
3. Compare p50/p75/p95/p99 and error/timeout rates.
4. Update baseline docs only with measured evidence.
5. Do not loosen budgets without noting product reason and evidence.
