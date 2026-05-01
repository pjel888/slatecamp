# Test Spec — 3D Lab Runtime/Memory Performance Remediation

## Required commands
- `git status --short`
- `git rev-parse HEAD`
- `git branch --show-current`
- `bun run type-check`
- `bun run lint`
- `bun run perf:summary`
- `PERF_ROUTE_FILTER=/dashboard/3d-lab bun run perf:frontend`
- `PLAYWRIGHT_USE_BUILT_APP=true PERF_USER_FLOWS=false PERF_ROUTE_FILTER=/dashboard/3d-lab bun run perf:frontend`
- `bun run perf:build`
- `bun run perf:supabase`
- `bun run perf:hotspots`
- `git diff --check`
- Final attempted `bun run perf:frontend`

## Evidence expectations
- Logs in `.ai/00_performance/logs`.
- Raw JSON in `.ai/00_performance/results`.
- Reports 27–32 in `.ai/00_performance`.
- Failure evidence preserved if route/full suite fails.
