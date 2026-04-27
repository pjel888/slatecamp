# 19 — Live Measurement Readiness

Generated: 2026-04-27T00:07:00Z

## Current readiness verdict
**Not ready for production/live credentialed performance claims.** Ready for local static scans, local/dev authenticated demo measurements, built-app public/redirect navigation, and mocked provider benchmarks once implemented.

## Readiness matrix

| Measurement lane | Ready now? | Evidence / blocker | Required next step |
| --- | --- | --- | --- |
| Local static inventory | Yes | `perf:inventory`, `perf:supabase`, `perf:hotspots` run without secrets. | Keep in warning-only CI. |
| Dev-server authenticated demo frontend | Yes, with caveats | Previous baseline measured demo-auth dashboard routes locally. | Rerun after each dashboard/frontend remediation. |
| Built-app public route navigation | Yes | `17_built_app_frontend_baseline.md` captured nav-only built-app baseline. | Use for public-route trend checks. |
| Built-app authenticated protected routes | No | Protected routes redirected to `/login?next=...`; demo login failed in built app. | Use build-time demo fixture or staging credentials. |
| Real login/logout | No | No safe credentials available. | Add env-only credential reader and redacted logs. |
| Admin/CEO/developer route timings | No | No role fixtures available. | Seed local/staging roles or add demo-role path. |
| API static GET | Partial | Existing `perf:api` measures safe non-dynamic GETs/401 guards. | Add fixture params and POST mock harness. |
| AI/payment provider latency | No live; mock recommended | Paid/external providers intentionally not called. | Mock provider benchmarks first; live manual only. |
| Supabase query latency/EXPLAIN | No | No read-only credentialed DB path. | Local seeded DB or staging read-only role + query allowlist. |
| Cron scaling | Static only | Existing static analysis found N+1/query-volume risks; no dry-run benchmark yet. | Add mocked query-count benchmark and optional dry-run mode. |
| CI hard perf gates | No | Only one comparable baseline family exists. | Keep warning-only until at least three comparable runs. |

## Required environment variable names
Names only; values must remain local/CI-secret-managed:

- Supabase app/runtime: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase privileged/local-only: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_READONLY_DB_URL`
- Demo/auth Playwright: `NEXT_PUBLIC_ENABLE_DEMO_MODE`, `PLAYWRIGHT_DEMO_AUTH`, `PLAYWRIGHT_TEST_EMAIL`, `PLAYWRIGHT_TEST_PASSWORD`, `PLAYWRIGHT_ADMIN_EMAIL`, `PLAYWRIGHT_ADMIN_PASSWORD`
- App origin: `NEXT_PUBLIC_APP_URL`, `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_PORT`
- Providers live/manual only: `AI_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `PAYMENT_PROVIDER`, `PAYREX_SECRET_KEY`, `LEMONSQUEEZY_API_KEY`
- Cron live/manual only: `CRON_SECRET`, `PERF_CRON_DRY_RUN`

## Commands by readiness level

### Safe local/no-secret lane
```bash
bun run perf:inventory
bun run perf:supabase
bun run perf:hotspots
bun run perf:summary
bun run perf:compare -- --base=.ai/00_performance/results/dev_server_frontend_baseline_before_built_app.json --candidate=.ai/00_performance/results/built_app_frontend_baseline.json
```

### Production-like public/redirect navigation lane
```bash
PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false bun run perf:frontend
bun run perf:build
bun run perf:summary
```

### Authenticated built-app lane, once safe fixture exists
```bash
PLAYWRIGHT_USE_BUILT_APP=true PERF_AUTH_MODE=credentials PLAYWRIGHT_TEST_EMAIL=<local-secret> PLAYWRIGHT_TEST_PASSWORD=<local-secret> bun run perf:frontend
```

Do not paste the placeholder values into logs; use CI/local secret injection.

## Live Supabase EXPLAIN readiness checklist
- [ ] Local seeded DB or staging read-only role is available.
- [ ] Query allowlist exists and excludes writes.
- [ ] Logs redact connection strings and row data.
- [ ] Results store query shape, table, timing, plan summary, and row-count estimates only.
- [ ] RLS behavior is tested with realistic non-service-role credentials where relevant.

## Provider benchmark readiness checklist
- [ ] Mock provider path exists and is the default.
- [ ] Paid provider live calls require explicit opt-in env.
- [ ] Timeout budgets are implemented and reported.
- [ ] Error-rate and timeout-rate are captured separately from latency.
