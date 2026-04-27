# 32 — Next Regression Gates Update

Generated: 2026-04-27T02:14:57.748Z

## Can `/dashboard/3d-lab` rejoin the full frontend suite?
Not yet as a hard gate. Route-isolated dev and built runs now pass, but the prior full dev suite failed after cumulative server pressure. The final full-suite attempt for this loop must decide whether it is fixed or still blocked.

## Current 3D budgets
| Budget | Current evidence | Warning threshold | Hard failure status |
| --- | ---: | ---: | --- |
| 3D hub raw manifest chunk bytes | 1146.2 KiB | +10% over latest comparable baseline | warning-only |
| 3D hub gzip manifest chunk bytes | 341.6 KiB | +10% over latest comparable baseline | warning-only |
| 3D dev isolated cold p95 | 26058 ms | +20% after 3 comparable isolated baselines | warning-only; noisy dev compile waits |
| 3D built public redirect cold p95 | 1408 ms | +20% after 3 comparable redirect baselines | warning-only; not authenticated content |
| Registry direct config imports | 0 | any increase above 0 | candidate hard static gate after review |

## Current comparable baselines
- Local dev broad baseline: 1 accepted baseline.
- Dashboard remediation local comparison: 1 before/after comparison.
- 3D route-isolated dev: 1 before/after pair.
- 3D built public redirect: 1 before/after pair.
- Authenticated built-app: 0 comparable baselines.

## Gate recommendations
1. Keep full `bun run perf:frontend` warning-only until 3D full-suite stability is proven.
2. Add route-isolated `PERF_ROUTE_FILTER=/dashboard/3d-lab bun run perf:frontend` as the near-term 3D regression lane.
3. Add static registry guard as a stronger gate: category registry files must not import `config/modules`.
4. Keep built-app public nav warning-only because protected routes can be login redirects.
5. Do not enable hard gates until at least three comparable baselines exist for the same mode and auth state.

## Next hard-gate prerequisites
- Authenticated built-app fixture is available without secrets in repo.
- Full frontend suite passes repeatedly or excludes 3D behind a separately measured route lane.
- 3D chunk budget is stable after metadata split.
- CI runner variance is known.
