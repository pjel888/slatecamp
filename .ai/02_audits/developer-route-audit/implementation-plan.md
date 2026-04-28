# Implementation Plan

**Last Updated:** 2026-04-28

## Sprint 0: Baseline and Safety Cleanup

| Task | Priority | Files | Problem | Implementation | Acceptance Criteria | Tests |
|------|----------|-------|---------|----------------|---------------------|-------|
| Create `assertDeveloperAccess()` helper | P0 | `src/lib/developer/access.ts` | No centralized developer auth check | Create helper using `getViewerEntitlements` | Helper throws for non-developers | Unit test |
| Fix `generateTestSessions` auth | P0 | `src/lib/actions/dev/test-data.ts` | Any authenticated user can generate test data | Add `assertDeveloperAccess()` at top | Member gets rejected | E2E |
| Fix `generateTestOrg` auth | P0 | `src/lib/actions/dev/test-data.ts` | Any authenticated user can create orgs | Add `assertDeveloperAccess()` at top | Member gets rejected | E2E |
| Fix `getTableInfo` auth | P0 | `src/lib/actions/dev/db-viewer.ts` | Any authenticated user can browse tables | Add `assertDeveloperAccess()` at top | Member gets rejected | E2E |

## Sprint 1: Security/RBAC Hardening

| Task | Priority | Files | Problem | Implementation | Acceptance Criteria | Tests |
|------|----------|-------|---------|----------------|---------------------|-------|
| Add page guard to console | P1 | `src/app/developer/tools/console/page.tsx` | No page-level guard | Add `assertDeveloperAccess()` | Non-developer redirected | E2E |
| Add page guard to test-data | P1 | `src/app/developer/tools/test-data/page.tsx` | No page-level guard | Add `assertDeveloperAccess()` | Non-developer redirected | E2E |
| Add page guard to db | P1 | `src/app/developer/tools/db/page.tsx` | No page-level guard | Add `assertDeveloperAccess()` | Non-developer redirected | E2E |
| Add page guard to logs | P1 | `src/app/developer/tools/logs/page.tsx` | No page-level guard | Add `assertDeveloperAccess()` | Non-developer redirected | E2E |
| Add rate limit to test data | P1 | `src/lib/actions/dev/test-data.ts` | No rate limiting | Add simple rate limit (e.g., 10 per minute per user) | Excessive calls rejected | Unit test |
| Add audit logging to test data | P1 | `src/lib/actions/dev/test-data.ts` | No audit trail | Log mutation via `logServerEvent` | Audit event persisted | Verify in DB |

## Sprint 2: Functionality Fixes

| Task | Priority | Files | Problem | Implementation | Acceptance Criteria | Tests |
|------|----------|-------|---------|----------------|---------------------|-------|
| Fix status fetch timeout | P2 | `src/lib/developer/status-snapshot.ts` | No timeout on external fetch | Add `AbortSignal` with 5s timeout | Fetch timeout handled gracefully | Unit test |
| Fix `performance.now()` in overview | P2 | `src/app/developer/page.tsx` | `performance.now()` in RSC is meaningless | Remove latency from overview (keep on status page) | Overview shows counts only | Visual check |
| Improve test data error messages | P2 | `src/app/developer/tools/test-data/test-data-client.tsx` | Generic error messages | Show specific error from action | Error messages are actionable | E2E |
| Add input validation to test data | P2 | `src/lib/actions/dev/test-data.ts` | `count` not validated | Validate `count` is 1-100 | Invalid count rejected | Unit test |

## Sprint 3: UX/UI Improvements

| Task | Priority | Files | Problem | Implementation | Acceptance Criteria | Tests |
|------|----------|-------|---------|----------------|---------------------|-------|
| Fix EndpointCard accessibility | P1 | `src/app/developer/_components/EndpointCard.tsx` | `<div onClick>` not keyboard accessible | Change to `<button>` or add role/tabindex/keyboard handler | Keyboard reachable, aria-expanded | Manual test |
| Fix DevPortalSearch a11y | P1 | `src/app/developer/_components/DevPortalSearch.tsx` | No accessible name, poor focus | Add `aria-label`, improve focus ring | axe DevTools passes | axe |
| Replace raw buttons in TestDataClient | P2 | `src/app/developer/tools/test-data/test-data-client.tsx` | Raw `<button>` | Use design system `Button` | Consistent styling | Visual check |
| Add confirmation to test data | P1 | `src/app/developer/tools/test-data/test-data-client.tsx` | No confirmation for destructive-like action | Add `alert-dialog` confirmation | User must confirm | E2E |
| Fix heading hierarchy | P2 | All developer pages | No `<h1>` | Change `SectionHeader level="page"` to render `h1` or add hidden `h1` | axe passes heading order | axe |

