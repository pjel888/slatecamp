# SlateCamp Performance Audit

Generated: 2026-04-27T02:40:07.877Z

This folder is the centralized performance ledger for SlateCamp. It contains repeatable scripts, raw JSON, command logs, Playwright traces/screenshots, static inventories, and human-readable reports.

## What was measured
- Repository route/tooling/data-fetch inventory.
- Environment and runtime versions.
- Frontend route navigation and Playwright user-flow timing proxies.
- Static GET API route latency when a target server is reachable.
- Supabase usage inventory and database risk scan.
- Build/typecheck timing and largest Next build artifacts.
- Static component/function hotspot patterns.

## How to rerun
~~~bash
bun run perf:inventory
bun run perf:environment
bun run perf:frontend
bun run perf:api
bun run perf:supabase
bun run perf:build
bun run perf:hotspots
bun run perf:summary
# or the whole local suite
bun run perf:all
~~~

Useful knobs:
- PERF_FRONTEND_REPEAT=5 for more route samples.
- PERF_USER_FLOW_REPEAT=5 for more user-flow samples.
- PERF_API_REPEAT=10 PERF_BASE_URL=http://localhost:3217 for API samples.
- PLAYWRIGHT_USE_BUILT_APP=true for production-build Playwright measurement.
- PERF_ROUTE_FILTER=/dashboard/3d-lab limits frontend measurement to selected comma-separated routes.

Comparison/history helpers:
- `bun run perf:compare -- --before <before.json> --after <after.json>`
- `bun run perf:snapshot -- --mode=<mode> --label=<label>`

## Where raw results live
- JSON results: `results/`
- Command logs: `logs/`
- Playwright traces: `traces/`
- Screenshots: `screenshots/`
- Playwright harness: `playwright/`
- Scripts: `scripts/`

## Current baseline summary
- Commit: `936d6de57efcfb850a9774eedc4967da568520e9`
- Pages / route handlers: 112 / 12
- Frontend cold p50/p95: 2907 ms / 19796 ms
- API GET p50/p95: 6 ms / 1985 ms
- Build p50/p95: 42475 ms / 42475 ms
- Supabase select-star / missing-limit candidates: 9 / 160

## Remediation-loop evidence
- Dashboard duplicate-data remediation comparison: cold p95 delta -8197 ms (-32.58%); see `20_dashboard_remediation.md`.
- Supabase query tightening: select-star candidates 19 -> 9; see `21_supabase_query_tightening.md`.
- 3D Lab direct-import split: hub raw client-reference signal bytes 3419.7 KiB -> 2120.8 KiB; see `22_3d_lab_bundle_remediation.md`.
- Latest exact `bun run perf:frontend`: passed all 15 Playwright perf tests; memory-threshold restart warning still observed; see `results/full_frontend_verification_after_metadata.json`.

## Top bottlenecks
1. 3D Lab dev-server runtime/memory remains warning-only after full-suite recovery
2. Supabase broad-read and missing-limit candidates remain after first tightening pass
3. Admin content/editor surfaces overfetch and render large lists without virtualization
4. AI/API routes need mocked latency/error budget benchmarks after timeout wrappers
5. Cron routes include N+1/per-user scaling patterns

## Recommended next actions
1. Add safe auth/API/database fixtures so blocked live flows can be measured without secrets.
2. Convert warning-only performance scripts into CI trend checks.
3. Measure built-app frontend performance and compare against the current dev-server baseline.
4. Tighten or allowlist Supabase broad-read candidates.
5. Focus next remediation on 3D Lab memory/startup, remaining Supabase broad reads, admin large lists, and dashboard production-auth monitoring.

## Known gaps/blockers
- 3D Lab full-suite memory warning: Latest full perf:frontend passed, but Next dev server still emitted a memory-threshold restart warning near the dashboard/analytics/3D segment.
- Live Supabase latency/EXPLAIN: No safe read-only DB/test credentialed execution path was used.
- OMX tmux team runtime: Current surface is Codex App/native outside tmux; tmux team panes cannot be launched here.
- GitNexus detect_changes: Deferred GitNexus MCP tools were unavailable and npx gitnexus failed; see logs/gitnexus-help.log.

## Reports
- `.ai/00_performance/00_inventory.md`
- `.ai/00_performance/01_measurement_plan.md`
- `.ai/00_performance/02_environment.md`
- `.ai/00_performance/03_baseline_summary.md`
- `.ai/00_performance/04_frontend_runtime.md`
- `.ai/00_performance/05_playwright_e2e.md`
- `.ai/00_performance/06_api_backend.md`
- `.ai/00_performance/07_supabase_database.md`
- `.ai/00_performance/08_auth_and_user_wait.md`
- `.ai/00_performance/09_network_and_caching.md`
- `.ai/00_performance/10_bundle_build_startup.md`
- `.ai/00_performance/11_component_function_hotspots.md`
- `.ai/00_performance/12_regression_testing_plan.md`
- `.ai/00_performance/13_ci_perf_gates.md`
- `.ai/00_performance/14_bottlenecks_ranked.md`
- `.ai/00_performance/15_recommendations.md`
- `.ai/00_performance/16_open_questions_and_blockers.md`
- `.ai/00_performance/17_built_app_frontend_baseline.md`
- `.ai/00_performance/18_fixture_unblock_plan.md`
- `.ai/00_performance/19_live_measurement_readiness.md`
- `.ai/00_performance/20_dashboard_remediation.md`
- `.ai/00_performance/21_supabase_query_tightening.md`
- `.ai/00_performance/22_3d_lab_bundle_remediation.md`
- `.ai/00_performance/23_admin_editor_remediation.md`
- `.ai/00_performance/24_api_provider_timeout_remediation.md`
- `.ai/00_performance/25_cron_scaling_remediation.md`
- `.ai/00_performance/26_ci_history_and_compare.md`
- `.ai/00_performance/27_3d_lab_runtime_memory_isolation.md`
- `.ai/00_performance/28_3d_lab_metadata_registry_split.md`
- `.ai/00_performance/29_authenticated_built_app_fixture_attempt.md`
- `.ai/00_performance/30_dashboard_metric_reconciliation.md`
- `.ai/00_performance/31_performance_history_snapshot_writer.md`
- `.ai/00_performance/32_next_regression_gates_update.md`
- `.ai/00_performance/33_full_frontend_rejoin_verification.md`
- `.ai/00_performance/remediation_run_notes.md`
- `.ai/00_performance/llm_crosschecks.md`
