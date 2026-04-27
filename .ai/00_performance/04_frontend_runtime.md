# 04 — Frontend Runtime Performance

Generated: 2026-04-27T03:58:06.954Z

## Measurement method
Playwright Chromium navigation tests measured cold and warm route loads with 3 repeat(s) per scenario. Metrics include wall-clock navigation proxy, Navigation Timing, paint timing, LCP/CLS observer proxies, long tasks, heap where Chromium exposes it, resource timings, request counts, transfer sizes, screenshots, and diagnostic traces.

## Route summary
| Route | Runs | Cold p50 ms | Cold p95 ms | Warm p50 ms | FCP p50 ms | LCP p50 ms | Requests p50 | Transfer p50 KiB | Errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 6 | 2188 | 3263 | 2609 | 380 | 380 | 36 | 4032.2 | 6 |
| `/about` | 6 | 1782 | 3526 | 1707 | 210 | 210 | 32 | 3524.8 | 3 |
| `/auth/reset-password` | 6 | 2605 | 8537 | 1825 | 368 | 368 | 27 | 4131.2 | 6 |
| `/contact` | 6 | 5176 | 11295 | 2583 | 368 | 368 | 38 | 3618.8 | 10 |
| `/forgot-password` | 6 | 1866 | 8007 | 2683 | 476 | 476 | 31 | 4208.0 | 8 |
| `/login` | 6 | 13608 | 18085 | 7851 | 0 | 2388 | 3 | 38.2 | 15 |
| `/pricing` | 6 | 9866 | 45727 | 2629 | 572 | 572 | 26 | 4137.6 | 8 |
| `/register` | 6 | 7891 | 18549 | 6976 | 124 | 936 | 13 | 1191.4 | 11 |
| `/try` | 6 | 6195 | 8601 | 2834 | 534 | 534 | 30 | 3677.2 | 14 |
| `/dashboard` | 6 | 12153 | 24815 | 11634 | 1976 | 3856 | 26 | 5335.1 | 7 |
| `/dashboard/settings` | 6 | 4422 | 8190 | 2688 | 354 | 776 | 35 | 5085.8 | 14 |
| `/dashboard/wiki` | 6 | 4699 | 17989 | 3530 | 490 | 1360 | 37 | 4941.8 | 12 |
| `/dashboard/analytics` | 6 | 12600 | 43768 | 12544 | 3434 | 5060 | 28 | 8186.2 | 13 |
| `/dashboard/3d-lab` | 6 | 18410 | 38129 | 5302 | 570 | 1102 | 29 | 5033.0 | 7 |

## Overall summary
- Cold duration p50/p95: 6948 / 39615 ms
- Warm duration p50/p95: 3182 / 18455 ms
- FCP p50/p95: 420 / 19348 ms
- LCP p50/p95: 744 / 22310 ms
- Requests p50/p95: 30 / 46
- Transferred bytes p50/p95: 3702.0 / 7608.6 KiB

## Evidence files
- Raw navigation JSON: `.ai/00_performance/results/frontend_navigation_results.json`
- Server memory profile: `.ai/00_performance/results/dev_server_memory_profile_loop4-full-frontend.json`
- Screenshots: `.ai/00_performance/screenshots/`
- Diagnostic traces: `.ai/00_performance/traces/`

## Limitations
- Local development/server measurements are not production RUM.
- Trace-enabled runs add overhead and should be used diagnostically.
- Auth-gated pages may measure redirect or demo-auth behavior depending on `PLAYWRIGHT_DEMO_AUTH`.
