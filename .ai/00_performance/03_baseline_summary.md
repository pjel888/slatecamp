# 03 — Baseline Summary

Generated: 2026-04-27T02:16:56.448Z

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
- Cold route duration p50/p95: 1354 ms / 1434 ms
- Warm route duration p50/p95: 1320 ms / 1363 ms
- FCP p50/p95: 48 ms / 83 ms
- LCP proxy p50/p95: 52 ms / 92 ms
- Request count p50/p95: 42 / 60
- Transfer p50/p95: 231.2 KiB / 629.6 KiB

### Slowest measured routes by cold p95
| Route | Cold p50 | Cold p95 | Warm p50 | FCP p50 | LCP p50 | Requests p50 | Transfer p50 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 1447 ms | 1545 ms | 1378 ms | 82 ms | 82 ms | 60 | 325.4 KiB | 0 |
| `/pricing` | 1396 ms | 1402 ms | 1343 ms | 58 ms | 58 ms | 61 | 326.8 KiB | 0 |
| `/contact` | 1381 ms | 1382 ms | 1339 ms | 58 ms | 58 ms | 57 | 301.0 KiB | 0 |
| `/about` | 1377 ms | 1380 ms | 1331 ms | 48 ms | 48 ms | 57 | 294.9 KiB | 0 |
| `/dashboard/wiki` | 1349 ms | 1369 ms | 1320 ms | 42 ms | 76 ms | 42 | 265.0 KiB | 0 |
| `/dashboard` | 1358 ms | 1369 ms | 1321 ms | 42 ms | 68 ms | 42 | 265.0 KiB | 0 |
| `/auth/reset-password` | 1344 ms | 1363 ms | 1319 ms | 42 ms | 42 ms | 42 | 270.7 KiB | 0 |
| `/dashboard/3d-lab` | 1355 ms | 1361 ms | 1326 ms | 40 ms | 66 ms | 42 | 265.0 KiB | 0 |
| `/login` | 1354 ms | 1361 ms | 1316 ms | 42 ms | 62 ms | 42 | 265.0 KiB | 0 |
| `/dashboard/settings` | 1351 ms | 1358 ms | 1315 ms | 44 ms | 64 ms | 42 | 265.0 KiB | 0 |

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
