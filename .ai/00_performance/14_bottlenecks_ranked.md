# 14 — Ranked Bottlenecks

Generated: 2026-04-27T02:40:07.876Z

## Ranking table
| Rank | Bottleneck | User impact | Confidence | Ease of fix | Risk of fix |
| ---: | --- | --- | --- | --- | --- |
| 1 | 3D Lab dev-server runtime/memory remains warning-only after full-suite recovery | No longer blocks this exact full-suite run, but high dev cold variance and memory warnings still threaten reliable regression gating. | high | medium | medium |
| 2 | Supabase broad-read and missing-limit candidates remain after first tightening pass | Can inflate payloads, RLS work, network bytes, and waterfall latency. | medium | varies | medium-high |
| 3 | Admin content/editor surfaces overfetch and render large lists without virtualization | Affects internal content operations and editor responsiveness. | medium | medium-hard | medium |
| 4 | AI/API routes need mocked latency/error budget benchmarks after timeout wrappers | Can create long tail waits and serverless duration risk. | medium | medium | medium |
| 5 | Cron routes include N+1/per-user scaling patterns | Operational timeout risk grows with active users. | medium-high | medium-hard | high |
| 6 | Bundle-heavy route families need analyzer-backed budgets | Large JS chunks harm cold route load and interaction readiness. | medium | varies | low-medium |
| 7 | Dashboard sync dedupe needs production-auth monitoring | Dashboard is the primary authenticated landing page; the local fix needs credentialed production-like confirmation. | medium | easy | low-medium |

## 1. 3D Lab dev-server runtime/memory remains warning-only after full-suite recovery

- Location: src/app/dashboard/3d-lab/page.tsx; src/features/3d-lab/components/*; src/features/3d-lab/config/registry/*
- Evidence: Latest full `bun run perf:frontend` completed all Playwright performance tests with exit 0; memory-threshold restart warning still observed.
- Metric before: Latest 3D Lab cold p95 44219 ms; warm p95 3019 ms
- Why it matters: No longer blocks this exact full-suite run, but high dev cold variance and memory warnings still threaten reliable regression gating.
- Suspected cause: 3D Lab dev-server runtime/memory remains warning-only after full-suite recovery
- Recommended fix: see `15_recommendations.md` and use measurement-backed reversible changes.
- Expected impact: reduce p95 wait, payload, or operational timeout risk.
- Verify fix: Keep 3D in warning-only full-suite measurement, preserve route-isolated lane, and compare heap/chunk data before hard gating.
- Timing: fix now or next performance sprint

## 2. Supabase broad-read and missing-limit candidates remain after first tightening pass

- Location: results/supabase_query_inventory.json and 07_supabase_database.md
- Evidence: 9 select-star candidate(s), 160 unbounded read candidate(s), 4 client query block(s).
- Metric before: blocked-without-live-read-only-credentialed-query-plan
- Why it matters: Can inflate payloads, RLS work, network bytes, and waterfall latency.
- Suspected cause: Supabase broad-read and missing-limit candidates remain after first tightening pass
- Recommended fix: see `15_recommendations.md` and use measurement-backed reversible changes.
- Expected impact: reduce p95 wait, payload, or operational timeout risk.
- Verify fix: Continue explicit columns/limits on high-traffic paths, then run targeted EXPLAIN and route perf tests.
- Timing: fix now or next performance sprint

## 3. Admin content/editor surfaces overfetch and render large lists without virtualization

- Location: src/lib/actions/admin/content.ts; src/components/admin/unified-editor/QuestionsPanel.tsx; taxonomy tree/picker components
- Evidence: Static audit found broad admin content loads, a 1481-line QuestionsPanel, and unvirtualized list/grouping risks.
- Metric before: Privileged admin runtime metric requires safe role fixture.
- Why it matters: Affects internal content operations and editor responsiveness.
- Suspected cause: Admin content/editor surfaces overfetch and render large lists without virtualization
- Recommended fix: see `15_recommendations.md` and use measurement-backed reversible changes.
- Expected impact: reduce p95 wait, payload, or operational timeout risk.
- Verify fix: Measure admin routes with privileged fixtures; add pagination/virtualization; remeasure.
- Timing: fix now or next performance sprint

## 4. AI/API routes need mocked latency/error budget benchmarks after timeout wrappers

- Location: src/app/api/ai/*/route.ts; src/lib/ai/provider.ts; payment/webhook routes
- Evidence: Provider fetch timeout wrappers were added, but mutation/AI/payment POST benchmarks remain blocked without safe mocked/staging fixtures.
- Metric before: Mutation/AI POST endpoints were not called by safe benchmark harness.
- Why it matters: Can create long tail waits and serverless duration risk.
- Suspected cause: AI/API routes need mocked latency/error budget benchmarks after timeout wrappers
- Recommended fix: see `15_recommendations.md` and use measurement-backed reversible changes.
- Expected impact: reduce p95 wait, payload, or operational timeout risk.
- Verify fix: Add mocked provider latency benchmarks; track p95/p99 and timeout rate.
- Timing: this week/month after fixture coverage

## 5. Cron routes include N+1/per-user scaling patterns

- Location: src/app/api/cron/compute-signals/route.ts; src/app/api/cron/focus-review-scan/route.ts
- Evidence: API/backend audit found loops over active users with multiple DB calls per user; focus-review timestamp schema mismatch was fixed but scaling remains unmeasured.
- Metric before: Cron endpoints require secret and were not automatically called.
- Why it matters: Operational timeout risk grows with active users.
- Suspected cause: Cron routes include N+1/per-user scaling patterns
- Recommended fix: see `15_recommendations.md` and use measurement-backed reversible changes.
- Expected impact: reduce p95 wait, payload, or operational timeout risk.
- Verify fix: Measure on local seeded DB by user count and compare batch/RPC refactor.
- Timing: this week/month after fixture coverage

## 6. Bundle-heavy route families need analyzer-backed budgets

- Location: analytics, wiki, admin editor, notes, 3D Lab; Mermaid/CodeMirror/Tiptap/Recharts imports
- Evidence: Build and hotspot scans show tracked heavy dependencies and large build artifacts; direct 3D imports reduced hub manifest bytes but registry metadata split remains open.
- Metric before: Build p50 42475 ms; largest static 2290.6 KiB
- Why it matters: Large JS chunks harm cold route load and interaction readiness.
- Suspected cause: Bundle-heavy route families need analyzer-backed budgets
- Recommended fix: see `15_recommendations.md` and use measurement-backed reversible changes.
- Expected impact: reduce p95 wait, payload, or operational timeout risk.
- Verify fix: Add route bundle budgets and rerun perf:build plus perf:frontend.
- Timing: this week/month after fixture coverage

## 7. Dashboard sync dedupe needs production-auth monitoring

- Location: src/components/dashboard/DashboardAnalyticsSync.tsx; src/lib/actions/dashboard-page.ts; src/app/dashboard/page.tsx
- Evidence: Local comparison after sync-payload split shows cold p95 delta -8197 ms (-32.58%).
- Metric before: Dashboard cold p95 6897 ms
- Why it matters: Dashboard is the primary authenticated landing page; the local fix needs credentialed production-like confirmation.
- Suspected cause: Dashboard sync dedupe needs production-auth monitoring
- Recommended fix: see `15_recommendations.md` and use measurement-backed reversible changes.
- Expected impact: reduce p95 wait, payload, or operational timeout risk.
- Verify fix: Rerun dashboard route/user-flow p95 with safe auth fixture and compare request counts/server logs.
- Timing: monitor and budget
