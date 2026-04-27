# 27 — 3D Lab Runtime / Memory Isolation

Generated: 2026-04-27T02:14:57.747Z

## Status
Route-isolated measurement is now supported with `PERF_ROUTE_FILTER`. The isolated dev-server and built-app 3D Lab runs both completed, so the previous full-suite failure is isolated to full-suite/dev-server pressure rather than an always-failing route.

## Harness change
- Added `PERF_ROUTE_FILTER` to `.ai/00_performance/playwright/perf.spec.ts`.
- When a route filter is present, user flows are skipped unless `PERF_USER_FLOWS=true` is explicitly set.

## Isolated dev-server result before metadata split
| Metric | Value |
| --- | ---: |
| Final URL | `http://localhost:3217/dashboard/3d-lab` |
| Cold p50 / p95 | 2566 ms / 20513 ms |
| Warm p50 / p95 | 2199 ms / 3584 ms |
| Requests p50 | 26 |
| Transfer p50 | 5676.6 KiB |
| Error count | 2 |
| Used JS heap range | 153320.3 KiB – 296875.0 KiB |

Evidence: `.ai/00_performance/results/3d_lab_route_isolated_dev.json`, log `.ai/00_performance/logs/loop2-3d-route-dev-before.log`.

## Isolated built-app result before metadata split
| Metric | Value |
| --- | ---: |
| Final URL | `http://localhost:3217/login?next=%2Fdashboard%2F3d-lab` |
| Cold p50 / p95 | 1363 ms / 1413 ms |
| Warm p50 / p95 | 1318 ms / 1336 ms |
| Requests p50 | 42 |
| Transfer p50 | 265.0 KiB |
| Error count | 0 |

Built-app route still resolves to login redirect, not authenticated 3D Lab content. Evidence: `.ai/00_performance/results/3d_lab_route_isolated_built.json`.

## Memory/runtime finding
- Isolated dev route completed without a memory-threshold restart in both before and after runs.
- Full-suite dev run previously failed after many routes, so the remaining blocker is full-suite cumulative dev-server pressure plus 3D Lab route cost.
- Console still reports an internal Next router-action initialization error during dev 3D route runs; preserve as a runtime signal.

## Chunk/import finding before split
- Registry source scan found 209 direct config imports in category registry files.
- Hub route chunk profile before split: raw 2120.8 KiB, gzip 592.7 KiB, unique chunks 27, 3D signal modules 4.

## Evidence files
- `.ai/00_performance/results/3d_lab_route_isolated_dev.json`
- `.ai/00_performance/results/3d_lab_route_isolated_built.json`
- `.ai/00_performance/results/3d_lab_chunk_profile_before_corrected.json`
- `.ai/00_performance/logs/loop2-3d-route-dev-before.log`
- `.ai/00_performance/logs/loop2-3d-route-built-before.log`
