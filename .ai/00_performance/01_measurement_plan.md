# 01 — Measurement Plan

Generated: 2026-04-26T17:25:00Z

## Goals
Create a reproducible local baseline for SlateCamp performance across repository inventory, frontend route runtime, Playwright user-flow wait times, API/backend endpoints, Supabase/database usage, build/bundle output, and static component/function hotspots.

## Command matrix

| Area | Command | Mode | Repeat count | Raw output | Human report | Metrics captured | Limitations |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| Environment | `bun run perf:environment` | local/cold snapshot | 1 | `results/environment.json` | `02_environment.md` | git, OS, CPU/RAM, Node/Bun/Playwright versions, env var names only | Does not capture secret values by design. |
| Inventory | `bun run perf:inventory` | local static scan | 1 | `results/inventory.json`, `results/route_inventory.json`, `results/frontend_route_targets.json` | `00_inventory.md` | route counts, route handlers, scripts, tools, data-fetch/caching signals | Static scan; access classification is inferred. |
| Frontend routes | `bun run perf:frontend` | local Playwright, dev server by default, demo auth enabled | `PERF_FRONTEND_REPEAT` default 3 cold + 3 warm per route | `results/frontend_navigation_results.json`, traces/screenshots | `04_frontend_runtime.md` | p50/p75/p95/p99/min/max/mean/stddev for navigation proxy, TTFB proxy, DOMContentLoaded, load, FCP, LCP proxy, CLS proxy, long tasks, heap, resources, transfer, request count, errors/timeouts | Local dev server is noisier than production; web-vital values are Performance API proxies. |
| User flows | `bun run perf:e2e` | local Playwright, demo auth if enabled | `PERF_USER_FLOW_REPEAT` default 3 | `results/frontend_user_flows_results.json` | `05_playwright_e2e.md`, `08_auth_and_user_wait.md` | first visible UI, login-to-dashboard demo proxy, dashboard-data-visible, search/input-to-settle proxy | Real credentialed login/signup blocked unless safe test credentials are supplied. |
| API/backend | `bun run perf:api` | local/live target via `PERF_BASE_URL` | `PERF_API_REPEAT` default 5 per static GET endpoint | `results/api_benchmark_results.json` | `06_api_backend.md` | p50/p75/p95/p99/min/max/mean/stddev total duration, TTFB proxy, response bytes, error/timeout rate, status codes | Does not call mutation endpoints; dynamic routes require fixture params; needs server already reachable. |
| Supabase/database | `bun run perf:supabase` | static read-only scan | 1 | `results/supabase_query_inventory.json`, `results/supabase_latency_results.json` | `07_supabase_database.md` | usage locations, tables, auth/RPC/storage/realtime signals, `select('*')`, missing-limit candidates, client-side queries | Live latency and `EXPLAIN ANALYZE` blocked without safe read-only DB/test credentials. |
| Build/bundle/startup | `bun run perf:build` | local build/typecheck | `PERF_BUILD_REPEAT` default 1 | `results/build_startup_results.json` | `10_bundle_build_startup.md` | build time, typecheck time, exit codes, largest `.next/static` and server artifacts, heavy dependency signals | One local run is not a stable CI budget; route compilation logs depend on Next output. |
| Hotspot scan | `bun run perf:hotspots` | static scan | 1 | `results/component_hotspot_inventory.json` | `11_component_function_hotspots.md` | category counts, large files, heavy imports, sequential awaits, list/render patterns | Static signals are hypotheses until profiled. |
| Summary synthesis | `bun run perf:summary` | local report synthesis | 1 | `results/baseline_summary.json` | `03_baseline_summary.md`, `08_auth_and_user_wait.md`, `09_network_and_caching.md`, `12_regression_testing_plan.md`, `13_ci_perf_gates.md`, `14_bottlenecks_ranked.md`, `15_recommendations.md`, `16_open_questions_and_blockers.md`, `README.md` | normalized summary, blockers, bottleneck ranking, budgets/gates | Depends on previous result files; missing inputs are marked as blockers. |

## Statistical schema
All benchmark JSON files use the same summary shape where numeric samples exist:

```json
{
  "min": 0,
  "max": 0,
  "mean": 0,
  "median": 0,
  "p50": 0,
  "p75": 0,
  "p95": 0,
  "p99": 0,
  "stddev": 0
}
```

Each run records timestamp, target/scenario, run index, error/timeout information where available, and notes about whether results are cold, warm, local, CI, mocked, or live.

## Cold vs warm definitions
- **Cold frontend load:** a new browser context and first route navigation.
- **Warm frontend load:** same new context but route is primed once before the measured navigation.
- **First run:** run index `1` in a route/scenario set.
- **Subsequent runs:** run index `> 1`.
- **API warm repeat:** repeated GET requests in the same benchmark process after the first request.
- **Build cold/warm:** current harness records wall-clock build runs; repeated build runs can be requested with `PERF_BUILD_REPEAT` but are still local-machine dependent.

## Performance budgets: current strategy
Because this is the first reproducible ledger, gates should initially use **current baseline + tolerance**, not arbitrary aspirational numbers. Suggested budget policy is in `13_ci_perf_gates.md` after measurements are collected.

## Secret handling
- Do not print environment variable values.
- Do not persist cookies, auth headers, JWTs, Supabase keys, provider keys, or private user data.
- Live Supabase/API benchmarks require explicit safe test credentials and must redact all sensitive values.

## Expected blocker treatment
A blocked measurement is valid only if it records:
1. exact missing prerequisite,
2. which command would rerun it,
3. safe next step,
4. whether the blocker affects confidence in a bottleneck or recommendation.
