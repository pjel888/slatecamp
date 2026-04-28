# Implementation Tracker

**Last Updated:** 2026-04-28

## Tracker

| ID | Category | Issue | Severity | Priority | File(s) | Fix Required | Status | Verification | Notes |
|----|----------|-------|----------|----------|---------|--------------|--------|--------------|-------|
| SEC-01 | Security | `generateTestSessions` lacks developer role check | Medium | P0 | `src/lib/actions/dev/test-data.ts` | Add `assertDeveloperAccess()` | Verified | Unit + E2E | `assertDeveloperAccess()` added; unit test covers rejection |
| SEC-02 | Security | `generateTestOrg` lacks developer role check | Medium | P0 | `src/lib/actions/dev/test-data.ts` | Add `assertDeveloperAccess()` | Verified | Unit + E2E | `assertDeveloperAccess()` added; unit test covers rejection |
| SEC-03 | Security | `getTableInfo` lacks developer role check | Medium | P0 | `src/lib/actions/dev/db-viewer.ts` | Add `assertDeveloperAccess()` | Verified | Unit + E2E | `assertDeveloperAccess()` added; unit test covers rejection |
| SEC-04 | Security | No page-level guards on sensitive sub-routes | Low | P1 | `src/app/developer/tools/*/page.tsx` | Add `assertDeveloperAccess()` to pages | Verified | E2E | Already present in console, test-data, db, and logs pages |
| SEC-05 | Security | No rate limiting on test data generation | Medium | P1 | `src/lib/actions/dev/test-data.ts` | Add rate limit | Verified | Unit test | `checkRateLimit()` already applied to both actions |
| SEC-06 | Security | No audit logging for test data mutations | Medium | P1 | `src/lib/actions/dev/test-data.ts` | Add `logServerEvent` calls | Verified | DB check | `logServerEvent()` already present for both actions |
| SEC-07 | Security | Console page exposes userId/email to client | Low | P2 | `src/app/developer/tools/console/page.tsx` | Evaluate necessity | Verified | Review | Intentional: only developers can access; data shown is the current user's own info |
| FUNC-01 | Functionality | `getDeveloperServiceStatusSnapshot` fetch has no timeout | Low | P2 | `src/lib/developer/status-snapshot.ts` | Add `AbortSignal` timeout | Verified | Unit test | `AbortSignal.timeout(5000)` already present |
| FUNC-02 | Functionality | Overview page uses `performance.now()` in RSC | Low | P2 | `src/app/developer/page.tsx` | Remove or clarify | Verified | Visual check | Latency measurement is on status page (correct); overview has none |
| FUNC-03 | Functionality | Test data `count` parameter not validated | Low | P2 | `src/lib/actions/dev/test-data.ts` | Add Zod or manual validation | Verified | Unit test | `Math.max(1, Math.min(100, count))` already present |
| UX-01 | UX/UI | `EndpointCard` uses `<div onClick>` without keyboard support | High | P1 | `src/app/developer/_components/EndpointCard.tsx` | Add button semantics/keyboard | Verified | Manual + axe | Converted clickable header to native `<button>` with `aria-expanded` |
| UX-02 | UX/UI | `DevPortalSearch` lacks accessible name | Medium | P1 | `src/app/developer/_components/DevPortalSearch.tsx` | Add `aria-label` | Verified | axe | Trigger button already has `aria-label`; CommandPalette dialog has title/desc |
| UX-03 | UX/UI | Test data generator has no confirmation | Medium | P1 | `src/app/developer/tools/test-data/test-data-client.tsx` | Add confirmation dialog | Verified | E2E | `AlertDialog` confirmation already present for both actions |
| UX-04 | UX/UI | Test data generator uses raw `<button>` | Low | P2 | `src/app/developer/tools/test-data/test-data-client.tsx` | Use design system Button | Verified | Visual check | Already uses `<Button>` from design system |
| UX-05 | UX/UI | Status pages skip `<h1>` heading | Medium | P2 | All developer pages | Ensure h1 present | Verified | axe | `SectionHeader level="page"` renders `<h1>` on all pages |
| A11Y-01 | Accessibility | `UptimeBar` day segments lack `aria-label` | Medium | P2 | `src/components/developer/UptimeBar.tsx` | Add `aria-label` | Verified | Screen reader | Each segment already has `aria-label` with date and status |
| A11Y-02 | Accessibility | Connection pool bar segments lack `aria-label` | Low | P2 | `src/app/developer/status/database/page.tsx` | Add `aria-label` | Verified | Screen reader | Each segment already has `aria-label` with count and `role="img"` |
| A11Y-03 | Accessibility | No skip link in layout | Low | P3 | `src/app/developer/layout.tsx` | Add skip link | Verified | Keyboard test | `PortalLayout` already includes skip link targeting `#portal-main` |
| TEST-01 | Tests | No unit tests for dev actions | Medium | P1 | `src/lib/actions/dev/` | Write tests | Verified | `bun test` | `access.test.ts` (8 tests), `test-data.test.ts` (5 tests), `db-viewer.test.ts` (2 tests) — all passing |
| TEST-02 | Tests | No E2E for test data workflow | Medium | P2 | `e2e/` | Write E2E spec | Deferred | `bun run test:e2e` | Positive auth coverage exists; test-data action is covered by unit tests |
| CROSS-01 | Security | CEO analytics Server Actions lack auth guards | Critical | P0 | `src/lib/queries/ceo/analytics/*.ts` | Add `assertCeoAccess()` | Verified | `bun test` | Guard created and applied to all 9 analytics files |
| CROSS-02 | Security | CEO financial queries lack auth guards | High | P0 | `src/lib/queries/ceo/financial-queries.ts` | Add `assertCeoAccess()` | Verified | `bun test` | Guard applied to all 5 exported functions |
| CROSS-03 | Security | Dev force user override inconsistent | Medium | P1 | `src/lib/supabase/middleware.ts` | Align checks | Verified | Code review | Removed `isLocal` check from middleware; now matches `resolve-role.ts` |
| CROSS-04 | Security | `ceoPortal` not in `evaluateFeatureAccess` | Medium | P1 | `src/lib/entitlements/resolve-entitlements.ts` | Add evaluation block | Verified | `bun test` | Added explicit `ceoPortal` policy evaluation |
| CROSS-05 | Security | No centralized CEO access guard | Medium | P1 | `src/lib/ceo/` | Create `assertCeoAccess()` | Verified | `bun test` | New guard + unit test created |
| TEST-03 | Tests | E2E may need updates for auth fixes | Medium | P1 | `e2e/admin-permissions-developer.spec.ts` | Update if needed | Verified | E2E pass | Added sub-page coverage (console, db, logs); negative auth already in restricted spec |

## Status Key

- **Not started** — No work done
- **In progress** — Currently implementing
- **Implemented** — Code written, not yet verified
- **Verified** — Code written and tests pass
- **Blocked** — External dependency or blocker
- **Deferred** — Intentionally postponed
