# Performance Remediation Run Notes

Started: 2026-04-26T23:52:22Z
Mode: Ralph-loop measured remediation after accepted local baseline
Ledger: `.ai/00_performance`

## Baseline status accepted by user
The previous run is treated as a verifier-approved **local baseline + static/perf harness**. It is not treated as a complete live/staging/production performance audit because Supabase live latency, real auth flows, mutation/API POST flows, and privileged admin/CEO routes remain blocked by missing safe fixtures or credentials.

## Current repository state
- Commit: `936d6de57efcfb850a9774eedc4967da568520e9`
- Branch: `main`
- Working tree: dirty before this remediation loop.
- Status evidence: `.ai/00_performance/logs/remediation-git-status.log`

## Dirty tree risk
The working tree contains many unrelated modified and untracked files outside `.ai/00_performance`, including E2E files, 3D Lab route/components/config, quiz-v2 components/actions, demo auth files, and Supabase server helpers. This remediation loop must not revert, normalize, or overwrite those unrelated edits. If a target remediation touches a file that is already dirty, the report for that phase must explicitly identify the pre-existing dirty state and keep the change minimal.

## Stabilization commands
| Command | Exit | Log |
| --- | ---: | --- |
| `git status --short` | 0 | `.ai/00_performance/logs/remediation-git-status.log` |
| `git rev-parse HEAD` | 0 | `.ai/00_performance/logs/remediation-git-head.log` |
| `git branch --show-current` | 0 | `.ai/00_performance/logs/remediation-git-branch.log` |
| `bun run type-check` | 0 | `.ai/00_performance/logs/remediation-type-check.log` |
| `bun run lint` | 0 | `.ai/00_performance/logs/remediation-lint.log` |
| `bun run perf:summary` | 0 | `.ai/00_performance/logs/remediation-perf-summary.log` |

## Tooling/runtime notes
- Durable tmux team-pane runtime is not available from this surface; native Codex subagents are being used only for bounded read-only parallel inspections.
- GitNexus MCP tools are not available in the exposed tool surface, and the earlier `npx gitnexus --help` attempt failed. Before source edits, compensate with manual caller/import tracing and document this graph-tooling gap.
- No secrets, cookies, service-role keys, or user data may be logged or committed.

## Remediation acceptance criteria
Every performance change must include:
1. baseline evidence,
2. a clear hypothesis,
3. a minimal reversible code change or a documented blocker,
4. before/after measurement where feasible,
5. a written result in `.ai/00_performance`.

## Final verification status — 2026-04-27T00:39Z

| Command | Exit | Log / evidence | Notes |
| --- | ---: | --- | --- |
| `bun run type-check` | 0 | `.ai/00_performance/logs/final-type-check.log` | Passed. |
| `bun run lint` | 0 | `.ai/00_performance/logs/final-lint.log` | Passed with existing warnings. |
| `bun run perf:supabase` | 0 | `.ai/00_performance/logs/final-perf-supabase.log` | Static Supabase inventory passed. |
| `bun run perf:hotspots` | 0 | `.ai/00_performance/logs/final-perf-hotspots.log` | Static hotspot inventory passed. |
| `bun run perf:build` | 0 | `.ai/00_performance/logs/final-perf-build.log` | Passed. |
| `bun run perf:frontend` | 1 | `.ai/00_performance/logs/final-perf-frontend.log`, `.ai/00_performance/results/final_frontend_failure.json`, `.ai/00_performance/results/final_frontend_failed_partial.json` | Failed on `/dashboard/3d-lab` after the Next dev server reported memory-threshold restart; 13 routes passed before the 3D Lab timeout. The canonical frontend result was restored to the last complete successful local-dev baseline so generated summaries do not silently omit the 3D Lab route. |

The exact requested full frontend verification is therefore **not green**. It is a documented remaining bottleneck/blocker, not hidden. The next loop should isolate `/dashboard/3d-lab` under built-app measurement and memory profiling before making the dev-server full suite a hard pass condition.

## Final summary/diff completion — 2026-04-27T00:46Z

| Command | Exit | Log | Notes |
| --- | ---: | --- | --- |
| `bun run perf:summary` | 0 | `.ai/00_performance/logs/final-perf-summary-rerun3.log` | Regenerated README, baseline summary, ranked bottlenecks, recommendations, and blockers after documenting the final frontend failure. |
| `git diff --check` | 0 | `.ai/00_performance/logs/final-diff-check-rerun3.log` | No whitespace errors. |
