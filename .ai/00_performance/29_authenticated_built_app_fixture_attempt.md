# 29 — Authenticated Built-App Fixture Attempt

Generated: 2026-04-27T02:14:57.748Z

## Attempts
| Command | Exit | Result |
| --- | ---: | --- |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE=true PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false bun run perf:frontend` | 0 | Completed, but protected routes still measured the existing build artifact and redirects; runtime-only public env is not enough for already-built client code. |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE=true bun run build` | 1 | Build failed while prerendering `/admin` with Unauthorized. |
| `PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false PERF_ROUTE_FILTER=/dashboard/3d-lab bun run perf:frontend` after failed demo build | 1 | Blocked because the demo-mode build did not complete. |

## Status
Authenticated built-app dashboard/3D timing is **not yet possible** from this run. Runtime-only `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` does not turn a previously built app into an authenticated demo build; Next inlines public env at build time. The build-time demo attempt failed on `/admin` prerender authorization before a usable demo build could be measured.

## Current 3D Lab built measurement status
- `/dashboard/3d-lab` in built mode still resolves to `/login?next=%2Fdashboard%2F3d-lab` when using the last good build.
- Therefore built 3D numbers are public/login-redirect timings, not authenticated 3D Lab hub timings.

## Safe credential env names
Do not store values. A credential fixture can use redacted presence checks for:
- `PLAYWRIGHT_TEST_EMAIL`
- `PLAYWRIGHT_TEST_PASSWORD`
- `PLAYWRIGHT_ADMIN_EMAIL`
- `PLAYWRIGHT_ADMIN_PASSWORD`

## Exact rerun commands
If demo build prerender is fixed or admin prerender is disabled safely:
`NEXT_PUBLIC_ENABLE_DEMO_MODE=true bun run build`
`PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false PERF_ROUTE_FILTER=/dashboard/3d-lab bun run perf:frontend`

If credential mode is implemented:
`PLAYWRIGHT_USE_BUILT_APP=true PERF_AUTH_MODE=credentials PERF_ROUTE_FILTER=/dashboard/3d-lab bun run perf:frontend`

## Evidence
- Runtime-only attempt log: `.ai/00_performance/logs/loop2-built-app-runtime-demo-all.log`
- Build-time demo build log: `.ai/00_performance/logs/loop2-build-demo-mode.log`
- Post-build route attempt log: `.ai/00_performance/logs/loop2-built-app-buildtime-demo-3d.log`
- Runtime-only result: `.ai/00_performance/results/auth_fixture_runtime_demo_built_all_routes.json`
- Build-time route result if present: `.ai/00_performance/results/auth_fixture_buildtime_demo_3d_lab.json`
