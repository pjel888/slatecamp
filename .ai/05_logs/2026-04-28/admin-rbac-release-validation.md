# Admin / Developer / CEO RBAC Release Validation — 2026-04-28

## Status

Verifier-approved local release-validation baseline is green for the combined admin/developer/CEO RBAC and demo-auth stabilization work.

- Branch: `main`
- Pre-commit HEAD: `3a2b32805c66aac87e2428c5656f0c6b502e7294`
- Full release validation log: `.ai/05_logs/2026-04-28/validate-release-final-green-9.log`
- Final targeted CEO browser-error assertion rerun: `.ai/05_logs/2026-04-28/e2e-auth-demo-ceo-portal-browser-errors-restored.log`

## What changed

- Centralized CEO access enforcement via `src/lib/ceo/access.ts` and guarded CEO analytics/financial query functions.
- Preserved admin/developer permission boundaries while adding role-specific demo lanes for content admin, SME reviewer, developer, CEO, member denial, wiki, learning, and 3D Lab.
- Removed request/env-sensitive no-arg cache wrappers from auth role/client helpers so Playwright demo role changes do not bleed across lanes.
- Stabilized Next dev-server Playwright lanes by clearing stale `.next/dev` cache before dev-server launches and wrapping `next build` with stale-lock handling.
- Stabilized wiki and portal demo smoke coverage with commit-level navigation waits and route-specific timeouts for cold Next dev compiles.

## Validation evidence

| Command | Result | Log |
| --- | --- | --- |
| `bun run validate:release` | PASS | `.ai/05_logs/2026-04-28/validate-release-final-green-9.log` |
| `bun test src/lib/entitlements/resolve-role.test.ts src/lib/developer/access.test.ts src/lib/actions/dev/db-viewer.test.ts src/lib/actions/dev/test-data.test.ts src/lib/admin/roles.test.ts src/lib/entitlements/policy.test.ts src/lib/supabase/middleware.test.ts src/lib/ceo/access.test.ts` | PASS: 52 pass, 0 fail | `.ai/05_logs/2026-04-28/unit-rbac-access-final.log` |
| `bun run test:e2e:auth-demo:portals` | PASS: 5 pass | `.ai/05_logs/2026-04-28/e2e-auth-demo-portals-extended-timeout.log` |
| `bun run test:e2e:auth-demo:ceo-portal` | PASS: 1 pass with browser-error fixture restored | `.ai/05_logs/2026-04-28/e2e-auth-demo-ceo-portal-browser-errors-restored.log` |
| `git diff --check` | PASS after whitespace cleanup | `.ai/05_logs/2026-04-28/git-diff-check-after-whitespace.log` |

`validate:release` covered: type-check, lint, entitlement legacy usage check, `bun audit`, production build, production unauthenticated E2E, demo authenticated first-run flow, learning flow, wiki flow, restricted-member denial flow, privileged portal flow, 3D Lab flow, admin role matrix lanes, and CEO portal flow.

## Expected negative-auth logs

The restricted-member lane intentionally triggers server-side admin and CEO authorization errors to prove protected surfaces deny a member. Those stack traces in the web-server output are expected test evidence, not release failures, because the Playwright assertions verify redirect/error-denial behavior.

## Remaining risks

- `bun run lint` is green but still reports the existing repository warning inventory: 344 warnings, 0 errors.
- Live/staging credentialed CEO role assignment remains unverified without safe fixture credentials.
- GitNexus marked the unstaged change set as `critical` because many admin/auth routes and flows are affected; the risk is mitigated by full release validation plus targeted unit/RBAC tests.
