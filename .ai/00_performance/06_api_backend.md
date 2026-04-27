# 06 — API / Backend Performance

Generated: 2026-04-26T17:56:34.840Z

## Measurement safety
Automatic latency measurement is limited to non-dynamic `GET` route handlers. Mutation endpoints (POST/PUT/PATCH/DELETE) are inventoried but not called to avoid destructive or side-effectful operations.

## Endpoint inventory
| Path | Methods | File | Benchmark status |
| --- | --- | --- | --- |
| `/api/admin/flags` | POST, DELETE | `src/app/api/admin/flags/route.ts` | non-GET read-only skipped |
| `/api/ai/embed` | POST | `src/app/api/ai/embed/route.ts` | non-GET read-only skipped |
| `/api/ai/generate-questions` | POST | `src/app/api/ai/generate-questions/route.ts` | non-GET read-only skipped |
| `/api/ai/socratic` | none | `src/app/api/ai/socratic/route.ts` | non-GET read-only skipped |
| `/api/ai/study-agent` | POST | `src/app/api/ai/study-agent/route.ts` | non-GET read-only skipped |
| `/api/ai/tutor` | POST | `src/app/api/ai/tutor/route.ts` | non-GET read-only skipped |
| `/api/cron/compute-signals` | GET | `src/app/api/cron/compute-signals/route.ts` | GET measured when server reachable |
| `/api/cron/focus-review-scan` | GET | `src/app/api/cron/focus-review-scan/route.ts` | GET measured when server reachable |
| `/api/payments/checkout` | POST | `src/app/api/payments/checkout/route.ts` | non-GET read-only skipped |
| `/api/webhooks/lemonsqueezy` | POST | `src/app/api/webhooks/lemonsqueezy/route.ts` | non-GET read-only skipped |
| `/api/webhooks/payrex` | POST | `src/app/api/webhooks/payrex/route.ts` | non-GET read-only skipped |
| `/auth/callback` | GET | `src/app/auth/callback/route.ts` | GET measured when server reachable |

## GET benchmark target
- Base URL: `http://localhost:3217`
- Repeat count per benchmarkable endpoint: 5
- Timeout: 15000 ms
- Server reachable: yes
- Auto-started local server: yes (log: `.ai/00_performance/logs/perf-api-autostart-webserver.log`)

## Benchmark results
| Endpoint | File | Status codes | Runs | p50 total ms | p95 total ms | Mean bytes | Supabase | Auth |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| `/api/cron/compute-signals` | `src/app/api/cron/compute-signals/route.ts` | 401 | 5 | 3.7 | 937.6 | 24 | yes | no |
| `/api/cron/focus-review-scan` | `src/app/api/cron/focus-review-scan/route.ts` | 401 | 5 | 4.1 | 792.0 | 24 | yes | no |
| `/auth/callback` | `src/app/auth/callback/route.ts` | 307 | 5 | 58.9 | 3122.4 | 0 | yes | yes |

## Whole-measurement summary
- p50: 6.0 ms
- p75: 65.2 ms
- p95: 1985.1 ms
- p99: 3505.1 ms
- min/max: 3.2 / 3885.1 ms
- mean/stddev: 414.8 / 995.7 ms

## Blockers and limitations
- Dynamic route handlers need fixture parameters before safe benchmarking.
- Auth-required and mutation endpoints need safe test fixtures and non-production credentials before timing.

## Raw evidence
- `.ai/00_performance/results/api_benchmark_results.json`
