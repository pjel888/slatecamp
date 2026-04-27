# 16 — Open Questions and Blockers

Generated: 2026-04-27T04:04:04.250Z

| Area | Blocker / open question | Proposed next step |
| --- | --- | --- |
| 3D Lab full-suite memory warning | Latest full perf:frontend passed, but Next dev server still emitted a memory-threshold restart warning near the dashboard/analytics/3D segment. | Keep /dashboard/3d-lab warning-only, collect heap profiles, and require three comparable green full-suite runs before hard gating. |
| Live Supabase latency/EXPLAIN | No safe read-only DB/test credentialed execution path was used. | Provide local seeded Supabase or staging read-only role and run targeted EXPLAIN manually. |
| Real Supabase Auth provider latency | Demo auth can measure authenticated screens without secrets, but it does not measure real Supabase Auth provider latency or credential-submit timing. | Use externally supplied staging/test credentials via PLAYWRIGHT_TEST_EMAIL/PLAYWRIGHT_TEST_PASSWORD or admin equivalents; never store values. |
| OMX tmux team runtime | Current surface is Codex App/native outside tmux; tmux team panes cannot be launched here. | Run from attached OMX CLI tmux shell if durable team-pane coordination is required. |
| GitNexus detect_changes | Deferred GitNexus MCP tools were unavailable and npx gitnexus failed; see logs/gitnexus-help.log. | Use the configured GitNexus MCP/CLI in a repaired environment before committing if graph-level scope verification is required. |

## Open questions
1. Which routes should become launch-critical hard performance gates versus warning-only observability?
2. What staging credential model can safely support real login/signup/logout timings without storing secrets?
3. Which admin/CEO datasets are representative enough for performance fixtures?
4. Which Supabase queries are intentionally broad and should be allowlisted versus fixed?
5. What production RUM provider or custom telemetry path should capture Core Web Vitals after launch?
