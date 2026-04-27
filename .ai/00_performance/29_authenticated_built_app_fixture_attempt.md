# 29 — Authenticated Built-App Fixture Attempt

Generated: 2026-04-27T04:03:39Z

## Current status
Authenticated built-app `/dashboard/3d-lab` timing is now **unblocked via a safe build-time demo auth fixture**. The route measured authenticated content, not a login redirect.

## What fixed the blocker
The previous attempt only set `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` at runtime or tried a demo build without an elevated demo role. That was insufficient because Next public env is inlined at build time and `/admin` prerender required a privileged role.

This loop added:
- `bun run perf:build:demo-auth`, implemented by `.ai/00_performance/scripts/build-demo-auth-app.mjs`.
- Safe default demo role/tier propagation in `scripts/playwright-web-server.ts` for perf webserver runs.
- Content-signal assertions in the Playwright navigation payload so authenticated content can be distinguished from login redirects.

## Commands that now work
```bash
bun run perf:build:demo-auth
PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false PERF_ROUTE_FILTER=/dashboard/3d-lab PERF_ROUTE_LIMIT=1 PERF_MEMORY_PROFILE_LABEL=loop4-built-auth-3d bun run perf:frontend
```

## Evidence
- Build result: `.ai/00_performance/results/demo_auth_build_result.json`
- Build log: `.ai/00_performance/logs/demo-auth-build.log`
- Built authenticated 3D result: `.ai/00_performance/results/loop4_built_auth_3d_navigation.json`
- Built authenticated memory profile: `.ai/00_performance/results/dev_server_memory_profile_loop4-built-auth-3d.json`
- Detailed report: `.ai/00_performance/35_authenticated_built_app_3d_timing.md`

## Measured authenticated built-app 3D baseline
- Cold p50/p95: 1,377 ms / 1,556 ms
- Warm p50/p95: 1,336 ms / 1,356 ms
- Server RSS max: 211.7 MiB
- Error count: 0
- Content proof: final URL stayed on `/dashboard/3d-lab`; `threeDLabInteractiveModulesAvailable=true`; `finalPathIsLogin=false`.

## Still blocked
Real Supabase Auth provider latency remains blocked without externally supplied staging/test credentials. Do not store values. Only env names may be documented:
- `PLAYWRIGHT_TEST_EMAIL`
- `PLAYWRIGHT_TEST_PASSWORD`
- `PLAYWRIGHT_ADMIN_EMAIL`
- `PLAYWRIGHT_ADMIN_PASSWORD`
