# 35 — Authenticated Built-App 3D Timing

Generated: 2026-04-27T04:03:39Z

## Status
The safe build-time demo auth fixture is now working for built-app `/dashboard/3d-lab` measurement. The route resolves to authenticated 3D Lab content, not a login redirect.

## Fixture implementation
- Added `bun run perf:build:demo-auth` via `.ai/00_performance/scripts/build-demo-auth-app.mjs`.
- The script runs `bun run build` with safe demo env defaults and redacts secret-like values in logs/results.
- `scripts/playwright-web-server.ts` defaults demo perf runs to `PLAYWRIGHT_DEMO_ROLE=super_admin` and `PLAYWRIGHT_DEMO_TIER=pro` when `PLAYWRIGHT_DEMO_AUTH=true`, preventing protected prerender routes from failing the demo build.

## Rerun commands
```bash
bun run perf:build:demo-auth
PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false PERF_ROUTE_FILTER=/dashboard/3d-lab PERF_ROUTE_LIMIT=1 PERF_MEMORY_PROFILE_LABEL=loop4-built-auth-3d bun run perf:frontend
```

Credentialed live/staging auth can still be added without storing values by supplying env names only:
- `PLAYWRIGHT_TEST_EMAIL`
- `PLAYWRIGHT_TEST_PASSWORD`
- `PLAYWRIGHT_ADMIN_EMAIL`
- `PLAYWRIGHT_ADMIN_PASSWORD`

## Built-app authenticated 3D metrics
| Metric | Value |
| --- | ---: |
| Cold p50 | 1,377 ms |
| Cold p95 | 1,556 ms |
| Warm p50 | 1,336 ms |
| Warm p95 | 1,356 ms |
| Request p50 / p95 | 51 / 51 |
| Transfer p50 / p95 | 352.4 KiB / 693.6 KiB |
| Browser JS heap p95 | 10.0 MiB |
| Server RSS max | 211.7 MiB |
| Error count | 0 |
| Memory-threshold warning | no |

## Auth/content proof
- Final URL: `http://localhost:3217/dashboard/3d-lab`
- `finalPathIsLogin`: `False`
- `threeDLabTitleVisible`: `True`
- `threeDLabInteractiveModulesAvailable`: `True`
- `threeDLabLockedOrUpgradeCopyVisible`: `False`

## Evidence files
- Demo build result: `.ai/00_performance/results/demo_auth_build_result.json`
- Demo build log: `.ai/00_performance/logs/demo-auth-build.log`
- Built auth 3D nav: `.ai/00_performance/results/loop4_built_auth_3d_navigation.json`
- Built auth memory profile: `.ai/00_performance/results/dev_server_memory_profile_loop4-built-auth-3d.json`
- Playwright log: `.ai/00_performance/logs/loop4-built-auth-3d-rerun.log`

## Remaining limitation
This proves a safe demo-auth built-app fixture. It does not prove real Supabase Auth provider latency; that still requires externally supplied staging/test credentials and redacted logging only.
