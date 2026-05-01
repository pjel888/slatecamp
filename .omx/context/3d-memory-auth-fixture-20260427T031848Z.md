# 3D memory/auth fixture Ralph context

## Task statement
Proceed with practical next loop: add dev-server memory profiler to perf harness, run route sequence isolation, implement credential/demo auth built-app fixture, re-run built-app authenticated /dashboard/3d-lab, and decide hard-gate eligibility.

## Desired outcome
Versioned performance ledger evidence under `.ai/00_performance` proving whether the memory warning and authenticated built-app measurement blockers are fixed, reduced, or still blocked with exact reasons.

## Known facts/evidence
- Prior commit `08f0c8ce` proved full local dev `bun run perf:frontend` passes after 3D metadata split.
- Latest ledger says memory-threshold restart warning remains and authenticated built-app timing remains blocked.
- Existing harness: `.ai/00_performance/playwright/perf.spec.ts` and `playwright.perf.config.ts`.
- Existing scripts: `perf:frontend`, `perf:build`, `perf:summary`, `perf:snapshot`.

## Constraints
- No secrets in logs/results; only env variable names/presence may be recorded.
- Prefer existing tools; no new packages unless necessary.
- Keep changes reversible and measurement-led.
- Built-app protected-route measurement must end at `/dashboard/3d-lab`, not login redirect, to count as authenticated content.
- Direct tmux team runtime unavailable if `$TMUX` is empty.

## Unknowns/open questions
- How Playwright webServer is currently started and whether PID/RSS can be measured directly.
- Whether demo auth can work in production build without privileged admin prerender failing.
- Whether credential storage-state setup already exists.

## Likely codebase touchpoints
- `.ai/00_performance/playwright/perf.spec.ts`
- `.ai/00_performance/playwright/playwright.perf.config.ts`
- `.ai/00_performance/scripts/*.mjs`
- `e2e/support/authenticated-demo.ts`
- `src/lib/demo/*`
- `src/lib/supabase/server.ts`
- `package.json`
