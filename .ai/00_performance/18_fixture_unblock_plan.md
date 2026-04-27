# 18 — Fixture Unblock Plan

Generated: 2026-04-27T00:07:00Z

## Purpose
The first audit established breadth; this remediation loop needs safe fixtures so production-like and live/staging measurements can cover auth, privileged routes, dynamic routes, POST APIs, Supabase read timing, and mutation-like flows without storing secrets or touching production data destructively.

## Non-negotiables
- Never commit secret values, cookies, JWTs, Supabase service-role keys, provider API keys, or user data.
- Record variable **names only** in docs/logs.
- Prefer local seeded Supabase or staging read-only roles.
- Use mock providers for AI/payment route benchmarks by default.
- Do not run destructive writes against live/staging unless a disposable fixture tenant and cleanup plan exist.

## Fixture targets

| Fixture | Current status | Proposed safe path | Env variable names only | First command once ready |
| --- | --- | --- | --- | --- |
| Built-app authenticated dashboard | Blocked: built-app run redirected protected routes to login. Runtime demo env is insufficient for client bundle behavior. | Option A: build with demo mode explicitly enabled for local-only perf (`NEXT_PUBLIC_ENABLE_DEMO_MODE=true`) and never deploy that build. Option B: use a staging test account supplied through local env. | `NEXT_PUBLIC_ENABLE_DEMO_MODE`, `PLAYWRIGHT_DEMO_AUTH`, `PLAYWRIGHT_TEST_EMAIL`, `PLAYWRIGHT_TEST_PASSWORD` | `PLAYWRIGHT_USE_BUILT_APP=true bun run perf:frontend` |
| Real login/logout | Blocked: no safe test credentials in committed files. | Add Playwright credential reader that only uses local env and redacts presence/absence. Store no values in artifacts. | `PLAYWRIGHT_TEST_EMAIL`, `PLAYWRIGHT_TEST_PASSWORD`, `PLAYWRIGHT_TEST_BASE_URL` | `PERF_AUTH_MODE=credentials PLAYWRIGHT_USE_BUILT_APP=true bun run perf:frontend` |
| Signup | Blocked: would create user data. | Use disposable staging project or local Supabase seed with cleanup. Prefer measuring form/UI and provider-mocked callback locally. | `PLAYWRIGHT_SIGNUP_EMAIL_PREFIX`, `PLAYWRIGHT_SIGNUP_DOMAIN`, `SUPABASE_LOCAL_URL` | Manual/staging only until cleanup is automated. |
| Admin/editor routes | Blocked for production-like timing without admin role. | Use local demo admin persona or staging account with admin/user_roles fixture. Avoid service-role key in browser tests. | `PLAYWRIGHT_ADMIN_EMAIL`, `PLAYWRIGHT_ADMIN_PASSWORD`, `ADMIN_EMAILS` | `PERF_ROUTE_LIMIT=... bun run perf:frontend` with admin route targets. |
| CEO/developer privileged routes | Blocked for privileged timings. | Use role-specific staging test accounts or local seeded roles; default to redirect timing otherwise. | `PLAYWRIGHT_CEO_EMAIL`, `PLAYWRIGHT_DEVELOPER_EMAIL`, `OWNER_EMAILS`, `ALLOW_DEV_PORTAL_BYPASS` | Role-specific Playwright project once accounts exist. |
| Dynamic route params | Partially blocked by lack of known seeded IDs/slugs. | Generate `results/frontend_route_targets.json` from local seed/demo fixture IDs. Keep route params non-sensitive and deterministic. | none required for demo; `PERF_DYNAMIC_FIXTURES_FILE` optional | `PERF_DYNAMIC_FIXTURES_FILE=.ai/00_performance/results/dynamic_route_fixtures.json bun run perf:frontend` |
| API POST/AI routes | Blocked for paid/live providers. | Add provider mocks and synthetic delayed responses; benchmark handlers with synthetic `Request` objects. Do not call paid providers by default. | `AI_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (live manual only) | `bun .ai/00_performance/scripts/api-post-benchmark.mjs` once implemented. |
| Payment checkout/webhooks | Blocked for live providers. | Reuse existing route-test mock style; synthetic provider latency and response-size tests only. | `PAYMENT_PROVIDER`, `PAYREX_SECRET_KEY`, `LEMONSQUEEZY_API_KEY` (live manual only) | Mock benchmark only unless staging provider is configured. |
| Supabase read latency/EXPLAIN | Blocked: no read-only credentialed query plan used. | Prefer local seeded Supabase. If staging is used, require read-only role and a query allowlist. Store query shapes and timings, not row data. | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_READONLY_DB_URL`, `SUPABASE_DB_SSLMODE` | `PERF_SUPABASE_LIVE=true bun run perf:supabase` after live mode is implemented. |
| Cron heavy paths | Blocked by cron secret and non-read behavior. | Use mocked admin client for query-count scaling. For live/staging, add dry-run mode before calling cron logic. | `CRON_SECRET`, `PERF_CRON_DRY_RUN` | Mock benchmark first; staging dry-run only later. |

## Implementation sequence
1. Keep existing static/no-credential scripts as the default CI-safe lane.
2. Add comparison/history script first (`perf:compare`) so fixture runs can be compared to the baseline.
3. Add fixture-target JSON for dynamic routes and route subsets.
4. Split Playwright auth modes:
   - `demo` for local dev-server authenticated screens,
   - `credentials` for staging/local seeded accounts,
   - `redirect-only` for production-like unauthenticated protected route timing.
5. Add mocked POST/provider benchmarks before any live provider timing.
6. Add Supabase live mode only after a read-only credential and query allowlist exist.

## Current fixture blockers to carry forward
- Built-app protected routes currently measure login redirects, not authenticated screens.
- Demo auth for built apps likely requires build-time public demo env; runtime env alone is insufficient.
- No safe staging credentials or read-only DB URL are available in this session.
- Admin/CEO/developer role fixtures are undefined.
- Mutation/API POST benchmarks need mock harnesses before live/staging runs.
