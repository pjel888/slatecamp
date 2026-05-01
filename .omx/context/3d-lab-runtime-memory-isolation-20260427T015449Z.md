# Context Snapshot — 3D Lab Runtime/Memory Isolation

## Task statement
Continue the SlateCamp performance Ralph-loop without redoing the broad audit. Resolve or precisely isolate the highest-priority blocker: `/dashboard/3d-lab` runtime/memory failure, keeping all evidence in `.ai/00_performance`.

## Desired outcome
- `/dashboard/3d-lab` route can be measured in isolation in dev and built modes, with preserved raw JSON/logs/traces/screenshots.
- Dashboard metric discrepancy is reconciled and canonical wording is fixed.
- 3D Lab hub metadata/full-config split is implemented if safe, with before/after chunk/runtime measurements.
- Authenticated built-app fixture attempt is documented without secrets.
- Performance history snapshot writer and next regression-gate update are added.
- Final verification is run; full `perf:frontend` is attempted and either passes or its failure is preserved.

## Known facts/evidence
- Previous full `bun run perf:frontend` failed on `/dashboard/3d-lab` after Next dev server memory-threshold restart and 180s Playwright timeout.
- Prior 3D direct-import cleanup reduced hub raw client-reference signal bytes from 3419.7 KiB to 2120.8 KiB and removed R3F/drei/viewer symbols from the hub manifest.
- Registry still imports 209 module config files; `module-paths.ts` still imports `ALL_MODULES`.
- Built-app public/protected-redirect nav is fast but protected routes are login redirects, not authenticated content.
- Working tree was dirty before this loop; do not revert unrelated files.
- GitNexus tools are unavailable in this session; compensate with manual import/caller tracing and document the gap.
- Tmux `$team` runtime is unavailable because `$TMUX` is empty; native subagents may be used for bounded read-only lanes.

## Constraints
- No speculative optimization: every code change needs baseline evidence, hypothesis, minimal reversible change, before/after measurement.
- No secrets or user data in logs. Env variable names only.
- Keep all new evidence under `.ai/00_performance`.
- Do not optimize admin/editor or mass-limit Supabase queries in this loop.
- Preserve module detail behavior.
- Use Bun for scripts.

## Unknowns/open questions
- Does the perf harness already support route filtering? If not, add `PERF_ROUTE_FILTER` minimally.
- Is metadata already available somewhere separate from full config? If not, can metadata be generated or statically extracted safely?
- Does built-app demo mode need build-time env rather than runtime env?
- Does metadata split reduce dev-server memory restarts enough to rejoin full `perf:frontend`?

## Likely codebase touchpoints
- `.ai/00_performance/playwright/perf.spec.ts`
- `.ai/00_performance/scripts/*.mjs`
- `package.json`
- `src/features/3d-lab/config/registry/index.ts`
- `src/features/3d-lab/config/registry/cat-*.ts`
- `src/features/3d-lab/config/module-paths.ts`
- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/features/3d-lab/components/*`
