# Functionality Audit

**Last Updated:** 2026-04-27

This document audits whether `/admin` functions appear to work based on code inspection.

## Audit Method

For each major function area, we inspect:
- Trigger (what calls it)
- Expected behavior
- Actual code path
- Success handling
- Error handling
- Loading state
- Empty state
- Validation
- Confirmation for destructive actions
- Permission checks
- Optimistic UI
- Rollback/error recovery
- Audit logging
- Test coverage

---

## 1. Auth and Access Control Functions

### `canReviewContent()`
- **Trigger:** Layout, pages, server actions
- **Expected:** Returns true for admin-capable roles
- **Code path:** `src/lib/admin/roles.ts` → `canReviewContentForRole()` → `src/lib/entitlements/policy.ts`
- **Allowed roles:** `owner`, `super_admin`, `content_admin`, `sme_reviewer`, `admin`, `developer`, `ceo`
- **Permission check:** Server-side only
- **Test:** `src/lib/admin/roles.ts` is tested
- **Status:** Implemented
- **Evidence:** `src/lib/admin/roles.ts`, `src/lib/entitlements/policy.ts`

### `canManageContent()`
- **Trigger:** Content editor pages, asset pages
- **Expected:** Returns true for content management roles
- **Code path:** Same chain as above
- **Allowed roles:** `owner`, `super_admin`, `content_admin`, `admin`, `developer`, `ceo`
- **Note:** `sme_reviewer` is NOT included
- **Status:** Implemented
- **Evidence:** `src/lib/entitlements/policy.ts`

### `isSuperAdmin()`
- **Trigger:** Audit log, settings pages
- **Expected:** Returns true only for `super_admin` and `owner`
- **Code path:** `src/lib/admin/roles.ts` → `role === 'super_admin' || role === 'owner'`
- **Status:** Implemented
- **Evidence:** `src/lib/admin/roles.ts`

### `canManageUsers()`
- **Trigger:** Settings/role management
- **Expected:** Returns true only for `owner` and `super_admin`
- **Code path:** `src/lib/admin/roles.ts` → `canManageUsersForRole()`
- **Status:** Implemented
- **Evidence:** `src/lib/admin/roles.ts`

### `isAdminByEmail()` (DEPRECATED)
- **Trigger:** Legacy fallback
- **Expected:** Check if email is in admin list or ends with `@slatecamp.com`
- **Code path:** `src/lib/admin/is-admin.ts`
- **Issue:** Hardcoded `@slatecamp.com` domain
- **Status:** Deprecated but still present
- **Risk:** Medium
- **Evidence:** `src/lib/admin/is-admin.ts`

---

## 2. Dashboard Functions

### `getAdminDashboardData()`
- **Trigger:** `/admin/page.tsx`
- **Expected:** Returns stats, recent activity, coverage alerts
- **Code path:** `src/lib/actions/admin/dashboard.ts`
- **Caching:** `unstable_cache` with 5-minute TTL
- **Error handling:** Returns fallback data on error
- **Loading state:** `src/app/admin/loading.tsx` skeleton
- **Empty state:** Conditional rendering for empty activity list
- **Permission check:** `canReviewContent()`
- **Test:** `dashboard.test.ts` exists
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/dashboard.ts`

### `getNeedsAttentionData()`
- **Trigger:** Layout (for badge count), dashboard
- **Expected:** Returns pending reviews and missing rationale counts
- **Code path:** `src/lib/actions/admin/dashboard.ts`
- **Caching:** `unstable_cache`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/dashboard.ts`

---

## 3. Content Management Functions

### `getArticleFull()` / `updateWikiArticle()` / `createWikiArticle()` / `deleteWikiArticle()`
- **Trigger:** Article editor, knowledge browser
- **Expected:** CRUD operations on wiki articles
- **Code path:** `src/lib/actions/admin/content.ts`, `src/lib/actions/admin/wiki.ts`
- **Validation:** Zod schemas for article data
- **Error handling:** Try/catch with toast feedback
- **Loading state:** Route-level `loading.tsx`
- **Empty state:** Not applicable
- **Confirmation:** `DeleteArticleModal` for deletion
- **Permission check:** `canManageContent()` or `canReviewContent()`
- **Revalidation:** Revalidates `/admin/knowledge`, `/dashboard/wiki`
- **Test:** `content.test.ts`, `wiki.test.ts`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/content.ts`, `src/lib/actions/admin/wiki.ts`

### `requestWikiArticleChanges()` / `approveWikiArticleReview()`
- **Trigger:** SME Review Queue
- **Expected:** Workflow transitions for article review
- **Code path:** `src/lib/actions/admin/wiki.ts`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/wiki.ts`

