# Admin Permission Matrix

**Last Updated:** 2026-04-27
**Status:** Action-ready — includes exact file paths, permission keys, and implementation notes.

---

## Legend

| Guard Status | Meaning |
|--------------|---------|
| ✅ Found | Guard exists in code |
| ❌ Missing | No guard found |
| ⚠️ Partial | Guard exists but is coarse-grained |
| 🔄 Inferred | Inferred from parent layout only |

---

## Proposed Permission Key Schema

All permissions use dot notation under the `admin.` namespace:

```
admin.access                    # Can enter /admin at all (middleware/layout gate)
admin.dashboard.view            # Can view dashboard stats and needs-attention cards
admin.content.view              # Can view articles, questions, design problems, scenarios
admin.content.create            # Can create new articles, questions, design problems, scenarios
admin.content.edit              # Can edit existing content
admin.content.delete            # Can delete/archive content
admin.content.publish           # Can publish or move content to Published status
admin.content.approve           # Can approve/reject content in review queue
admin.content.import            # Can import questions via CSV/upload
admin.taxonomy.manage           # Can create, edit, delete taxonomy nodes
admin.assets.manage             # Can upload, archive, manage file assets
admin.pipeline.manage           # Can move cards in pipeline, change article status
admin.reviews.view              # Can view SME review queue
admin.audit.view                # Can view audit logs (super_admin / owner only)
admin.activity.view             # Can view activity feed
admin.search.use                # Can use content search
admin.analytics.view            # Can view coverage maps, question analytics
admin.settings.view             # Can view admin settings
admin.users.manage              # Can assign/revoke admin roles
admin.preview.view              # Can preview draft content
```

---

## Route-Level Matrix

| Route | Page Guard | Layout Guard | Middleware Guard | Current Role Check | Proposed Permission | Exact File to Modify | Implementation Note |
|-------|------------|--------------|------------------|--------------------|---------------------|----------------------|---------------------|
| `/admin` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.dashboard.view` | `src/app/admin/page.tsx` | Add `await assertPermission("admin.dashboard.view")` |
| `/admin/login` | None | None | `adminCms` | N/A | N/A | None | Public route, no change |
| `/admin/3d-models` | `canReviewContent()` | `canReviewContent()` | `adminCms` | Any admin role | `admin.access` | `src/app/admin/3d-models/page.tsx` | Already guarded; add explicit `assertPermission` if desired |
| `/admin/activity` | `isAdmin()` | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.activity.view` | `src/app/admin/activity/page.tsx` | Replace `isAdmin()` with `assertPermission("admin.activity.view")` |
| `/admin/assets` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.assets.manage` | `src/app/admin/assets/page.tsx` | Add explicit guard |
| `/admin/assets/[id]` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.assets.manage` | `src/app/admin/assets/[id]/page.tsx` | Add `assertPermission("admin.assets.manage")` |
| `/admin/audit` | `isSuperAdmin()` | `canReviewContent()` | `adminCms` | Super admin / owner | `admin.access`, `admin.audit.view` | `src/app/admin/audit/page.tsx` | Replace `isSuperAdmin()` with `assertPermission("admin.audit.view")` |
| `/admin/knowledge` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.view` | `src/app/admin/knowledge/page.tsx` | Already has coarse guard; upgrade to `assertPermission` |
| `/admin/knowledge/[id]` | `canManageContent() \|\| canReviewContent()` | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.content.edit` | `src/app/admin/knowledge/[id]/page.tsx` | Split: view=any, edit=content.create/edit |
| `/admin/knowledge/analytics` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.analytics.view` | `src/app/admin/knowledge/analytics/page.tsx` | Add explicit guard |
| `/admin/knowledge/import` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.import` | `src/app/admin/knowledge/import/page.tsx` | Add `assertPermission("admin.content.import")` |
| `/admin/knowledge/new` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.create` | `src/app/admin/knowledge/new/page.tsx` | Add `assertPermission("admin.content.create")` |
| `/admin/knowledge/questions` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.view` | `src/app/admin/knowledge/questions/page.tsx` | Add explicit guard |
| `/admin/knowledge/questions/[id]` | `canManageContent() \|\| canReviewContent()` | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.content.edit` | `src/app/admin/knowledge/questions/[id]/page.tsx` | Same pattern as article editor |
| `/admin/knowledge/questions/design-problems` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.view` | `src/app/admin/knowledge/questions/design-problems/page.tsx` | Add explicit guard |
| `/admin/knowledge/questions/design-problems/[id]` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.edit` | `src/app/admin/knowledge/questions/design-problems/[id]/page.tsx` | Add explicit guard |
| `/admin/knowledge/questions/new` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.create` | `src/app/admin/knowledge/questions/new/page.tsx` | Add `assertPermission("admin.content.create")` |
| `/admin/knowledge/questions/scenarios` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.view` | `src/app/admin/knowledge/questions/scenarios/page.tsx` | Add explicit guard |
| `/admin/knowledge/questions/scenarios/[id]` | `canManageContent()` | `canReviewContent()` | `adminCms` | Content admin+ | `admin.access`, `admin.content.edit` | `src/app/admin/knowledge/questions/scenarios/[id]/page.tsx` | Add explicit guard |
| `/admin/pipeline` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.pipeline.manage` | `src/app/admin/pipeline/page.tsx` | Add explicit guard |
| `/admin/preview/[previewId]` | `canManageContent() \|\| canReviewContent()` | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.preview.view` | `src/app/admin/preview/[previewId]/page.tsx` | Add explicit guard |
| `/admin/reviews` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.reviews.view` | `src/app/admin/reviews/page.tsx` | Add explicit guard |
| `/admin/search` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.search.use` | `src/app/admin/search/page.tsx` | Add explicit guard |
| `/admin/settings` | `isSuperAdmin()` | `canReviewContent()` | `adminCms` | Super admin / owner | `admin.access`, `admin.users.manage` | `src/app/admin/settings/page.tsx` | Replace `isSuperAdmin()` with `assertPermission("admin.users.manage")` |
| `/admin/taxonomy` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.taxonomy.manage` | `src/app/admin/taxonomy/page.tsx` | Add explicit guard |
| `/admin/taxonomy/coverage` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access`, `admin.analytics.view` | `src/app/admin/taxonomy/coverage/page.tsx` | Add explicit guard |
| `/admin/wiki` | 🔄 Inferred | `canReviewContent()` | `adminCms` | Any admin role | `admin.access` | None | Legacy redirect; no guard needed beyond layout |

### Route Guard Implementation Pattern

Every page.tsx that needs a guard should add this at the top of the default export:

```typescript
import { assertPermission } from "@/lib/admin/roles";

