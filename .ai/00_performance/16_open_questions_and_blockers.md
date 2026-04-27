# 16 — Open Questions and Blockers

Generated: 2026-04-27T02:16:56.449Z

| Area | Blocker / open question | Proposed next step |
| --- | --- | --- |
| Final full frontend verification | Next dev server restarted near memory threshold during /dashboard/3d-lab; Playwright timed out at 180000 ms and the browser context closed. | Treat the preserved partial run as failure evidence; isolate /dashboard/3d-lab with built-app and memory profiling before requiring the full dev-server suite to pass. |
| Live Supabase latency/EXPLAIN | No safe read-only DB/test credentialed execution path was used. | Provide local seeded Supabase or staging read-only role and run targeted EXPLAIN manually. |
| OMX tmux team runtime | Current surface is Codex App/native outside tmux; tmux team panes cannot be launched here. | Run from attached OMX CLI tmux shell if durable team-pane coordination is required. |
| GitNexus detect_changes | Deferred GitNexus MCP tools were unavailable and npx gitnexus failed; see logs/gitnexus-help.log. | Use the configured GitNexus MCP/CLI in a repaired environment before committing if graph-level scope verification is required. |

## Open questions
1. Which routes should become launch-critical hard performance gates versus warning-only observability?
2. What staging credential model can safely support real login/signup/logout timings without storing secrets?
3. Which admin/CEO datasets are representative enough for performance fixtures?
4. Which Supabase queries are intentionally broad and should be allowlisted versus fixed?
5. What production RUM provider or custom telemetry path should capture Core Web Vitals after launch?