---

## 4. Question Management Functions

### `createQuestion()` / `updateQuestion()` / `deleteQuestion()` / `deleteQuestions()`
- **Trigger:** Question editor, question bank
- **Expected:** CRUD for standard questions
- **Code path:** `src/lib/actions/admin/questions.ts`
- **Validation:** Zod schemas
- **Error handling:** Try/catch
- **Confirmation:** `ConfirmDialog` for bulk delete
- **Permission check:** `canManageContent()`
- **Revalidation:** Revalidates cache tags
- **Test:** `questions.test.ts`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/questions.ts`

### `getQuestionsGroupedByArticle()` / `getQuestionsForAnalytics()`
- **Trigger:** Question bank, quality analytics
- **Expected:** Fetch questions with grouping and analytics
- **Code path:** `src/lib/actions/admin/question-queries.ts`
- **Pagination:** Supported in `getQuestionsGroupedByArticle()`
- **Permission check:** `canReviewContent()`
- **Test:** Not found
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/question-queries.ts`

---

## 5. Design Problem/Scenario Functions

### `getAdminDesignProblems()` / `createDesignProblem()` / `updateDesignProblem()` / `deleteDesignProblem()`
- **Trigger:** Design problem bank and editor
- **Expected:** CRUD for design problems
- **Code path:** `src/lib/actions/admin/design-problems.ts`
- **Permission check:** `canManageContent()`
- **Test:** `design-problems.test.ts`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/design-problems.ts`

### `getAdminDesignScenarios()` / `createDesignScenario()` / `updateDesignScenario()` / `deleteDesignScenario()`
- **Trigger:** Scenario bank and editor
- **Expected:** CRUD for design scenarios
- **Code path:** `src/lib/actions/admin/design-scenarios.ts`
- **Permission check:** `canManageContent()`
- **Test:** `design-scenarios.test.ts`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/design-scenarios.ts`

---

## 6. Pipeline Functions

### `getPipelineArticles()` / `updateArticleStatus()`
- **Trigger:** Publishing pipeline page
- **Expected:** Kanban board data and status transitions
- **Code path:** `src/lib/actions/admin/pipeline.ts`
- **Optimistic UI:** `useTransition` in `PipelineCard`
- **Confirmation:** Confirm dialog for publish action
- **Permission check:** `canReviewContent()` / `canManageContent()`
- **Test:** `pipeline.test.ts`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/pipeline.ts`

---

## 7. Taxonomy Functions

### `getTaxonomyNodes()` / `createTaxonomyNode()` / `updateTaxonomyNode()` / `deleteTaxonomyNode()`
- **Trigger:** Taxonomy editor
- **Expected:** Tree CRUD
- **Code path:** `src/lib/actions/admin/taxonomy.ts`
- **Optimistic UI:** Delete uses optimistic UI with rollback
- **Permission check:** `canManageContent()`
- **Revalidation:** Revalidates `/admin/taxonomy`
- **Test:** Not found
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/taxonomy.ts`

---

## 8. Asset Functions

