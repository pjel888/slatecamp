# 17 — Built-App Frontend Baseline

Generated: 2026-04-27T00:06:17.110Z

## Status
Production-like navigation measurement is captured, but **credentialed/authenticated built-app user journeys are not yet complete**. The direct command requested by the remediation prompt was run first:

- `PLAYWRIGHT_USE_BUILT_APP=true bun run perf:frontend` → exit 1, because the user-flow test exceeded its 180s timeout after repeated demo-auth/login failures. Log: `.ai/00_performance/logs/remediation-built-app-frontend.log`.
- The partial navigation JSON from that failed run was preserved as `.ai/00_performance/results/built_app_frontend_baseline_partial_timeout.json`.
- The harness was then run in nav-only mode to get a clean built-app navigation baseline: `PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false bun run perf:frontend` → exit 0. Log: `.ai/00_performance/logs/remediation-built-app-frontend-nav-only.log`.

Important interpretation caveat: in the built-app run, protected routes such as `/dashboard`, `/dashboard/wiki`, `/dashboard/analytics`, and `/dashboard/3d-lab` resolved to login redirects, not authenticated dashboard screens. Runtime `NEXT_PUBLIC_ENABLE_DEMO_MODE` is not enough to make client-side demo login work in an already-built app; safe credentials or a build-time demo fixture are required for authenticated production-like timing.

## Summary comparison: dev-server baseline vs built-app nav baseline

| Metric | Dev/server baseline | Built-app nav baseline | Delta | Delta % |
| --- | ---: | ---: | ---: | ---: |
| Cold p50 | 3469 ms | 1352 ms | -2118 ms | -61.0% |
| Cold p95 | 25158 ms | 1440 ms | -23718 ms | -94.3% |
| Warm p50 | 2150 ms | 1318 ms | -833 ms | -38.7% |
| Warm p95 | 3965 ms | 1362 ms | -2603 ms | -65.7% |
| FCP p50 | 262 ms | 48 ms | -214 ms | -81.7% |
| FCP p95 | 14184 ms | 86 ms | -14098 ms | -99.4% |
| LCP proxy p50 | 672 ms | 52 ms | -620 ms | -92.3% |
| LCP proxy p95 | 15760 ms | 92 ms | -15668 ms | -99.4% |
| Request count p50 | 25 | 42 | 17 | +68.0% |
| Request count p95 | 32 | 60 | 28 | +86.0% |
| Transfer p50 | 3666.5 KiB | 231.2 KiB | -3435.3 KiB | -93.7% |
| Transfer p95 | 8762.6 KiB | 629.6 KiB | -8133.0 KiB | -92.8% |

## Slowest built-app measured routes by cold p95

| Route | Cold p50 | Cold p95 | Warm p50 | Requests p50 | Transfer p50 | Errors | Typical final URL |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/` | 1447 ms | 1785 ms | 1362 ms | 60 | 325.4 KiB | 0 | / |
| `/contact` | 1377 ms | 1414 ms | 1339 ms | 57 | 301.0 KiB | 0 | /contact |
| `/pricing` | 1397 ms | 1409 ms | 1354 ms | 61 | 326.8 KiB | 0 | /pricing |
| `/about` | 1390 ms | 1390 ms | 1357 ms | 57 | 295.0 KiB | 0 | /about |
| `/dashboard/wiki` | 1347 ms | 1373 ms | 1304 ms | 42 | 265.1 KiB | 0 | /login?next=%2Fdashboard%2Fwiki |
| `/dashboard/3d-lab` | 1345 ms | 1368 ms | 1305 ms | 42 | 265.1 KiB | 0 | /login?next=%2Fdashboard%2F3d-lab |
| `/dashboard` | 1352 ms | 1366 ms | 1318 ms | 42 | 265.1 KiB | 0 | /login?next=%2Fdashboard |
| `/auth/reset-password` | 1350 ms | 1366 ms | 1322 ms | 42 | 270.7 KiB | 0 | /auth/reset-password |

## User-flow result from full built-app attempt

| Flow | Status | Duration | Blocker/error |
| --- | --- | ---: | --- |
| open app to first visible UI | measured | 177 ms |  |
| open app to first visible UI | measured | 84 ms |  |
| open app to first visible UI | measured | 77 ms |  |
| login entry to authenticated dashboard (demo auth) | failed | 45013 ms | page.waitForURL: Timeout 45000ms exceeded. |
| dashboard primary data visible (demo auth) | failed | 30031 ms | locator.waitFor: Timeout 30000ms exceeded. |
| wiki search/filter proxy (demo auth) | failed | 29 ms | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | failed | 45009 ms | page.waitForURL: Timeout 45000ms exceeded. |
| dashboard primary data visible (demo auth) | failed | 30015 ms | locator.waitFor: Timeout 30000ms exceeded. |
| wiki search/filter proxy (demo auth) | failed | 20 ms | No textbox/search input found on /dashboard/wiki |
| login entry to authenticated dashboard (demo auth) | failed | 29517 ms | page.waitForURL: Test timeout of 180000ms exceeded. |
| dashboard primary data visible (demo auth) | failed | 3 ms | page.goto: Target page, context or browser has been closed |
| wiki search/filter proxy (demo auth) | failed | 2 ms | page.goto: Target page, context or browser has been closed |

## What the built-app numbers prove
- Public route and protected-redirect navigation is much faster and transfers much less data in `next start` than in the dev-server baseline.
- The built-app protected-route timings are **not** equivalent to authenticated dashboard timings because they redirect to `/login?next=...`.
- Built-app auth/user-flow measurement is now a fixture/readiness problem, not a navigation-harness absence.

## Evidence files
- Dev baseline copy: `.ai/00_performance/results/dev_server_frontend_baseline_before_built_app.json`
- Built-app nav baseline: `.ai/00_performance/results/built_app_frontend_baseline.json`
- Comparison JSON: `.ai/00_performance/results/dev_vs_built_frontend_comparison.json`
- Full-suite partial timeout JSON: `.ai/00_performance/results/built_app_frontend_baseline_partial_timeout.json`
- Full-suite flow timeout JSON: `.ai/00_performance/results/built_app_user_flows_partial_timeout.json`
- Logs: `.ai/00_performance/logs/remediation-built-app-frontend.log`, `.ai/00_performance/logs/remediation-built-app-frontend-nav-only.log`, `.ai/00_performance/logs/remediation-perf-build-after-built-app.log`

## Next step
Use `.ai/00_performance/18_fixture_unblock_plan.md` and `.ai/00_performance/19_live_measurement_readiness.md` to choose a safe authenticated built-app fixture path before treating protected-route production-like timings as complete.
