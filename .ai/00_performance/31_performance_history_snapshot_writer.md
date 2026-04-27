# 31 — Performance History Snapshot Writer

Generated: 2026-04-27T02:14:57.748Z

## What was added
- `.ai/00_performance/scripts/snapshot-performance.mjs`
- `package.json` script: `bun run perf:snapshot`

## Command
`bun run perf:snapshot -- --mode=local-dev --label=loop2-precommit`

## Output shape
`.ai/00_performance/results/history/<timestamp>-<mode>-<label>/`

The snapshot copies current machine-readable result files when present:
- `frontend_navigation_results.json`
- `frontend_user_flows_results.json`
- `build_startup_results.json`
- `supabase_query_inventory.json`
- `component_hotspot_inventory.json`
- `baseline_summary.json`
- `environment.json`
- `api_benchmark_results.json`
- `manifest.json`

## Safety
The snapshot writer copies result JSON only and writes safe metadata: commit, branch, dirty flag, copied file list, and log file names. It does not read or write secret values.

## Evidence
- Snapshot command log: `.ai/00_performance/logs/loop2-perf-snapshot.log`
- History root: `.ai/00_performance/results/history/`

## CI note
Do not hard-fail CI on snapshots yet. Use them to accumulate at least three comparable baselines before enforcing budgets.

## Loop 3 snapshot
After the full frontend suite passed, a history snapshot was written with:

```bash
bun run perf:snapshot -- --mode=local-dev --label=loop3-full-frontend-green
```

Evidence log: `.ai/00_performance/logs/loop3-perf-snapshot-after-full-frontend.log`.
