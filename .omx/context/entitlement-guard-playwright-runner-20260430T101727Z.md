# Ralph Context Snapshot: Entitlement guard Playwright runner allowance

## Task statement
Do the smartest next step after the auth/status/feature-flag preparation package: clear the current Gate 1 blocker where `bun run check:entitlements` fails because `scripts/playwright-run.ts` sets `DEV_FORCE_USER_ID` for real-db quiz/drills E2E.

## Desired outcome
Make `bun run check:entitlements` pass without changing runtime auth/entitlement behavior and document the rationale in the high-risk cleanup prep docs.

## Known facts/evidence
- Prep docs identified `scripts/playwright-run.ts:176 [direct-dev-force-usage]` as current Gate 1 blocker.
- `scripts/check-entitlement-legacy-usage.ts` already allowlists canonical entitlement boundaries and some test/dev harness files, including `scripts/playwright-web-server.ts`.
- The flagged line is in the Playwright `quiz-real` / `drills-real` lane and sets `DEV_FORCE_USER_ID` to the deterministic test user for real-db E2E.

## Constraints
- Do not alter production auth/entitlement behavior.
- Keep the allowance narrow and explicit.
- Do not touch payment or AI.
- Verify with `bun run check:entitlements`, targeted related tests, and `git diff --check`.
- Team tmux runtime is unavailable in this native session.

## Unknowns/open questions
- Whether guard comments should explicitly distinguish test harness env setup from runtime product code.

## Likely codebase touchpoints
- `scripts/check-entitlement-legacy-usage.ts`
- `scripts/playwright-run.ts`
- `.ai/03_plans/auth-status-feature-flag-cleanup/00-preparation-brief.md`
- `.ai/03_plans/auth-status-feature-flag-cleanup/03-readiness-gates.md`
- `.ai/03_plans/auth-status-feature-flag-cleanup/05-test-validation-matrix.md`
