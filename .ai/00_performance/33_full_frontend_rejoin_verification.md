# 33 — Full Frontend Rejoin Verification

Generated: 2026-04-27T02:37:09Z

## Verdict
`/dashboard/3d-lab` can rejoin the full local dev frontend performance suite as a **warning-only** route. The prior timeout/browser-context-close blocker did not reproduce in this exact run.

## Evidence
| Item | Result |
| --- | --- |
| Command | `bun run perf:frontend` |
| Exit code | `0` |
| Playwright summary | `15 passed (9.6m)` |
| Log | `.ai/00_performance/logs/loop3-full-perf-frontend-after-metadata.log` |
| Raw result | `.ai/00_performance/results/frontend_navigation_results.json` |
| Route filter | none — full route suite |
| Memory-threshold restart warning | yes |
| Fast Refresh reload warning | yes |

## `/dashboard/3d-lab` full-suite metrics
| Metric | Value |
| --- | ---: |
| Cold p50 / p95 | 3220 ms / 44219 ms |
| Warm p50 / p95 | 2574 ms / 3019 ms |
| Requests p50 / p95 | 26 / 26 |
| Transfer p50 / p95 | 4859.7 KiB / 7389.5 KiB |
| FCP p50 / p95 | 226 ms / 33614 ms |
| LCP p50 / p95 | 544 ms / 33846 ms |
| Error count | 3 |

## Interpretation
- The previous red blocker is resolved for local dev full-suite completion: Playwright finished all 15 tests with exit 0.
- This is not ready for a hard gate: one cold 3D run still carried a large dev-server compile/restart outlier, and Next emitted a memory-threshold restart warning.
- Built-app authenticated 3D timing remains a separate blocker because protected built routes still need safe credentials/demo build support.

## Gate decision
- Full `bun run perf:frontend`: may run in warning-only CI/nightly lanes.
- `/dashboard/3d-lab`: keep in the full suite, but preserve the route-isolated lane for diagnosis.
- Hard gate prerequisite: three comparable full-suite passes without memory-threshold restarts, plus authenticated built-app content timing.
