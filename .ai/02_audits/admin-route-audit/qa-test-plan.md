# QA Test Plan

**Last Updated:** 2026-04-27
**Status:** Aligned with implementation plan sprints
**Goal:** Verify each sprint's deliverables. Tests are grouped by the sprint they validate.

---

## Test Framework

- **E2E:** Playwright 1.59.1
- **Unit:** Bun native test runner (`bun:test`)
- **Manual:** axe DevTools, browser DevTools, mobile viewport simulation

---

## Sprint 0: Cleanup & Baseline (Validate before Sprint 1)

| Test ID | Title | Priority | Method | Steps | Expected | Sprint Validated |
|---------|-------|----------|--------|-------|----------|-----------------|
| QA-S0-01 | `isAdminByEmail()` removed | P0 | grep | `grep -r "isAdminByEmail" src/ --include="*.ts" --include="*.tsx"` | Zero matches | 0 |
| QA-S0-02 | CEO analytics page is guarded | P0 | E2E | Navigate to `/ceo/analytics` as member | Redirect to `/dashboard` | 0 |
| QA-S0-03 | CEO insights page is guarded | P0 | E2E | Navigate to `/ceo/insights` as member | Redirect to `/dashboard` | 0 |
| QA-S0-04 | Dev bypass env vars absent from staging | P0 | Shell | Check deployment env for `DEV_FORCE_USER_ID` | Not found or empty | 0 |
| QA-S0-05 | Type-check and lint pass | P0 | CLI | `bun run type-check && bun run lint` | Both exit 0 | 0 |

---

## Sprint 1: Permission Infrastructure

| Test ID | Title | Priority | Method | Steps | Expected | Sprint Validated |
|---------|-------|----------|--------|-------|----------|-----------------|
| QA-S1-01 | `hasPermission("admin", "admin.content.create")` is true | P0 | Unit | Write test using `hasPermission` | Returns `true` | 1 |
| QA-S1-02 | `hasPermission("sme_reviewer", "admin.content.create")` is false | P0 | Unit | Write test using `hasPermission` | Returns `false` | 1 |
| QA-S1-03 | `hasPermission("ceo", "admin.audit.view")` is false | P0 | Unit | Write test using `hasPermission` | Returns `false` | 1 |
| QA-S1-04 | `assertPermission("admin.content.edit")` throws for member | P0 | Unit | Mock member role, call `assertPermission` | Throws `"Forbidden"` | 1 |
| QA-S1-05 | `assertPermission("admin.content.edit")` resolves for content_admin | P0 | Unit | Mock `content_admin` role, call `assertPermission` | Resolves without error | 1 |
| QA-S1-06 | Viewer entitlements include permissions array | P0 | Unit | Call `getViewerEntitlements()` | Result has `permissions: AdminPermission[]` | 1 |
| QA-S1-07 | `usePermission("admin.content.create")` returns true for content_admin | P0 | Unit | Render hook with content_admin viewer | Returns `{ can: true }` | 1 |
| QA-S1-08 | `usePermission("admin.users.manage")` returns false for admin | P0 | Unit | Render hook with `admin` viewer | Returns `{ can: false }` | 1 |

---

## Sprint 2: Server-Side Enforcement

| Test ID | Title | Priority | Method | Steps | Expected | Sprint Validated |
|---------|-------|----------|--------|-------|----------|-----------------|
| QA-S2-01 | Member calling `createQuestion` is denied | P0 | Unit | Call `createQuestion` as member user | Throws/rejects with "Forbidden" | 2 |
| QA-S2-02 | Member calling `deleteWikiArticle` is denied | P0 | Unit | Call `deleteWikiArticle` as member user | Throws/rejects with "Forbidden" | 2 |
| QA-S2-03 | Member calling `updateArticleStatus` is denied | P0 | Unit | Call `updateArticleStatus` as member user | Throws/rejects with "Forbidden" | 2 |
| QA-S2-04 | Member calling `assignRole` is denied | P0 | Unit | Call `assignRole` as member user | Throws/rejects with "Forbidden" | 2 |
| QA-S2-05 | SME reviewer calling `createQuestion` is denied | P0 | Unit | Call `createQuestion` as `sme_reviewer` | Throws/rejects with "Forbidden" | 2 |
| QA-S2-06 | SME reviewer calling `approveWikiArticleReview` succeeds | P0 | Unit | Call `approveWikiArticleReview` as `sme_reviewer` | Resolves without error | 2 |
| QA-S2-07 | Content admin calling `deleteQuestion` succeeds | P0 | Unit | Call `deleteQuestion` as `content_admin` | Resolves without error | 2 |
| QA-S2-08 | Admin calling `getAdminUsers` is denied | P0 | Unit | Call `getAdminUsers` as `admin` | Throws/rejects with "Forbidden" | 2 |
| QA-S2-09 | Super admin calling `getAdminUsers` succeeds | P0 | Unit | Call `getAdminUsers` as `super_admin` | Resolves without error | 2 |
| QA-S2-10 | Every action file calls `assertPermission` | P0 | grep | `grep -r "assertPermission" src/lib/actions/admin/ --include="*.ts" -l` | Count = number of action files (23) | 2 |
| QA-S2-11 | Direct fetch to admin action without session returns 403 | P0 | E2E | POST to admin action endpoint with no cookies | 403 status | 2 |