## Sprint 4: Accessibility Improvements

| Task | Priority | Files | Problem | Implementation | Acceptance Criteria | Tests |
|------|----------|-------|---------|----------------|---------------------|-------|
| Add aria-label to UptimeBar | P2 | `src/components/developer/UptimeBar.tsx` | Day segments have no accessible name | Add `aria-label` with date and status | Screen reader announces | Screen reader |
| Add aria-label to pool bar segments | P2 | `src/app/developer/status/database/page.tsx` | Pool bar segments use `title` only | Add `aria-label` | Screen reader announces | Screen reader |
| Add skip link to layout | P3 | `src/app/developer/layout.tsx` | No skip navigation | Add skip link component | Keyboard users can skip nav | Keyboard test |
| Add focus return to EndpointCard | P2 | `src/app/developer/_components/EndpointCard.tsx` | No focus management on expand | Return focus to trigger on collapse | Focus returns correctly | Manual test |

## Sprint 5: Tests and Coverage

| Task | Priority | Files | Problem | Implementation | Acceptance Criteria | Tests |
|------|----------|-------|---------|----------------|---------------------|-------|
| Add unit test for `assertDeveloperAccess` | P1 | `src/lib/developer/access.test.ts` | No unit tests for dev auth | Write tests for allow/deny | Tests pass | `bun test` |
| Add unit test for test data actions | P1 | `src/lib/actions/dev/test-data.test.ts` | No tests for test data | Write tests for success/error/auth | Tests pass | `bun test` |
| Add unit test for db viewer | P1 | `src/lib/actions/dev/db-viewer.test.ts` | No tests for db viewer | Write tests for RPC and fallback | Tests pass | `bun test` |
| Update E2E for security fixes | P1 | `e2e/admin-permissions-developer.spec.ts` | Existing E2E may need updates | Add negative auth tests | E2E passes | `bun run test:e2e` |
| Add E2E for test data workflow | P2 | `e2e/developer-portal-functionality.spec.ts` | No E2E for test data | Write SC-06 scenario | E2E passes | `bun run test:e2e` |

## Sprint 6: Docs and Final Verification

| Task | Priority | Files | Problem | Implementation | Acceptance Criteria | Tests |
|------|----------|-------|---------|----------------|---------------------|-------|
| Update AGENTS.md | P2 | `src/app/developer/AGENTS.md`, `src/lib/developer/AGENTS.md` | May be outdated | Update reality refresh | Accurate file counts | Visual check |
| Update audit docs | P2 | `.ai/02_audits/developer-route-audit/` | Need to reflect implemented state | Update all docs | Docs match code | Read-through |
| Run type-check | P0 | All changed files | Type safety | `bun run type-check` | Passes | `bun run type-check` |
| Run lint | P0 | All changed files | Code style | `bun run lint` | Passes | `bun run lint` |
| Run unit tests | P0 | All changed files | Test coverage | `bun test src/lib/developer/ src/lib/actions/dev/` | Passes | `bun test` |
| Run E2E tests | P0 | Developer-related specs | E2E coverage | `bun run test:e2e:auth-demo:admin-developer` | Passes | E2E |

## Verification Commands

```bash
# Type check
bun run type-check

# Lint
bun run lint

# Unit tests
bun test src/lib/developer/ src/lib/actions/dev/

# E2E tests
bun run test:e2e:auth-demo:admin-developer

# Build
bun run build
```

## Risk Register

| Risk | Mitigation |
|------|------------|
| Adding auth checks breaks existing demo mode | Test with `PLAYWRIGHT_DEMO_AUTH=true` |
| Rate limiting breaks legitimate bulk use | Set generous limit (10/min) |
| Accessibility changes affect visual design | Use existing design system tokens |
| New tests are flaky | Use stable selectors, add waits |
