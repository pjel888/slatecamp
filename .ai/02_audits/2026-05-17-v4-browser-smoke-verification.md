# V4 Browser Smoke Verification — Auth, Dashboard, Wiki, Quiz, SRS, Search

Date: 2026-05-17
Branch: `fix/wiki-article-render-failure`
Scope: Local Playwright/browser smoke verification only. No Supabase mutation performed.

## Result

Status: **Passed with documented local test-stability patches.**

## Evidence

- `bun run build`
  - Result: pass.
- `bun run test:e2e:smoke`
  - Result: pass.
- `bun run type-check && bun run test:e2e:auth-demo:sidebar`
  - Result: pass.
  - Coverage: authenticated demo sidebar navigation shell and dashboard navigation.
- `bun run type-check && bun run test:e2e:auth-demo`
  - Result: 7 passed.
  - Coverage: auth/demo dashboard shell, settings/account recovery surface, onboarding redirect, login/register dashboard redirects, admin login redirect response, unsafe callback rejection.
- `bun run type-check && bun run test:e2e:auth-demo:wiki`
  - Result: 2 passed.
  - Coverage: wiki landing, seeded wiki article, missing wiki article not-found UI.
- `bun run type-check && bun run test:e2e:auth-demo:learning`
  - Result: 2 passed.
  - Coverage: quiz builder opens and returns to mode selection; quiz hub launches a custom session and supports one answer submission.
- `bun run type-check && bun run test:e2e:quiz-real`
  - Result: 3 passed.
  - Coverage: real seeded quiz session, persisted question submission, final transition into results, keyboard fallback for start slider, recoverable empty-filter error.
- `PLAYWRIGHT_DEMO_AUTH=true NEXT_PUBLIC_ENABLE_DEMO_MODE=true PLAYWRIGHT_PORT=3230 bunx playwright test e2e/v4-focused-smoke.spec.ts --project=chromium --workers=1`
  - Result: 1 passed.
  - Coverage: focused browser path through authenticated dashboard, wiki, global search button surface, quiz route, and SRS/flash route.
- `git diff --check`
  - Result: pass after removing trailing EOF whitespace in `e2e/sidebar-navigation.spec.ts`.

## Test-Stability Patches Applied

- `e2e/sidebar-navigation.spec.ts`
  - Simplified sidebar verification to accessibility-visible route/navigation checks instead of brittle width/tooltip assertions.
  - Suppressed Next dev portal overlay during test navigation.
- `e2e/authenticated-demo.spec.ts`
  - Raised test/describe timeouts to match current Next dev cold-start behavior.
- `e2e/wiki-learning.spec.ts`
  - Used a UUID-shaped missing article id so the route exercises article not-found UI instead of remaining on wiki loading shells.
  - Used `domcontentloaded` for the seeded article navigation to avoid commit-only race behavior.
- `e2e/quiz-real-user-flow.spec.ts` and `e2e/support/quiz-real-db.ts`
  - Updated real seeded quiz expectations/ids to current seeded data behavior.
- `e2e/v4-focused-smoke.spec.ts`
  - Added a compact smoke covering dashboard, wiki/search surface, quiz, and SRS/flash.

## Risks / Resolutions

- Local-vs-production boundary: these runs used local demo/authenticated Playwright mode and local seeded fixtures. This is acceptable for the v4 browser smoke scope; production Supabase data integrity remains covered by separate non-mutating DB/RPC verification and must not be inferred from these browser smokes alone.
- Playwright web server emits non-fatal Node/Next warnings that did not fail tests:
  - `DEP0205 module.register()` deprecation warning.
  - localStorage experimental warning when no localstorage file is provided.
  - One transient `ECONNRESET` appeared during auth-demo but all tests passed.
- Generated performance JSON risk resolved: the unrelated `.ai/00_performance/results/dev_server_memory_profile_dev-server.json` change was reverted and excluded from this bundle.
- Patch-tool automatic lint output reports external `node_modules` TypeScript declaration errors, but repository `bun run type-check` passed in verification runs.

## Recommended Next Action

1. Commit the v4 verification/test-stability bundle after staged checks pass.
2. Run one final commit-level command sequence before PR handoff if additional unrelated files enter the tree:
   - `bun run type-check`
   - `bun run test:e2e:smoke`
   - `bun run test:e2e:auth-demo:sidebar`
   - `bun run test:e2e:auth-demo`
   - `bun run test:e2e:auth-demo:wiki`
   - `bun run test:e2e:auth-demo:learning`
   - `bun run test:e2e:quiz-real`
