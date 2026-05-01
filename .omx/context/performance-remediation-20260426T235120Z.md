# Ralph Context Snapshot — Performance Remediation

## Task
Continue SlateCamp performance work after the accepted local baseline. Convert the `.ai/00_performance` audit ledger into measured remediation without redoing the broad audit.

## Desired outcome
- Preserve the existing local baseline and create a production-like built-app baseline.
- Unblock safe fixture strategy for auth, admin, dynamic routes, POST APIs, and read-only Supabase timing.
- Make only minimal, reversible, measurement-backed code changes where evidence confirms a bottleneck.
- Store all new logs, JSON, traces, screenshots, notes, and before/after reports inside `.ai/00_performance`.

## Known evidence
- Existing baseline ledger lives under `.ai/00_performance`.
- Top bottlenecks from the accepted audit: dashboard duplicate data work, Supabase broad reads, 3D Lab registry/config loading, admin/editor heavy lists, provider timeout budgets, cron N+1 risk, and CI history gaps.
- Current baseline is local/dev-server, not production-like or live/staging.

## Constraints
- No secrets, cookies, tokens, service-role keys, or user data in logs or committed files.
- No destructive database operations.
- Do not alter unrelated dirty working-tree files.
- Use Bun scripts and current repo conventions.
- Document blockers rather than hiding failed or credential-gated measurements.
- Graph-level GitNexus tooling is currently unavailable in this session; compensate with manual caller/import tracing and document the blocker before code edits.

## Likely touchpoints
- `.ai/00_performance/**`
- `.omx/plans/prd-performance-remediation-*.md`
- `.omx/plans/test-spec-performance-remediation-*.md`
- `package.json` only if rerun/compare scripts need to be exposed
- Dashboard: `src/app/dashboard/page.tsx`, `src/lib/actions/dashboard-page.ts`, `src/components/dashboard/DashboardAnalyticsSync.tsx`
- Supabase query tightening: prioritized high-traffic action/query files from `results/supabase_query_inventory.json`
- 3D Lab: `src/features/3d-lab/config/registry/**`, `src/app/dashboard/3d-lab/**`
- Admin/API/cron surfaces only after focused inspection.

## Unknowns
- Whether built-app frontend baseline runs cleanly with the current dirty tree and existing `.next` state.
- Whether dashboard duplicate data work is behaviorally required or removable.
- Whether safe local/staging fixtures can be implemented without introducing secrets or new dependencies.
