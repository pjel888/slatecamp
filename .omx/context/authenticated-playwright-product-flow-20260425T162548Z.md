# Authenticated Playwright Product Flow

## Task
Proceed from launch-smoke Playwright coverage into authenticated product-flow readiness.

## Desired Outcome
- Add a bounded authenticated/browser-flow test slice that can run without production secrets.
- Keep `validate:release` green.
- Preserve the existing no-root-`test` command contract.

## Known Facts
- `test:e2e`, `test:e2e:smoke`, and `validate:release` are already present.
- Current Playwright smoke covers public pages and HTTP redirect shims.
- `DISABLE_DEV_FORCE_USER_ID` exists so local `.env.local` impersonation cannot leak into anonymous route smoke.
- Demo mode uses mock Supabase data and returns a demo user without live Supabase auth.
- Real OMX team runtime is unavailable from this pane because `TMUX` is empty.

## Constraints
- Use Bun for scripts.
- Do not require service-role keys or production data in CI.
- Do not add a root `test` script.
- Keep existing dirty worktree changes intact.

## Likely Touchpoints
- `playwright.config.ts`
- `e2e/`
- `package.json`
- `.github/workflows/storybook.yml`
- `.ai/00_system/VALIDATION_MATRIX.md`
- `README.md`

## Open Questions
- Which authenticated workflows should graduate from demo-auth smoke into real seeded-user coverage once a safe test database/user contract exists?
