# 03 — Baseline Summary

Generated: 2026-04-27T04:04:04.250Z

## Evidence completeness
All expected machine-readable result files were present at summary time.

## Environment
- Commit: `936d6de57efcfb850a9774eedc4967da568520e9`
- Branch: `main`
- Runtime: Node v25.8.0, Bun 1.3.10, Playwright Version 1.59.1

## Inventory counts
- Pages: 112
- Route handlers: 12
- Loading files: 92
- Client components: 654
- Server-action-like files: 168

## Frontend baseline
- Cold route duration p50/p95: 6948 ms / 39615 ms
- Warm route duration p50/p95: 3182 ms / 18455 ms
- FCP p50/p95: 420 ms / 19348 ms
- LCP proxy p50/p95: 744 ms / 22310 ms
- Request count p50/p95: 30 / 46
- Transfer p50/p95: 3702.0 KiB / 7608.6 KiB

### Slowest measured routes by cold p95
| Route | Cold p50 | Cold p95 | Warm p50 | FCP p50 | LCP p50 | Requests p50 | Transfer p50 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/pricing` | 9866 ms | 45727 ms | 2629 ms | 572 ms | 572 ms | 26 | 4137.6 KiB | 8 |
| `/dashboard/analytics` | 12600 ms | 43768 ms | 12544 ms | 3434 ms | 5060 ms | 28 | 8186.2 KiB | 13 |
| `/dashboard/3d-lab` | 18410 ms | 38129 ms | 5302 ms | 570 ms | 1102 ms | 29 | 5033.0 KiB | 7 |
| `/dashboard` | 12153 ms | 24815 ms | 11634 ms | 1976 ms | 3856 ms | 26 | 5335.1 KiB | 7 |
| `/register` | 7891 ms | 18549 ms | 6976 ms | 124 ms | 936 ms | 13 | 1191.4 KiB | 11 |
| `/login` | 13608 ms | 18085 ms | 7851 ms | 0 ms | 2388 ms | 3 | 38.2 KiB | 15 |
| `/dashboard/wiki` | 4699 ms | 17989 ms | 3530 ms | 490 ms | 1360 ms | 37 | 4941.8 KiB | 12 |
| `/contact` | 5176 ms | 11295 ms | 2583 ms | 368 ms | 368 ms | 38 | 3618.8 KiB | 10 |
| `/try` | 6195 ms | 8601 ms | 2834 ms | 534 ms | 534 ms | 30 | 3677.2 KiB | 14 |
| `/auth/reset-password` | 2605 ms | 8537 ms | 1825 ms | 368 ms | 368 ms | 27 | 4131.2 KiB | 6 |

## API/backend baseline
- Server reachable: yes
- API total duration p50/p95: 6 ms / 1985 ms

| Endpoint | Status codes | Runs | p50 | p95 | Supabase | Auth |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `/auth/callback` | 307 | 5 | 59 ms | 3122 ms | yes | yes |
| `/api/cron/compute-signals` | 401 | 5 | 4 ms | 938 ms | yes | no |
| `/api/cron/focus-review-scan` | 401 | 5 | 4 ms | 792 ms | yes | no |

## Supabase/static database baseline
- Query blocks: 538
- Tables/targets touched: 77
- select-star candidates: 9
- Missing-limit candidates: 160
- Live latency: blocked-without-live-read-only-credentialed-query-plan

## Build/bundle baseline
- Build exit codes: 0
- Build p50/p95: 42475 ms / 42475 ms
- Typecheck p50: 4334 ms

| Largest static asset | Size |
| --- | ---: |
| `.next/static/chunks/0aq1rnlgyew3d.js` | 2290.6 KiB |
| `.next/static/chunks/17vc1bv91yc08.js` | 848.4 KiB |
| `.next/static/chunks/07hg49jq684a3.js` | 452.2 KiB |
| `.next/static/chunks/0sr9g4ijcrk89.js` | 418.6 KiB |
| `.next/static/chunks/07rzc0e__82_h.js` | 396.7 KiB |
| `.next/static/chunks/0pg~8tlmtu~~m.css` | 366.2 KiB |
| `.next/static/chunks/17z2p.f04v3mf.js` | 265.3 KiB |
| `.next/static/chunks/03.b9z-1o34dx.js` | 255.6 KiB |
| `.next/static/chunks/0v8wvmjciv088.js` | 246.0 KiB |
| `.next/static/chunks/0b2acuj1-3gr-.js` | 246.0 KiB |

## Hotspot baseline
Static hotspot category counts live in `results/component_hotspot_inventory.json`.
- regexConstruction: 1774
- clientComponent: 666
- renderArrayWork: 656
- stateStormCandidate: 372
- sequentialAwait: 263
- clientFiltering: 215
- dynamicImportCandidate: 99
- r3fHeavy: 96
- expensiveFormatting: 64
- clientSorting: 57
