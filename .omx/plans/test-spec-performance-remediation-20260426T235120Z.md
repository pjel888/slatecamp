# Test Spec — Performance Remediation Loop

## Required stabilization checks
- `bun run type-check`
- `bun run lint`
- `bun run perf:summary`

## Production-like frontend baseline
- Preserve the current dev-server raw JSON before running built-app measurement.
- Run `PLAYWRIGHT_USE_BUILT_APP=true bun run perf:frontend` if supported.
- Run `bun run perf:build` and `bun run perf:summary` after built-app capture.
- Compare cold/warm route durations, FCP, LCP proxy, requests, transfer bytes, slowest routes/resources, and errors.

## Remediation verification
For every code change:
1. Record before evidence and hypothesis.
2. Apply a minimal reversible change.
3. Run targeted checks plus `bun run type-check` and `bun run lint`.
4. Run the relevant perf script(s) and preserve raw JSON/logs.
5. Write a before/after result document under `.ai/00_performance`.

## Final required commands
- `bun run type-check`
- `bun run lint`
- `bun run perf:supabase`
- `bun run perf:hotspots`
- `bun run perf:build`
- `bun run perf:frontend`
- `bun run perf:summary`
- `git diff --check`

## Failure handling
If a command fails, preserve the log, diagnose the cause, fix safe harness/code issues, or document the blocker and next best command. Never hide a failed measurement.
