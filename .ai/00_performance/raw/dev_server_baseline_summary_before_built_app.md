# 03 — Baseline Summary

Generated: 2026-04-26T23:52:53.452Z

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
- Cold route duration p50/p95: 3469 ms / 25158 ms
- Warm route duration p50/p95: 2150 ms / 3965 ms
- FCP p50/p95: 262 ms / 14184 ms
- LCP proxy p50/p95: 672 ms / 15760 ms
- Request count p50/p95: 25 / 32
- Transfer p50/p95: 3666.5 KiB / 8762.6 KiB

### Slowest measured routes by cold p95
| Route | Cold p50 | Cold p95 | Warm p50 | FCP p50 | LCP p50 | Requests p50 | Transfer p50 | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/pricing` | 14212 ms | 25584 ms | 2581 ms | 724 ms | 724 ms | 25 | 4055.3 KiB | 0 |
| `/dashboard/3d-lab` | 14662 ms | 24417 ms | 2734 ms | 368 ms | 722 ms | 25 | 7404.1 KiB | 3 |
| `/dashboard/analytics` | 13509 ms | 23420 ms | 2347 ms | 278 ms | 1096 ms | 32 | 5827.2 KiB | 30 |
| `/dashboard` | 10265 ms | 15046 ms | 2986 ms | 348 ms | 1446 ms | 28 | 5274.8 KiB | 4 |
| `/dashboard/wiki` | 9301 ms | 14909 ms | 8970 ms | 4668 ms | 5258 ms | 30 | 6572.6 KiB | 10 |
| `/register` | 7946 ms | 12661 ms | 2609 ms | 226 ms | 674 ms | 30 | 4875.1 KiB | 0 |
| `/dashboard/settings` | 6640 ms | 9368 ms | 2111 ms | 266 ms | 606 ms | 26 | 5696.7 KiB | 0 |
| `/login` | 6228 ms | 8969 ms | 3188 ms | 282 ms | 712 ms | 30 | 4875.1 KiB | 2 |
| `/auth/reset-password` | 3582 ms | 5435 ms | 1527 ms | 86 ms | 86 ms | 20 | 4053.9 KiB | 0 |
| `/contact` | 3074 ms | 4411 ms | 1577 ms | 130 ms | 130 ms | 24 | 3487.7 KiB | 0 |

## API/backend baseline
- Server reachable: yes
- API total duration p50/p95: 6 ms / 1985 ms

| Endpoint | Status codes | Runs | p50 | p95 | Supabase | Auth |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `/auth/callback` | 307 | 5 | 59 ms | 3122 ms | yes | yes |
| `/api/cron/compute-signals` | 401 | 5 | 4 ms | 938 ms | yes | no |
| `/api/cron/focus-review-scan` | 401 | 5 | 4 ms | 792 ms | yes | no |

## Supabase/static database baseline
- Query blocks: 536
- Tables/targets touched: 77
- select-star candidates: 19
- Missing-limit candidates: 160
- Live latency: blocked-without-live-read-only-credentialed-query-plan

## Build/bundle baseline
- Build exit codes: 0
- Build p50/p95: 44495 ms / 44495 ms
- Typecheck p50: 4826 ms

| Largest static asset | Size |
| --- | ---: |
| `.next/static/chunks/0aq1rnlgyew3d.js` | 2290.6 KiB |
| `.next/static/chunks/0kpyerzetvm~g.js` | 936.8 KiB |
| `.next/static/chunks/0srwmq.6u~cbw.js` | 936.8 KiB |
| `.next/static/chunks/10gsoxk4mzxp8.js` | 936.8 KiB |
| `.next/static/chunks/10mgmknsae0t2.js` | 936.8 KiB |
| `.next/static/chunks/0pclgbr04u_mp.js` | 936.8 KiB |
| `.next/static/chunks/177u.7.c6t3~e.js` | 936.8 KiB |
| `.next/static/chunks/0e1dyrt891~k_.js` | 936.8 KiB |
| `.next/static/chunks/0t86r95jzx79c.js` | 882.0 KiB |
| `.next/static/chunks/148-721w_3jy1.js` | 882.0 KiB |

## Hotspot baseline
Static hotspot category counts live in `results/component_hotspot_inventory.json`.
- regexConstruction: 1774
- clientComponent: 666
- renderArrayWork: 656
- stateStormCandidate: 371
- sequentialAwait: 263
- clientFiltering: 215
- dynamicImportCandidate: 99
- r3fHeavy: 96
- expensiveFormatting: 64
- clientSorting: 57
