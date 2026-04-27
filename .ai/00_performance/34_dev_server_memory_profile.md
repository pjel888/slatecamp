# 34 — Dev-Server Memory Profiler and Route Sequence Isolation

Generated: 2026-04-27T04:03:39Z

## What changed
- `scripts/playwright-web-server.ts` now samples the local Next server process tree RSS/VSZ every second and writes JSON profiles under `.ai/00_performance/results/dev_server_memory_profile_<label>.json`.
- `.ai/00_performance/playwright/perf.spec.ts` now records the server-memory profile path, aggregate RSS stats, browser heap summaries, and route-selection metadata in `frontend_navigation_results.json`.
- The frontend harness now supports `PERF_ROUTE_SEQUENCE` so cumulative route-order memory behavior can be measured without running the whole suite first.

## New knobs
| Env var | Purpose |
| --- | --- |
| `PERF_MEMORY_PROFILE_LABEL=<label>` | Names the memory profile output file. |
| `PERF_MEMORY_PROFILE_FILE=<path>` | Overrides the exact memory profile path. |
| `PERF_DEV_SERVER_MEMORY_PROFILE=false` | Disables process-tree memory sampling. |
| `PERF_ROUTE_SEQUENCE=/dashboard,/dashboard/wiki,/dashboard/analytics,/dashboard/3d-lab` | Runs selected routes in that exact order. |

## Memory-profile evidence
| Scenario | Profile | Samples | Max RSS | Last RSS | Max process count | Memory warnings |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 3D isolated dev | `dev_server_memory_profile_loop4-3d-isolated.json` | 60 | 1925.6 MiB | 911.6 MiB | 2 | 0 |
| Analytics → 3D dev sequence | `dev_server_memory_profile_loop4-analytics-3d-sequence.json` | 177 | 2142.2 MiB | 847.0 MiB | 2 | 0 |
| Dashboard → Wiki → Analytics → 3D dev sequence | `dev_server_memory_profile_loop4-dashboard-wiki-analytics-3d-sequence.json` | 296 | 2395.7 MiB | 747.2 MiB | 2 | 0 |
| Full local dev frontend suite | `dev_server_memory_profile_loop4-full-frontend.json` | 1169 | 2476.2 MiB | 795.8 MiB | 2 | 2 |
| Built-app authenticated 3D | `dev_server_memory_profile_loop4-built-auth-3d.json` | 12 | 211.7 MiB | 211.7 MiB | 1 | 0 |

## 3D route timing under isolated/sequence modes
| Scenario | Cold p50 | Cold p95 | Warm p50 | Warm p95 | Requests p50 | Transfer p50 | Browser heap p95 | Server RSS max | Memory warning |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 3D isolated dev | 3,858 ms | 23,240 ms | 2,757 ms | 3,564 ms | 38 | 4888.8 KiB | 358.6 MiB | 1925.6 MiB | no |
| Analytics → 3D dev sequence | 6,305 ms | 23,103 ms | 2,912 ms | 4,464 ms | 38 | 4896.9 KiB | 353.8 MiB | 2142.2 MiB | no |
| Dashboard → Wiki → Analytics → 3D dev sequence | 3,934 ms | 30,426 ms | 2,609 ms | 7,743 ms | 37 | 5651.3 KiB | 308.8 MiB | 2395.7 MiB | no |
| Full local dev suite | 18,410 ms | 38,129 ms | 5,302 ms | 8,436 ms | 29 | 5033.0 KiB | 275.1 MiB | 2476.2 MiB | yes |
| Built-app authenticated 3D | 1,377 ms | 1,556 ms | 1,336 ms | 1,356 ms | 51 | 352.4 KiB | 10.0 MiB | 211.7 MiB | no |

## Interpretation
- `/dashboard/3d-lab` is no longer an isolated dev-server crash: the isolated run and two shorter ordered sequences completed without memory-threshold warnings.
- The full local dev suite still emitted memory-threshold restart warnings, with max sampled RSS 2476.2 MiB. This keeps the dev-server full suite warning-only for gating.
- Built-app authenticated `/dashboard/3d-lab` is much lighter in local server memory (211.7 MiB) because it uses `next start` against a compiled app rather than cumulative dev compilation.

## Evidence files
- Isolated dev nav: `.ai/00_performance/results/loop4_3d_isolated_memory_navigation.json`
- Analytics/3D sequence nav: `.ai/00_performance/results/loop4_analytics_3d_sequence_memory_navigation.json`
- Four-route sequence nav: `.ai/00_performance/results/loop4_dashboard_wiki_analytics_3d_sequence_memory_navigation.json`
- Full-suite nav: `.ai/00_performance/results/loop4_full_frontend_memory_navigation.json`
- Full-suite log: `.ai/00_performance/logs/loop4-full-frontend-memory.log`