export default async function Page() {
  await assertPermission("admin.content.view"); // <-- add this
  // ... rest of page
}
```

---

## Server Action-Level Matrix

| Action | File | Current Guard | Proposed Permission | Test Exists | Audit Log | Exact Change |
|--------|------|---------------|---------------------|-------------|-----------|--------------|
| `getAdminDashboardData` | `dashboard.ts` | `canReviewContent()` | `admin.dashboard.view` | No | No | `await assertPermission("admin.dashboard.view")` at top |
| `getNeedsAttentionData` | `dashboard.ts` | `canReviewContent()` | `admin.dashboard.view` | No | No | Same as above |
| `getContentBySubject` | `dashboard.ts` | `canReviewContent()` | `admin.dashboard.view` | No | No | Same as above |
| `getCriticalCoverageGap` | `dashboard.ts` | `canReviewContent()` | `admin.dashboard.view` | No | No | Same as above |
| `getContentEditorIndexData` | `content.ts` | `canManageContent()` | `admin.content.view` | No | No | `await assertPermission("admin.content.view")` |
| `getArticleFull` | `content.ts` | `canManageContent() \|\| canReviewContent()` | `admin.content.view` | No | No | `await assertPermission("admin.content.view")` |
| `updateWikiArticle` | `wiki.ts` | `canManageContent()` | `admin.content.edit` | Yes | No | Replace with `assertPermission("admin.content.edit")` |
| `createWikiArticle` | `wiki.ts` | `canManageContent()` | `admin.content.create` | Yes | No | Replace with `assertPermission("admin.content.create")` |
| `deleteWikiArticle` | `wiki.ts` | `canManageContent()` | `admin.content.delete` | Yes | No | Replace with `assertPermission("admin.content.delete")` |
| `approveWikiArticleReview` | `wiki.ts` | `canReviewContent()` | `admin.content.approve` | Yes | No | Replace with `assertPermission("admin.content.approve")` |
| `requestWikiArticleChanges` | `wiki.ts` | `canReviewContent()` | `admin.content.approve` | Yes | No | Replace with `assertPermission("admin.content.approve")` |
| `createQuestion` | `questions.ts` | `canManageContent()` | `admin.content.create` | Yes | No | Replace with `assertPermission("admin.content.create")` |
| `updateQuestion` | `questions.ts` | `canManageContent()` | `admin.content.edit` | Yes | No | Replace with `assertPermission("admin.content.edit")` |
| `deleteQuestion` | `questions.ts` | `canManageContent()` | `admin.content.delete` | Yes | No | Replace with `assertPermission("admin.content.delete")` |
| `deleteQuestions` | `questions.ts` | `canManageContent()` | `admin.content.delete` | Yes | No | Replace with `assertPermission("admin.content.delete")` |
| `getQuestionsGroupedByArticle` | `question-queries.ts` | `canReviewContent()` | `admin.content.view` | No | No | Add `assertPermission("admin.content.view")` |
| `getQuestionsForAnalytics` | `question-queries.ts` | `canReviewContent()` | `admin.analytics.view` | No | No | Add `assertPermission("admin.analytics.view")` |
| `getAdminDesignProblems` | `design-problems.ts` | `canManageContent()` | `admin.content.view` | No | No | Add `assertPermission("admin.content.view")` |
| `createDesignProblem` | `design-problems.ts` | `canManageContent()` | `admin.content.create` | Yes | No | Replace with `assertPermission("admin.content.create")` |
| `updateDesignProblem` | `design-problems.ts` | `canManageContent()` | `admin.content.edit` | Yes | No | Replace with `assertPermission("admin.content.edit")` |
| `deleteDesignProblem` | `design-problems.ts` | `canManageContent()` | `admin.content.delete` | Yes | No | Replace with `assertPermission("admin.content.delete")` |
| `getAdminDesignScenarios` | `design-scenarios.ts` | `canManageContent()` | `admin.content.view` | No | No | Add `assertPermission("admin.content.view")` |
| `createDesignScenario` | `design-scenarios.ts` | `canManageContent()` | `admin.content.create` | Yes | No | Replace with `assertPermission("admin.content.create")` |
| `updateDesignScenario` | `design-scenarios.ts` | `canManageContent()` | `admin.content.edit` | Yes | No | Replace with `assertPermission("admin.content.edit")` |
| `deleteDesignScenario` | `design-scenarios.ts` | `canManageContent()` | `admin.content.delete` | Yes | No | Replace with `assertPermission("admin.content.delete")` |
| `getPipelineArticles` | `pipeline.ts` | `canReviewContent()` | `admin.pipeline.manage` | Yes | No | Replace with `assertPermission("admin.pipeline.manage")` |
| `updateArticleStatus` | `pipeline.ts` | `canManageContent()` | `admin.pipeline.manage` | Yes | No | Replace with `assertPermission("admin.pipeline.manage")` |
| `getTaxonomyNodes` | `taxonomy.ts` | `canManageContent()` | `admin.taxonomy.manage` | No | No | Replace with `assertPermission("admin.taxonomy.manage")` |
| `createTaxonomyNode` | `taxonomy.ts` | `canManageContent()` | `admin.taxonomy.manage` | No | No | Replace with `assertPermission("admin.taxonomy.manage")` |
| `updateTaxonomyNode` | `taxonomy.ts` | `canManageContent()` | `admin.taxonomy.manage` | No | No | Replace with `assertPermission("admin.taxonomy.manage")` |
| `deleteTaxonomyNode` | `taxonomy.ts` | `canManageContent()` | `admin.taxonomy.manage` | No | No | Replace with `assertPermission("admin.taxonomy.manage")` |
| `fetchCoverageData` | `coverage.ts` | `canReviewContent()` | `admin.analytics.view` | No | No | Replace with `assertPermission("admin.analytics.view")` |
| `getAssets` | `assets.ts` | `canReviewContent()` | `admin.assets.manage` | No | No | Replace with `assertPermission("admin.assets.manage")` |
| `getAsset` | `assets.ts` | `canManageContent()` | `admin.assets.manage` | No | No | Replace with `assertPermission("admin.assets.manage")` |
| `createAsset` | `assets.ts` | `canManageContent()` | `admin.assets.manage` | Yes | No | Replace with `assertPermission("admin.assets.manage")` |
| `uploadAssetFile` | `assets.ts` | `canManageContent()` | `admin.assets.manage` | Yes | No | Replace with `assertPermission("admin.assets.manage")` |
| `archiveAsset` | `assets.ts` | `canManageContent()` | `admin.assets.manage` | Yes | No | Replace with `assertPermission("admin.assets.manage")` |
| `getAdminUsers` | `roles.ts` | `canManageUsers()` | `admin.users.manage` | Yes | No | Replace with `assertPermission("admin.users.manage")` |
| `assignRole` | `roles.ts` | `canManageUsers()` | `admin.users.manage` | Yes | No | Replace + add audit log |
| `revokeRole` | `roles.ts` | `canManageUsers()` | `admin.users.manage` | Yes | No | Replace + add audit log |
| `bulkDeleteQuestions` | `bulk.ts` | `canManageContent()` | `admin.content.delete` | No | No | Replace with `assertPermission("admin.content.delete")` |
| `bulkDeleteArticles` | `bulk.ts` | `canManageContent()` | `admin.content.delete` | No | No | Replace with `assertPermission("admin.content.delete")` |

---

## Role-to-Permission Reference (for `src/lib/entitlements/policy.ts`)

| Role | Permissions (coarse summary) |
|------|------------------------------|
| `owner` | ALL permissions |
| `super_admin` | ALL permissions |
| `ceo` | ALL except `admin.audit.view` |
| `content_admin` | All content + taxonomy + assets + pipeline + reviews + analytics |
| `admin` | All content + taxonomy + assets + pipeline + reviews + analytics |
| `developer` | View + create/edit content + preview |
| `sme_reviewer` | View + approve + pipeline + reviews + preview |
| `member` | None (admin scope) |
| `anonymous` | None |

---

## CEO Control Plane Permissions

| Action | Permission | Who Can Do It | Exact File | Notes |
|--------|------------|---------------|------------|-------|
| View admin users | `ceo.team.view` | `ceo`, `owner`, `super_admin` | `src/app/(protected)/ceo/team/admin-roles/page.tsx` | Via `assertCeoRole()` |
| Assign admin role | `ceo.team.manage` | `ceo`, `owner`, `super_admin` | `src/lib/actions/ceo/admin-role-actions.ts` | Writes to `user_roles` |
| Revoke admin role | `ceo.team.manage` | `ceo`, `owner`, `super_admin` | `src/lib/actions/ceo/admin-role-actions.ts` | Has last-owner safeguard |
| View permission audit | `ceo.team.view` | `ceo`, `owner`, `super_admin` | `src/app/(protected)/ceo/team/permission-audit/page.tsx` | Reads `audit_logs` |

---

## Key Findings & Implementation Notes

1. **Zero action has audit logging.** Every mutation should call `logAdminAction()` (Sprint 5, Task 5.2).
2. **Page guards are inconsistent.** Routes marked 🔄 Inferred rely only on layout/middleware. Add explicit `assertPermission()` calls per the Exact File to Modify column.
3. **`/admin/settings` is the only page requiring `isSuperAdmin()`.** This is correct behavior — only `owner`/`super_admin` manage users. Replace `isSuperAdmin()` with `assertPermission("admin.users.manage")`.
4. **All server actions use coarse `canManageContent()` etc.** Replace every call with the specific `assertPermission()` key from this matrix. Keep `canManageContent()` as a convenience wrapper for backward compatibility.
5. **8 of 23 action files have tests.** The 15 untested files are: `dashboard.ts`, `content.ts`, `question-queries.ts`, `design-problems.ts` (read-only), `design-scenarios.ts` (read-only), `coverage.ts`, `taxonomy.ts`, `bulk.ts`.
6. **CEO actions currently bypass `user_roles`.** `tr_sync_team_role` writes to `profiles.role`. CEO role management must write directly to `user_roles` (Sprint 3, Task 3.1).

---

## Evidence

- All admin actions: `src/lib/actions/admin/`
- All admin pages: `src/app/admin/`
- Role helpers: `src/lib/admin/roles.ts`
- Policy constants: `src/lib/entitlements/policy.ts`
- Viewer entitlements: `src/lib/entitlements/get-viewer-entitlements.ts`
- CEO actions: `src/lib/actions/ceo/`
- CEO pages: `src/app/(protected)/ceo/`
