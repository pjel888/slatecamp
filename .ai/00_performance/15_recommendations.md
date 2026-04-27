# 15 — Recommendations

Generated: 2026-04-27T04:04:04.250Z

## Immediate quick wins
1. Keep the performance harness in CI as warning-only: perf:inventory, perf:supabase, perf:hotspots, perf:summary.
2. Add allowlists/comments for intentional Supabase broad reads and select-star usage.
3. Add route-specific primary-content-visible selectors.
4. Keep AI provider timeout wrappers covered and add mocked timeout/error benchmarks for AI/payment flows.

## Measurement/instrumentation improvements
1. Run frontend perf against PLAYWRIGHT_USE_BUILT_APP=true for production-like numbers.
2. Add safe staging/demo credential mechanism for real auth timings without storing secrets.
3. Add API fixture params for dynamic GET routes and mock/staging modes for POST endpoints.
4. Add dated history folders and a compare script.

## Frontend rendering improvements
1. Profile then virtualize/paginate admin question lists and taxonomy trees.
2. Split heavy editors/charts/diagram engines behind dynamic imports where tab-gated/below-fold.
3. Replace obvious per-frame allocations in 3D useFrame loops with reused refs.
4. Add explicit dimensions/lazy/decoding or next/image for stable raw images.

## Data loading improvements
1. Validate the compact dashboard analytics sync payload under production-like auth and keep server-rendered data authoritative.
2. Review sequential awaits and parallelize only truly independent calls.
3. Add per-route request-count and data-visible budgets.

## Supabase/database improvements
1. Tighten high-traffic explicit column lists and add limits/ranges.
2. Run read-only EXPLAIN for dashboard, admin content, analytics, quiz, and CEO query shapes.
3. Verify migration/schema drift on performance indexes.
4. Prefer RPC/materialized views for cron/user-wide analytics loops.

## API/backend improvements
1. Extend timeout/error-rate metrics to mocked AI providers and payment/webhook paths.
2. Add safe API benchmarks for AI/payment routes with mocked providers.
3. Rework cron N+1 loops into batch queries/RPCs once measured.

## Bundle/build improvements
1. Add bundle analyzer on wiki/admin/3D/analytics route families.
2. Split 3D module metadata from full config imports.
3. Dynamically load CodeMirror/Tiptap/Mermaid/Recharts where interaction permits.

## Caching improvements
1. Document cache intent for each high-traffic loader and route handler.
2. Add stale/revalidate tags where current behavior is intentionally cached.
3. Measure production headers for HTML/RSC/chunks/images/fonts.

## UX/perceived performance improvements
1. Measure data-visible time so skeletons do not hide backend regressions.
2. Add optimistic UI timing measurements for safe mutation flows.
3. Ensure auth-gated redirects are fast and do not flash misleading loading states.

## CI/regression prevention
1. Warning-only static perf gates now; hard fail after three stable baselines.
2. Per-route budgets for /, /dashboard, /dashboard/wiki, /dashboard/analytics, /dashboard/3d-lab, /admin, and quiz session flows.
3. API p95 and 5xx gates for safe GET endpoints.

## Prioritized action plan
### Today
- Report and keep the performance harness plus baseline.
- Rerun frontend with a built app if a production-like baseline is needed.
- Add exact blockers for unavailable live credentials.

### This week
- Add safe fixtures for auth, dynamic routes, and mutation benchmarks.
- Tighten obvious high-traffic Supabase query shapes and remeasure.
- Add mocked timeout/error-rate tests for AI endpoints and extend timeout budgets to payment/webhook paths where needed.

### This month
- Split 3D config metadata and virtualize admin/taxonomy heavy lists.
- Add bundle analyzer budgets and CI history comparison.
- Batch cron/user-wide analytics queries.

### Longer-term
- Add production RUM/Core Web Vitals and backend tracing.
- Add Supabase query performance dashboards using safe aggregated telemetry.
- Build a performance dashboard from results/history.
