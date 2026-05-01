# Ralph Context Snapshot: Playwright Release Validation

## Task Statement

Implement the next production-readiness step requested by the user: make Playwright testing first-class and wire it into a repeatable release validation path.

## Desired Outcome

- Add an explicit Playwright E2E setup instead of relying on the existing ad-hoc browser audit script.
- Add package scripts for E2E and release validation.
- Add a small, stable first-pass E2E suite covering public pages and auth/protected-route smoke.
- Keep existing route-audit evidence useful.
- Update validation/docs so future agents know the real commands.
- Verify with fresh command output before completing Ralph.

## Known Facts / Evidence

- `package.json` currently has no root `test`, `test:e2e`, or `validate:release` script.
- `@playwright/test` is not a declared dependency.
- `playwright` is present only transitively in `bun.lock` through `boneyard-js`.
- No `playwright.config.*` exists in the repo.
- `scripts/audits/auth-route-browser.ts` imports `chromium` from `playwright`, but the latest evidence file is `manifestOnly: true`, so it is not a proper user-flow test suite.
- `.ai/00_system/VALIDATION_MATRIX.md` explicitly says there is no root `test` script today.
- `docs/product-ux-ui-feature-audit.md` lists release validation aggregate and browser proof as remaining readiness work.
- Existing unit/test files under `src` total 66.

## Constraints

- Use Bun for package/script execution.
- Do not invent legacy compatibility paths; pre-launch MVP can use current/lean paths.
- Keep changes small and release-oriented.
- Do not expose or use secrets.
- Do not replace `$team` with native subagent fanout; use OMX team runtime when available.
- Current leader shell is not inside tmux (`TMUX=`), so durable team launch may be blocked by runtime preconditions.

## Unknowns / Open Questions

- Whether `omx team` can launch workers without the leader shell being inside tmux.
- Whether local Playwright browser binaries are already installed.
- Whether full `bun run build` is green after the recent larger worktree changes.

## Likely Touchpoints

- `package.json`
- `bun.lock`
- `playwright.config.ts`
- `e2e/**`
- `.ai/00_system/VALIDATION_MATRIX.md`
- `docs/product-ux-ui-feature-audit.md`
- Potentially `scripts/audits/auth-route-browser.ts` if the browser audit should use the direct Playwright dependency.
