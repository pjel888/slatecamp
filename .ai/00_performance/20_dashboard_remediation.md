# 20 — Dashboard Remediation

Generated: 2026-04-27T00:21:06.493Z

## Hypothesis
The dashboard client-side analytics/notification effect was calling the full `getDashboardPageData()` server action after hydration. That action assembles the entire dashboard payload and overlaps server-rendered dashboard tiles. Removing this full aggregate call should reduce post-hydration backend work and lower dashboard route latency variance.

## Change made

| File | Change |
| --- | --- |
| `src/components/dashboard/DashboardAnalyticsSync.tsx` | Replaced the client effect call to `getDashboardPageData()` with `getDashboardSyncPayload()`. |
| `src/lib/actions/dashboard-page.ts` | Added `getDashboardSyncPayload()`, a compact server action returning only `readinessScore`, `daysUntilExam`, `activeTrailDay`, `srsReview`, and `subjectFloorAlerts`. |
| `src/lib/actions/dashboard-page.test.ts` | Added unauthenticated default-shape regression coverage for the compact payload. |

## Behavior preservation
- Analytics still records `app_opened` with score/exam metadata when available.
- Notification sync still receives active trail, SRS, and subject-floor signals.
- The full `getDashboardPageData()` API remains unchanged for existing/tests callers.
- The compact action intentionally avoids wiki article, notes, recent sessions, heatmap, lab count, onboarding, score-update, and broad dashboard aggregate work.

## Static proof
- Client call graph evidence: `.ai/00_performance/logs/remediation-dashboard-callgraph-rg.log`.
- `DashboardAnalyticsSync` no longer imports or calls `getDashboardPageData`; it imports/calls `getDashboardSyncPayload`.

## Before/after frontend metrics
Baseline source: `.ai/00_performance/results/dev_server_frontend_baseline_before_built_app.json`
After source: `.ai/00_performance/results/dashboard_remediation_frontend_after.json`

| Metric for `/dashboard` | Before → after |
| --- | ---: |
| Cold p50 | 10265 ms → 3504 ms (-65.9%) |
| Cold p95 | 15046 ms → 3925 ms (-73.9%) |
| Warm p50 | 2986 ms → 2157 ms (-27.7%) |
| Warm p95 | 3808 ms → 3505 ms (-8.0%) |
| FCP p50 | 348 ms → 296 ms (-14.9%) |
| LCP proxy p50 | 1446 ms → 706 ms (-51.2%) |
| Request count p50 | 28 → 30 (+7.1%) |
| Transfer p50 | 5274.8 KiB → 5380.4 KiB (+2.0%) |
| Error count | 4 → 4 |

## Measurement notes
- `bun run perf:frontend` after the change exited 0 and wrote `.ai/00_performance/logs/remediation-perf-frontend-after-dashboard.log`.
- The dev server emitted a Node heap out-of-memory fatal message near the 3D Lab route after the dashboard and analytics routes had already completed; Playwright still reported 15 passed. Treat this as a separate 3D/dev-server memory bottleneck and not as dashboard proof.
- This is a local dev-server comparison with normal variance; the strongest proof is the removed full server-action call plus the large dashboard cold p95 drop.

## Verification
| Command | Exit | Log |
| --- | ---: | --- |
| `bun test src/lib/actions/dashboard-page.test.ts` | 0 | `.ai/00_performance/logs/remediation-dashboard-targeted-test.log` |
| `bun run type-check` | 0 | `.ai/00_performance/logs/remediation-type-check-after-code.log` |
| `bun run lint` | 0 | `.ai/00_performance/logs/remediation-lint-after-dashboard-supabase.log` |
| `bun run perf:frontend` | 0 | `.ai/00_performance/logs/remediation-perf-frontend-after-dashboard.log` |

## Rollback plan
Revert `DashboardAnalyticsSync` to import/call `getDashboardPageData` and remove `getDashboardSyncPayload` plus its test. This restores previous behavior at the cost of the duplicate full aggregate call.

## Remaining dashboard work
- Hero and subject mastery are still called from multiple server wrappers; cache behavior should be measured before consolidating because over-consolidation can hurt streaming.
- Results-day/transition prompt duplicate small profile/global-stats reads remain.
- Daily Dose still performs post-hydration backend work and may generate data on load; handle separately with a measured write-safety plan.
