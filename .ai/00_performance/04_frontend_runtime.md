# 04 — Frontend Runtime Performance

Generated: 2026-04-27T02:09:50.810Z

## Measurement method
Playwright Chromium navigation tests measured cold and warm route loads with 3 repeat(s) per scenario. Metrics include wall-clock navigation proxy, Navigation Timing, paint timing, LCP/CLS observer proxies, long tasks, heap where Chromium exposes it, resource timings, request counts, transfer sizes, screenshots, and diagnostic traces.

## Route summary
| Route | Runs | Cold p50 ms | Cold p95 ms | Warm p50 ms | FCP p50 ms | LCP p50 ms | Requests p50 | Transfer p50 KiB | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 6 | 1447 | 1545 | 1378 | 82 | 82 | 60 | 325.4 | 0 |
| `/about` | 6 | 1377 | 1380 | 1331 | 48 | 48 | 57 | 294.9 | 0 |
| `/auth/reset-password` | 6 | 1344 | 1363 | 1319 | 42 | 42 | 42 | 270.7 | 0 |
| `/contact` | 6 | 1381 | 1382 | 1339 | 58 | 58 | 57 | 301.0 | 0 |
| `/forgot-password` | 6 | 1347 | 1349 | 1302 | 44 | 44 | 42 | 270.4 | 0 |
| `/login` | 6 | 1354 | 1361 | 1316 | 42 | 62 | 42 | 265.0 | 0 |
| `/pricing` | 6 | 1396 | 1402 | 1343 | 58 | 58 | 61 | 326.8 | 0 |
| `/register` | 6 | 1354 | 1357 | 1318 | 42 | 42 | 42 | 265.5 | 0 |
| `/try` | 6 | 1284 | 1285 | 1270 | 44 | 44 | 30 | 219.6 | 0 |
| `/dashboard` | 6 | 1358 | 1369 | 1321 | 42 | 68 | 42 | 265.0 | 0 |
| `/dashboard/settings` | 6 | 1351 | 1358 | 1315 | 44 | 64 | 42 | 265.0 | 0 |
| `/dashboard/wiki` | 6 | 1349 | 1369 | 1320 | 42 | 76 | 42 | 265.0 | 0 |
| `/dashboard/analytics` | 6 | 1346 | 1351 | 1308 | 42 | 66 | 42 | 265.0 | 0 |
| `/dashboard/3d-lab` | 6 | 1355 | 1361 | 1326 | 40 | 66 | 42 | 265.0 | 0 |

## Overall summary
- Cold duration p50/p95: 1354 / 1434 ms
- Warm duration p50/p95: 1320 / 1363 ms
- FCP p50/p95: 48 / 83 ms
- LCP p50/p95: 52 / 92 ms
- Requests p50/p95: 42 / 60
- Transferred bytes p50/p95: 231.2 / 629.6 KiB

## Evidence files
- Raw navigation JSON: `.ai/00_performance/results/frontend_navigation_results.json`
- Screenshots: `.ai/00_performance/screenshots/`
- Diagnostic traces: `.ai/00_performance/traces/`

## Limitations
- Local development/server measurements are not production RUM.
- Trace-enabled runs add overhead and should be used diagnostically.
- Auth-gated pages may measure redirect or demo-auth behavior depending on `PLAYWRIGHT_DEMO_AUTH`.