---

## Sprint 3: CEO Control Plane

| Test ID | Title | Priority | Method | Steps | Expected | Sprint Validated |
|---------|-------|----------|--------|-------|----------|-----------------|
| QA-S3-01 | CEO can view admin users list | P0 | E2E | Login as CEO, visit `/ceo/team/admin-roles` | List of users with roles visible | 3 |
| QA-S3-02 | CEO can assign `admin` role to member | P0 | E2E | In `/ceo/team`, assign `admin` to member | Success toast; role appears in list | 3 |
| QA-S3-03 | Assigned user can access `/admin` after refresh | P0 | E2E | Login as newly-assigned user, visit `/admin` | Dashboard loads | 3 |
| QA-S3-04 | CEO can revoke `admin` role | P0 | E2E | Revoke `admin` from user in `/ceo/team` | Success toast; role removed | 3 |
| QA-S3-05 | Revoked user is denied from `/admin` after refresh | P0 | E2E | Login as revoked user, visit `/admin` | Redirect to `/dashboard` | 3 |
| QA-S3-06 | CEO cannot revoke own role | P0 | E2E | CEO attempts to revoke own CEO role | Error: "Cannot revoke your own role" | 3 |
| QA-S3-07 | CEO cannot remove final owner/super_admin | P0 | E2E | Attempt to revoke last `super_admin` | Error: "Cannot revoke the final owner/super-admin role" | 3 |
| QA-S3-08 | Role assignment writes to `user_roles` table | P0 | DB query | Query `user_roles` after assignment | Row exists with correct `user_id` + `role` | 3 |
| QA-S3-09 | Role assignment creates audit log entry | P0 | DB query | Query `audit_logs` after assignment | Row with `action = 'role.assign'` | 3 |
| QA-S3-10 | Permission audit log page loads | P1 | E2E | CEO visits `/ceo/team/permission-audit` | Table renders with audit entries | 3 |

---

## Sprint 4: Client-Side Gates & UX

| Test ID | Title | Priority | Method | Steps | Expected | Sprint Validated |
|---------|-------|----------|--------|-------|----------|-----------------|
| QA-S4-01 | SME reviewer sees no "Create" button on knowledge page | P1 | E2E | Login as `sme_reviewer`, visit `/admin/knowledge` | "Create New" button hidden | 4 |
| QA-S4-02 | SME reviewer sees no "Delete" button in question editor | P1 | E2E | Open question as `sme_reviewer` | Delete button hidden | 4 |
| QA-S4-03 | Admin sees no "Settings" nav item | P1 | E2E | Login as `admin`, open admin sidebar | Settings nav item hidden | 4 |
| QA-S4-04 | Super admin sees all nav items | P1 | E2E | Login as `super_admin`, open admin sidebar | All nav items visible | 4 |
| QA-S4-05 | Content search pagination works | P1 | E2E | Visit `/admin/search`, click "Load more" or page numbers | Additional results load | 4 |
| QA-S4-06 | Questions table is usable on mobile | P1 | E2E | Resize to 375px, visit `/admin/knowledge/questions` | Table scrollable, sidebar collapsible or hidden | 4 |
| QA-S4-07 | Delete article modal has close button | P1 | E2E | Open delete modal | Close button (X) visible and works | 4 |
| QA-S4-08 | Pipeline publish button hidden for non-publisher | P1 | E2E | Login as `sme_reviewer`, visit `/admin/pipeline` | Publish button hidden | 4 |
| QA-S4-09 | All admin loading.tsx use Skeleton component | P1 | grep | `grep -r "Skeleton" src/app/admin/*/loading.tsx -l` | All loading files use Skeleton | 4 |
| QA-S4-10 | SMEReviewQueue shows Skeleton while loading | P1 | E2E | Visit `/admin/reviews` with throttled network | Skeleton visible before data | 4 |
| QA-S4-11 | SaveAllBar announces status via aria-live | P2 | Manual | Inspect SaveAllBar with DevTools | `aria-live="polite"` present on status container | 4 |
| QA-S4-12 | QuestionImporter announces status via aria-live | P2 | Manual | Inspect importer with DevTools | `aria-live="polite"` present | 4 |