### `getAssets()` / `getAsset()` / `createAsset()` / `uploadAssetFile()` / `archiveAsset()`
- **Trigger:** Asset manager
- **Expected:** CRUD + file upload for 3D assets
- **Code path:** `src/lib/actions/admin/assets.ts`
- **Permission check:** `canReviewContent()` / `canManageContent()`
- **Test:** `assets.test.ts`
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/assets.ts`

---

## 9. Role Management Functions

### `getAdminUsers()` / `assignRole()` / `revokeRole()`
- **Trigger:** Admin settings page
- **Expected:** View and manage admin user roles
- **Code path:** `src/lib/actions/admin/roles.ts`
- **Validation:** UUID validation for user ID
- **Error handling:** Try/catch with fallback to `profiles.role`
- **Permission check:** `canManageUsers()` (only `owner`/`super_admin`)
- **Audit logging:** **None found**
- **Test:** `roles.test.ts`
- **Status:** Partial
- **Risk:** High
- **Evidence:** `src/lib/actions/admin/roles.ts`
- **Notes:** No audit log for role changes. Falls back to `profiles.role` if `user_roles` table is unavailable.

---

## 10. Coverage Functions

### `fetchCoverageData()`
- **Trigger:** Coverage map page
- **Expected:** Aggregate coverage metrics per taxonomy node
- **Code path:** `src/lib/actions/admin/coverage.ts`
- **Permission check:** `canReviewContent()`
- **Test:** Not found
- **Status:** Implemented
- **Evidence:** `src/lib/actions/admin/coverage.ts`

---

## 11. Search Function

### `ContentSearchClient`
- **Trigger:** `/admin/search` page
- **Expected:** Global search across questions, articles, taxonomy
- **Code path:** `src/app/admin/search/_components/ContentSearchClient.tsx`
- **Data fetching:** Client-side Supabase queries with `useDeferredValue`
- **Pagination:** **None** (hard limit 20 per type)
- **Error handling:** Error state UI
- **Empty state:** Good — initial, no-results, per-tab empty messages
- **Permission check:** Implicit via layout
- **Test:** Not found
- **Status:** Partial
- **Risk:** High
- **Evidence:** `src/app/admin/search/_components/ContentSearchClient.tsx`

---

## 12. Missing States and Patterns

| Area | Missing Pattern | Evidence |
|------|-----------------|----------|
| SME Review Queue | Skeleton loading state | `src/components/admin/SMEReviewQueue.tsx` |
| SME Review Queue | Empty state illustration | `src/components/admin/SMEReviewQueue.tsx` |
| Content Search | Pagination | `src/app/admin/search/_components/ContentSearchClient.tsx` |
| Content Search | Term highlighting | `src/app/admin/search/_components/ContentSearchClient.tsx` |
| Audit Log | Pagination | `src/components/admin/AuditLogViewer.tsx` |
| Audit Log | `aria-expanded` on rows | `src/components/admin/AuditLogViewer.tsx` |
| Activity Feed | Pagination | `src/app/admin/activity/page.tsx` |
| Asset List | `<label>` for search input | `src/components/admin/AssetList.tsx` |
| Asset List | Empty state component | `src/components/admin/AssetList.tsx` |
| Delete Article Modal | Close button | `src/components/admin/DeleteArticleModal.tsx` |
| Taxonomy Editor | ARIA tree semantics | `src/components/admin/TaxonomyEditor.tsx` |
| Unified Editor | Keyboard shortcut docs | `src/components/admin/unified-editor/UnifiedContentEditor.tsx` |
| Role Management | Audit log for changes | `src/lib/actions/admin/roles.ts` |
| Most admin actions | Audit log for mutations | Multiple action files |

## Test Coverage Summary

| Action File | Test File | Status |
|-------------|-----------|--------|
| `assets.ts` | `assets.test.ts` | Exists |
| `content.ts` | `content.test.ts` | Exists |
| `design-problems.ts` | `design-problems.test.ts` | Exists |
| `design-scenarios.ts` | `design-scenarios.test.ts` | Exists |
| `pipeline.ts` | `pipeline.test.ts` | Exists |
| `questions.ts` | `questions.test.ts` | Exists |
| `roles.ts` | `roles.test.ts` | Exists |
| `wiki.ts` | `wiki.test.ts` | Exists |
| `coverage.ts` | — | Missing |
| `taxonomy.ts` | — | Missing |
| `question-queries.ts` | — | Missing |
| `dashboard.ts` | — | Missing |
| `bulk.ts` | — | Missing |

## Evidence

- Actions: `src/lib/actions/admin/`
- Tests: `src/lib/actions/admin/*.test.ts`
- Components: `src/components/admin/`
- Auth helpers: `src/lib/admin/roles.ts`
