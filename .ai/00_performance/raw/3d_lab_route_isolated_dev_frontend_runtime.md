# 04 — Frontend Runtime Performance

Generated: 2026-04-27T02:00:45.346Z

## Measurement method
Playwright Chromium navigation tests measured cold and warm route loads with 3 repeat(s) per scenario. Metrics include wall-clock navigation proxy, Navigation Timing, paint timing, LCP/CLS observer proxies, long tasks, heap where Chromium exposes it, resource timings, request counts, transfer sizes, screenshots, and diagnostic traces.

## Route summary
| Route | Runs | Cold p50 ms | Cold p95 ms | Warm p50 ms | FCP p50 ms | LCP p50 ms | Requests p50 | Transfer p50 KiB | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/dashboard/3d-lab` | 6 | 2566 | 20513 | 2199 | 260 | 426 | 26 | 5676.6 | 2 |

## Overall summary
- Cold duration p50/p95: 2566 / 20513 ms
- Warm duration p50/p95: 2199 / 3584 ms
- FCP p50/p95: 260 / 14717 ms
- LCP p50/p95: 426 / 15261 ms
- Requests p50/p95: 26 / 27
- Transferred bytes p50/p95: 5676.6 / 8295.8 KiB

## Evidence files
- Raw navigation JSON: `.ai/00_performance/results/frontend_navigation_results.json`
- Screenshots: `.ai/00_performance/screenshots/`
- Diagnostic traces: `.ai/00_performance/traces/`

## Limitations
- Local development/server measurements are not production RUM.
- Trace-enabled runs add overhead and should be used diagnostically.
- Auth-gated pages may measure redirect or demo-auth behavior depending on `PLAYWRIGHT_DEMO_AUTH`.