---

## Sprint 5: Audit Logging & Final Verification

| Test ID | Title | Priority | Method | Steps | Expected | Sprint Validated |
|---------|-------|----------|--------|-------|----------|-----------------|
| QA-S5-01 | `createWikiArticle` creates audit log | P1 | Unit | Call `createWikiArticle`, query `audit_logs` | Row with `action = 'wiki.create'` | 5 |
| QA-S5-02 | `deleteQuestion` creates audit log | P1 | Unit | Call `deleteQuestion`, query `audit_logs` | Row with `action = 'question.delete'` | 5 |
| QA-S5-03 | `updateArticleStatus` creates audit log | P1 | Unit | Call `updateArticleStatus`, query `audit_logs` | Row with `action = 'pipeline.status_change'` | 5 |
| QA-S5-04 | `assignRole` creates audit log | P1 | Unit | Call `assignRole`, query `audit_logs` | Row with `action = 'role.assign'` | 5 |
| QA-S5-05 | All admin action files have unit tests | P1 | Shell | Count `.test.ts` files in `src/lib/actions/admin/` | >= 14 (all action files covered) | 5 |
| QA-S5-06 | E2E admin RBAC spec exists and passes | P1 | CLI | `bun run test:e2e:admin-rbac` | All tests pass | 5 |
| QA-S5-07 | E2E CEO RBAC spec exists and passes | P1 | CLI | `bun run test:e2e:ceo-rbac` | All tests pass | 5 |
| QA-S5-08 | axe-core scan passes | P2 | CLI | Run axe-core on all admin routes | Zero violations | 5 |
| QA-S5-09 | Mobile nav is accessible | P2 | E2E | Mobile viewport, open hamburger, click nav item | Navigation works | 5 |
| QA-S5-10 | Keyboard-only admin workflow | P2 | Manual | Tab through sidebar, open command palette, navigate | All reachable | 5 |

---

## Regression Tests (Run after every sprint)

| Test ID | Title | Steps | Expected |
|---------|-------|-------|----------|
| REG-01 | Legacy `/admin/wiki` still redirects | Visit `/admin/wiki` | Redirects to `/admin/knowledge` |
| REG-02 | Preview route has no admin chrome | Visit `/admin/preview/[id]` | No sidebar, no topbar |
| REG-03 | Full-bleed editor has no padding | Visit `/admin/knowledge/[id]` | Editor fills viewport |
| REG-04 | Admin error boundary catches errors | Trigger React error | Error boundary UI shows |
| REG-05 | Command palette opens via Cmd+K | Press Cmd+K | Command palette appears |
| REG-06 | Needs attention badge shows count | Visit `/admin` | Badge count matches DB |

---

## Test Data Fixtures Required

| Role | Email Pattern | How to Create |
|------|---------------|---------------|
| `owner` | `owner@example.com` | Seed in Supabase directly |
| `super_admin` | `super@example.com` | Seed or assign via CEO |
| `ceo` | `ceo@example.com` | Seed in `ceo_team_members` + `user_roles` |
| `content_admin` | `content@example.com` | Seed in `user_roles` |
| `admin` | `admin@example.com` | Seed in `user_roles` |
| `developer` | `dev@example.com` | Seed in `user_roles` |
| `sme_reviewer` | `reviewer@example.com` | Seed in `user_roles` |
| `member` | `member@example.com` | Default signup, no `user_roles` entry |

**Playwright fixture pattern:** Extend `e2e/support/authenticated-demo.ts` to support role-specific login, or use Supabase auth API to create sessions programmatically.

---

## Evidence

- E2E tests: `e2e/`
- Unit tests: `src/lib/actions/admin/*.test.ts`
- Playwright config: `playwright.config.ts`
- Admin error boundary: `src/app/admin/error.tsx`
- Auth fixture: `e2e/support/authenticated-demo.ts`
