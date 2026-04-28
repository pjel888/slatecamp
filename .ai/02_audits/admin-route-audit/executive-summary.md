# Executive Summary

**Audit date:** 2026-04-27

## Overall Admin Status

`/admin` is a **broad, route-dense, and operationally consequential** surface. It spans content creation, content browsing, review, taxonomy, assets, preview, pipeline, audit, activity, and question management. Most core features are **implemented** but the RBAC model is **coarse-grained** and the UX/UI has **measurable gaps** in accessibility, mobile responsiveness, and consistency.

### Route Count
- **26 `page.tsx` files** under `src/app/admin/`
- **1 layout**, **1 error boundary**, **22 loading states**
- **23 server action files** under `src/lib/actions/admin/`
- **8 test files** covering admin actions

### Auth Status
- **Defense-in-depth:** Middleware + layout + page-level + server action checks
- **Role-based:** 9 canonical roles (`owner`, `super_admin`, `content_admin`, `sme_reviewer`, `admin`, `developer`, `ceo`, `member`, `anonymous`)
- **Coarse permissions:** Only 4 admin-relevant capabilities (`adminCms`, `canManageContent`, `canReviewContent`, `canManageUsers`)
- **No fine-grained permissions:** e.g., no separate permission for "view audit log" vs "manage users"
- **Client-side gating mirrors server-side** but is not the source of truth

## Biggest Functionality Risks

| Risk | Severity | Evidence |
|------|----------|----------|
| `isAdminByEmail()` is deprecated but still present | Medium | `src/lib/admin/is-admin.ts` |
| `@slatecamp.com` hardcoded domain in legacy admin check | Medium | `src/lib/admin/is-admin.ts` |
| CEO pages `analytics` and `insights` lack `verifyCeoAccess()` | Medium | `src/app/(protected)/ceo/analytics/page.tsx`, `insights/page.tsx` |
| Admin search uses `ilike` with no pagination — will not scale | Medium | `src/app/admin/search/_components/ContentSearchClient.tsx` |
| `user_roles` table fallback to `profiles.role` when RLS denied | Low | `src/lib/actions/admin/roles.ts` |
| No audit logging for most admin mutations | Medium | Multiple action files |
| `AdminShell` bypass regex is brittle | Low | `src/app/admin/layout.tsx` |

## Biggest UX/UI Issues

| Issue | Severity | Location |
|-------|----------|----------|
| `QuestionsTableClient` has fixed 300px sidebar with no mobile handling | High | `src/components/admin/QuestionsTableClient.tsx` |
| Content Search has no pagination (hard 20-item limit) | High | `src/app/admin/search/_components/ContentSearchClient.tsx` |
| `DeleteArticleModal` has no close button | Medium | `src/components/admin/DeleteArticleModal.tsx` |
| `SMEReviewQueue` has no skeleton — just text loading | Medium | `src/components/admin/SMEReviewQueue.tsx` |
| Loading skeletons inconsistent across admin routes | Medium | Multiple `loading.tsx` |
| Taxonomy editor lacks ARIA tree semantics | Medium | `src/components/admin/TaxonomyEditor.tsx` |
| `DirtyStateProvider` updates `document.title` during render | Medium | `src/components/admin/unified-editor/DirtyStateProvider.tsx` |

## Biggest RBAC/Security Gaps

| Gap | Severity | Evidence |
|-----|----------|----------|
| No fine-grained permissions — all-or-nothing for most admin actions | High | `src/lib/entitlements/policy.ts` |
| `/admin/settings` (role management) is super-admin only, but CEO cannot manage admin roles | High | `src/app/admin/settings/page.tsx` |
| CEO role assignment modal excludes `ceo` from assignable roles | Medium | `src/components/ceo/RoleAssignmentModal.tsx` |
| Legacy `isAdminByEmail()` still exists and has hardcoded domain | Medium | `src/lib/admin/is-admin.ts` |
| No audit log for permission/role changes | Medium | `src/lib/actions/admin/roles.ts` |
| `profiles.role` is used as fallback when `user_roles` is unavailable | Low | `src/lib/actions/admin/roles.ts` |

## How `/ceo` Should Control `/admin` RBAC

**Current state:** `/ceo` has a `RoleAssignmentModal` that can assign system roles to team members, but it updates `ceo_team_members.system_role` (with a trigger syncing to `profiles.role`). It does NOT use the `user_roles` table, which is the canonical role store for admin access.

**Recommended model:**
1. `/ceo` becomes the **control plane** for all admin role assignments.
2. CEO users can view all admin users, assign admin roles, and revoke admin roles.
3. Role changes write to the `user_roles` table (canonical) and optionally to `ceo_team_members`.
4. `/admin/settings` becomes a read-only view of admin users (or is removed in favor of `/ceo`).
5. All admin server actions enforce permissions server-side; client-side only mirrors for UX.

See [ceo-admin-rbac-control-plane.md](ceo-admin-rbac-control-plane.md) for full design.

## Recommended P0/P1/P2 Priorities

### P0 — Critical
1. **Remove or hard-disable `isAdminByEmail()`** — hardcoded domain is a security risk.
2. **Add `verifyCeoAccess()` to `/ceo/analytics` and `/ceo/insights`** — layout-only protection is insufficient.
3. **Implement fine-grained admin permissions** — at minimum separate `admin.users.manage`, `admin.content.manage`, `admin.audit.view`, `admin.settings.view`.
4. **Move admin role management from `/admin/settings` to `/ceo`** — CEO should control admin access.

### P1 — High Impact
5. **Add pagination to Content Search** — hard 20-item limit will break at scale.
6. **Add audit logging for all admin mutations** — who changed what and when.
7. **Fix `QuestionsTableClient` mobile layout** — fixed 300px sidebar is unusable on tablets.
8. **Add `aria-live` regions for async admin actions** — save, import, publish feedback.
9. **Standardize loading skeletons** — use `Skeleton` component consistently.

### P2 — Quality of Life
10. **Add keyboard shortcut documentation to Unified Editor**.
11. **Fix `DeleteArticleModal` close button**.
12. **Add ARIA tree semantics to Taxonomy Editor**.
13. **Fix `DirtyStateProvider` render side effect**.
14. **Improve empty states across admin components**.
