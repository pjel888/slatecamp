# 13 — CI Performance Gates

Generated: 2026-04-27T04:04:04.250Z

## Gate philosophy
Initial CI gates should be warning-first and based on current baseline plus tolerance. Hard failures should wait for at least 3 comparable CI baseline runs.

## Proposed budgets
| Metric | Current baseline | Warning threshold | Failure threshold | Notes |
| --- | ---: | ---: | ---: | --- |
| Frontend cold route p95 | 39615 ms | baseline + 20% | baseline + 35% | Use per-route budgets when stable. |
| Frontend warm route p95 | 18455 ms | baseline + 20% | baseline + 35% | Warm regressions often indicate JS/render bloat. |
| Route request count p95 | 46 | baseline + 10 requests | baseline + 20 requests | Gate by route family after history exists. |
| Route transfer p95 | 7608.6 KiB | baseline + 15% | baseline + 30% | Prefer built app for CI. |
| API GET p95 | 1985 ms | baseline + 20% | baseline + 40% | Static GET endpoints only. |
| Build time p95 | 42475 ms | baseline + 15% | baseline + 30% | Runner-specific. |
| Typecheck duration | 4334 ms | baseline + 20% | baseline + 40% | Less noisy than Playwright. |
| Supabase select-star count | 9 | any increase | high-traffic increase | Needs allowlist. |
| Supabase missing-limit candidates | 160 | high-traffic increase | high-traffic increase | Needs allowlist. |

## Recommended CI commands
- Pull request warning lane: `bun run perf:inventory && bun run perf:supabase && bun run perf:hotspots && bun run perf:summary`
- Nightly baseline lane: `PLAYWRIGHT_USE_BUILT_APP=true bun run perf:frontend && bun run perf:api && bun run perf:build && bun run perf:summary`
- Release lane: full `bun run perf:all` against production-like build and safe staging credentials.
