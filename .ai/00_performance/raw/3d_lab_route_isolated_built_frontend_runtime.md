# 04 — Frontend Runtime Performance

Generated: 2026-04-27T02:00:58.927Z

## Measurement method
Playwright Chromium navigation tests measured cold and warm route loads with 3 repeat(s) per scenario. Metrics include wall-clock navigation proxy, Navigation Timing, paint timing, LCP/CLS observer proxies, long tasks, heap where Chromium exposes it, resource timings, request counts, transfer sizes, screenshots, and diagnostic traces.

## Route summary
| Route | Runs | Cold p50 ms | Cold p95 ms | Warm p50 ms | FCP p50 ms | LCP p50 ms | Requests p50 | Transfer p50 KiB | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/dashboard/3d-lab` | 6 | 1363 | 1413 | 1318 | 40 | 72 | 42 | 265.0 | 0 |

## Overall summary
- Cold duration p50/p95: 1363 / 1413 ms
- Warm duration p50/p95: 1318 / 1336 ms
- FCP p50/p95: 40 / 80 ms
- LCP p50/p95: 72 / 116 ms
- Requests p50/p95: 42 / 42
- Transferred bytes p50/p95: 265.0 / 520.7 KiB

## Evidence files
- Raw navigation JSON: `.ai/00_performance/results/frontend_navigation_results.json`
- Screenshots: `.ai/00_performance/screenshots/`
- Diagnostic traces: `.ai/00_performance/traces/`

## Limitations
- Local development/server measurements are not production RUM.
- Trace-enabled runs add overhead and should be used diagnostically.
- Auth-gated pages may measure redirect or demo-auth behavior depending on `PLAYWRIGHT_DEMO_AUTH`.
