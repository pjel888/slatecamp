# 03 — Baseline Summary

Generated: 2026-04-27T02:40:07.875Z

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
- Cold route duration p50/p95: 2907 ms / 19796 ms
- Warm route duration p50/p95: 2042 ms / 4759 ms
- FCP p50/p95: 216 ms / 8522 ms
- LCP proxy p50/p95: 496 ms / 8776 ms
- Request count p50/p95: 26 / 33
- Transfer p50/p95: 3652.2 KiB / 8510.4 KiB

### Slowest measured routes by cold p95
| Route | Cold p50 | Cold p95 | Warm p50 | FCP p50 | LCP p50 | Requests p50 | Transfer p50 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/dashboard/analytics` | 4881 ms | 55430 ms | 4550 ms | 1142 ms | 1752 ms | 33 | 6476.1 KiB | 28 |
| `/dashboard/3d-lab` | 3220 ms | 44219 ms | 2574 ms | 226 ms | 544 ms | 26 | 4859.7 KiB | 3 |
| `/dashboard/wiki` | 4537 ms | 18602 ms | 3939 ms | 1188 ms | 1532 ms | 28 | 5474.0 KiB | 5 |
| `/login` | 2735 ms | 11781 ms | 2799 ms | 228 ms | 840 ms | 30 | 2887.1 KiB | 1 |
| `/pricing` | 1549 ms | 9524 ms | 1565 ms | 116 ms | 116 ms | 25 | 4055.2 KiB | 0 |
| `/register` | 3494 ms | 8341 ms | 3080 ms | 220 ms | 978 ms | 30 | 6864.3 KiB | 1 |
| `/dashboard/settings` | 3927 ms | 7531 ms | 2049 ms | 214 ms | 370 ms | 26 | 5698.2 KiB | 0 |
| `/dashboard` | 3174 ms | 6897 ms | 4705 ms | 426 ms | 1864 ms | 31 | 5295.6 KiB | 7 |
| `/contact` | 2028 ms | 5124 ms | 1565 ms | 116 ms | 116 ms | 24 | 3487.6 KiB | 0 |
| `/auth/reset-password` | 2090 ms | 5062 ms | 1545 ms | 88 ms | 88 ms | 20 | 4053.9 KiB | 0 |

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
