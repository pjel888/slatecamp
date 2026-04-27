# 36 — 3D Hard-Gate Eligibility Decision

Generated: 2026-04-27T04:03:39Z

## Decision
`/dashboard/3d-lab` is **measurable and eligible for warning-only regression gates**, but it is **not yet hard-gate eligible in the full local dev suite**.

## Why
| Requirement | Evidence | Decision |
| --- | --- | --- |
| Isolated route no longer crashes/timeouts | Isolated dev run passed; max RSS 1925.6 MiB; no memory warnings. | Passed |
| Ordered route sequence can isolate cumulative pressure | Analytics→3D and Dashboard→Wiki→Analytics→3D runs passed without memory warnings. | Passed |
| Full local dev suite can complete | Full `bun run perf:frontend` passed: `15 passed (19.5m)`. | Passed for observability |
| Full local dev suite avoids memory-threshold restart | Full run emitted 2 memory-threshold warning(s); max RSS 2476.2 MiB. | Failed for hard gate |
| Built-app authenticated 3D timing exists | Demo-auth built route stayed on `/dashboard/3d-lab`, content signals show interactive modules available, cold p95 1,556 ms, warm p95 1,356 ms. | Passed |

## Gate recommendation
1. Keep full local dev `bun run perf:frontend` as **warning-only** while memory-threshold restarts persist.
2. Add a route-isolated 3D lane as the stable short-term gate candidate:
   ```bash
   PERF_ROUTE_FILTER=/dashboard/3d-lab PERF_USER_FLOWS=false bun run perf:frontend
   ```
3. Add built-app authenticated 3D as the production-like gate candidate:
   ```bash
   bun run perf:build:demo-auth
   PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false PERF_ROUTE_FILTER=/dashboard/3d-lab PERF_ROUTE_LIMIT=1 bun run perf:frontend
   ```
4. Do not hard-fail CI on these budgets until there are at least three comparable runs from the same runner/mode/auth state.

## Proposed warning budgets from this loop
| Lane | Metric | Current | Warning threshold | Hard-gate readiness |
| --- | --- | ---: | ---: | --- |
| Dev route-isolated 3D | Server RSS max | 1925.6 MiB | > 2.25 GiB or any memory warning | warning-only |
| Four-route dev sequence | Server RSS max | 2395.7 MiB | > 2.50 GiB or any memory warning | warning-only |
| Full local dev suite | Memory warnings | 2 | any warning | not hard-gate ready |
| Built auth 3D | Cold p95 | 1,556 ms | > 2,000 ms after 3 comparable baselines | candidate |
| Built auth 3D | Server RSS max | 211.7 MiB | > 300 MiB after 3 comparable baselines | candidate |
| Built auth 3D | Auth/content signal | authenticated content | any login redirect/locked copy | candidate hard assertion |

## Next loop
- Investigate why the full dev suite still accumulates enough pressure to trigger the Next memory-threshold restart even though isolated/short route sequences pass.
- Track route order, route heap, and server RSS deltas per route over three comparable full-suite runs.
- Keep built-app authenticated 3D as the preferred production-like regression lane.
