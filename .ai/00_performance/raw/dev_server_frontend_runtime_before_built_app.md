# 04 — Frontend Runtime Performance

Generated: 2026-04-26T17:49:07.761Z

## Measurement method
Playwright Chromium navigation tests measured cold and warm route loads with 2 repeat(s) per scenario. Metrics include wall-clock navigation proxy, Navigation Timing, paint timing, LCP/CLS observer proxies, long tasks, heap where Chromium exposes it, resource timings, request counts, transfer sizes, screenshots, and diagnostic traces.

## Route summary
| Route | Runs | Cold p50 ms | Cold p95 ms | Warm p50 ms | FCP p50 ms | LCP p50 ms | Requests p50 | Transfer p50 KiB | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 4 | 3177 | 3315 | 2841 | 1166 | 1206 | 30 | 3178.0 | 8 |
| `/about` | 4 | 2307 | 2967 | 1529 | 104 | 104 | 24 | 3404.5 | 0 |
| `/auth/reset-password` | 4 | 3582 | 5435 | 1527 | 86 | 86 | 20 | 4053.9 | 0 |
| `/contact` | 4 | 3074 | 4411 | 1577 | 130 | 130 | 24 | 3487.7 | 0 |
| `/forgot-password` | 4 | 2655 | 3652 | 1590 | 140 | 140 | 21 | 4102.0 | 0 |
| `/login` | 4 | 6228 | 8969 | 3188 | 282 | 712 | 30 | 4875.1 | 2 |
| `/pricing` | 4 | 14212 | 25584 | 2581 | 724 | 724 | 25 | 4055.3 | 0 |
| `/register` | 4 | 7946 | 12661 | 2609 | 226 | 674 | 30 | 4875.1 | 0 |
| `/try` | 4 | 2352 | 3104 | 2157 | 144 | 144 | 21 | 3685.0 | 0 |
| `/dashboard` | 4 | 10265 | 15046 | 2986 | 348 | 1446 | 28 | 5274.8 | 4 |
| `/dashboard/settings` | 4 | 6640 | 9368 | 2111 | 266 | 606 | 26 | 5696.7 | 0 |
| `/dashboard/wiki` | 4 | 9301 | 14909 | 8970 | 4668 | 5258 | 30 | 6572.6 | 10 |
| `/dashboard/analytics` | 4 | 13509 | 23420 | 2347 | 278 | 1096 | 32 | 5827.2 | 30 |
| `/dashboard/3d-lab` | 4 | 14662 | 24417 | 2734 | 368 | 722 | 25 | 7404.1 | 3 |

## Overall summary
- Cold duration p50/p95: 3469 / 25158 ms
- Warm duration p50/p95: 2150 / 3965 ms
- FCP p50/p95: 262 / 14184 ms
- LCP p50/p95: 672 / 15760 ms
- Requests p50/p95: 25 / 32
- Transferred bytes p50/p95: 3666.5 / 8762.6 KiB

## Evidence files
- Raw navigation JSON: `.ai/00_performance/results/frontend_navigation_results.json`
- Screenshots: `.ai/00_performance/screenshots/`
- Diagnostic traces: `.ai/00_performance/traces/`

## Limitations
- Local development/server measurements are not production RUM.
- Trace-enabled runs add overhead and should be used diagnostically.
- Auth-gated pages may measure redirect or demo-auth behavior depending on `PLAYWRIGHT_DEMO_AUTH`.
