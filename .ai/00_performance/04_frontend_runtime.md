# 04 — Frontend Runtime Performance

Generated: 2026-04-27T02:37:08.393Z

## Measurement method
Playwright Chromium navigation tests measured cold and warm route loads with 3 repeat(s) per scenario. Metrics include wall-clock navigation proxy, Navigation Timing, paint timing, LCP/CLS observer proxies, long tasks, heap where Chromium exposes it, resource timings, request counts, transfer sizes, screenshots, and diagnostic traces.

## Route summary
| Route | Runs | Cold p50 ms | Cold p95 ms | Warm p50 ms | FCP p50 ms | LCP p50 ms | Requests p50 | Transfer p50 KiB | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 6 | 3040 | 3473 | 1764 | 410 | 410 | 28 | 3489.9 | 4 |
| `/about` | 6 | 1551 | 3393 | 1548 | 112 | 112 | 24 | 3404.5 | 0 |
| `/auth/reset-password` | 6 | 2090 | 5062 | 1545 | 88 | 88 | 20 | 4053.9 | 0 |
| `/contact` | 6 | 2028 | 5124 | 1565 | 116 | 116 | 24 | 3487.6 | 0 |
| `/forgot-password` | 6 | 2001 | 4751 | 1550 | 100 | 100 | 21 | 4101.9 | 0 |
| `/login` | 6 | 2735 | 11781 | 2799 | 228 | 840 | 30 | 2887.1 | 1 |
| `/pricing` | 6 | 1549 | 9524 | 1565 | 116 | 116 | 25 | 4055.2 | 0 |
| `/register` | 6 | 3494 | 8341 | 3080 | 220 | 978 | 30 | 6864.3 | 1 |
| `/try` | 6 | 1550 | 3923 | 1558 | 92 | 92 | 21 | 3685.0 | 0 |
| `/dashboard` | 6 | 3174 | 6897 | 4705 | 426 | 1864 | 31 | 5295.6 | 7 |
| `/dashboard/settings` | 6 | 3927 | 7531 | 2049 | 214 | 370 | 26 | 5698.2 | 0 |
| `/dashboard/wiki` | 6 | 4537 | 18602 | 3939 | 1188 | 1532 | 28 | 5474.0 | 5 |
| `/dashboard/analytics` | 6 | 4881 | 55430 | 4550 | 1142 | 1752 | 33 | 6476.1 | 28 |
| `/dashboard/3d-lab` | 6 | 3220 | 44219 | 2574 | 226 | 544 | 26 | 4859.7 | 3 |

## Overall summary
- Cold duration p50/p95: 2907 / 19796 ms
- Warm duration p50/p95: 2042 / 4759 ms
- FCP p50/p95: 216 / 8522 ms
- LCP p50/p95: 496 / 8776 ms
- Requests p50/p95: 26 / 33
- Transferred bytes p50/p95: 3652.2 / 8510.4 KiB

## Evidence files
- Raw navigation JSON: `.ai/00_performance/results/frontend_navigation_results.json`
- Screenshots: `.ai/00_performance/screenshots/`
- Diagnostic traces: `.ai/00_performance/traces/`

## Limitations
- Local development/server measurements are not production RUM.
- Trace-enabled runs add overhead and should be used diagnostically.
- Auth-gated pages may measure redirect or demo-auth behavior depending on `PLAYWRIGHT_DEMO_AUTH`.
