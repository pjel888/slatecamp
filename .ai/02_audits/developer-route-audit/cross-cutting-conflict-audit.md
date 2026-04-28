# Cross-Cutting Conflict Audit: /developer, /admin, /ceo

**Date:** 2026-04-28
**Scope:** RBAC consistency, middleware/layout alignment, Server Action guards, and entitlement divergence across privileged portals

---

## Summary

| Severity | Count | Categories |
|----------|-------|------------|
| Critical | 1 | CEO Server Actions execute without role verification |
| High | 1 | CEO financial queries callable without CEO role check |
| Medium | 2 | Dev force user override inconsistency; entitlement evaluation divergence risk |
| Low | 2 | API route naming inconsistency; admin layout uses broader check than needed |

---

## Critical

### CONFLICT-1: CEO Analytics Server Actions Lack Auth Guards

**Evidence:**
- `src/lib/queries/ceo/analytics/*.ts` (9 files) all declare `'use server'`
- None call any role-checking function
- Example: `getCAGEQualityData` in `get-cage-quality.ts:13` queries `cage_verifications` table without verifying caller is CEO-authorized

**Impact:** Any client component in the app can import and invoke these Server Actions, bypassing the CEO layout gate. The framework does not enforce route boundaries on Server Actions.

**Fix:** Create `assertCeoAccess()` guard and apply to all CEO `'use server'` functions.

---

## High

### CONFLICT-2: CEO Financial Queries Lack Auth Guards

**Evidence:**
- `src/lib/queries/ceo/financial-queries.ts` exports `getFinancialSummary`, `getRevenueBreakdown`, `getUnitEconomics`, `getPayingUserCount`, `getEngagementPreview`
- No `'use server'` directive (not Server Actions), but still async server-side functions
- No role verification before querying financial data

**Impact:** Less severe than CONFLICT-1 since these are not Server Actions, but if imported into a Server Component outside the CEO layout, they execute without role checks.

**Fix:** Add `assertCeoAccess()` at entry points.

---

## Medium

### CONFLICT-3: Dev Force User Override Inconsistent Between Middleware and Layouts

**Evidence:**
- `src/lib/supabase/middleware.ts:99`: `isDev = NODE_ENV === 'development' && isLocal` where `isLocal = hostname === 'localhost' || hostname === '127.0.0.1'`
- `src/lib/entitlements/resolve-role.ts:52`: `isDevForceUserRoleOverrideActive()` checks only `NODE_ENV === 'development' && DISABLE_DEV_FORCE_USER_ID !== 'true' && DEV_FORCE_USER_ID`
- CEO layout (`src/app/(protected)/ceo/layout.tsx:21`) calls `resolveCurrentUserRole()` which uses the broader check

**Impact:** On a dev server exposed to the network (e.g., `0.0.0.0:3000`), middleware denies force-user bypass but layouts grant owner access. User gets redirected by middleware before reaching the layout.

**Fix:** Align `isDevForceUserRoleOverrideActive()` with middleware's localhost check, or remove the localhost restriction from middleware.

### CONFLICT-4: Developer Portal Entitlement Evaluation Divergence Risk

**Evidence:**
- Layout (`src/app/developer/layout.tsx`): `getViewerEntitlements([ENTITLEMENT_FEATURE_KEYS.developerPortal])`
- Middleware (`src/lib/supabase/middleware.ts`): `canAccessDeveloperPortalForRole(normalizedRole, allowDeveloperBypass)`
- `getViewerEntitlements` evaluates `entitlements.tooling.developerPortal` via `evaluateFeatureAccess()` which may include feature flags, subscription status, etc.
- `canAccessDeveloperPortalForRole` is a simple role-set + bypass check

**Impact:** If feature flag evaluation changes (e.g., developer portal disabled for a role that the policy allows), the layout and middleware will disagree. User might pass middleware but get redirected by layout, or vice versa.

**Fix:** Both should use the same evaluation path — preferably `getViewerEntitlements()` in middleware, or ensure `evaluateFeatureAccess()` delegates to `canAccessDeveloperPortalForRole()`.

---

## Low

### CONFLICT-5: `/api/admin/flags` Path Naming Inconsistency

**Evidence:**
- Route at `src/app/api/admin/flags/route.ts`
- Checks `ENTITLEMENT_FEATURE_KEYS.devOverrideWrite` (developer override write)
- Permitted by `canWriteDevOverridesForRole`: owner, super_admin, content_admin, developer

**Impact:** Confusing — an "admin" API route that is actually a "developer" tool. No security impact.

**Fix:** Optionally rename to `/api/developer/flags` or document the duality.

### CONFLICT-6: Admin Layout Uses `canReviewContent()` Which Is Broader Than `canAccessAdminCmsForRole()`

**Evidence:**
- `src/app/admin/layout.tsx:28`: `canReviewContent()` allows: owner, super_admin, content_admin, sme_reviewer, admin, developer, ceo
- `src/lib/entitlements/policy.ts:57`: `canAccessAdminCmsForRole()` allows the same set
- Layout then calls `assertPermission('admin.access')` which all of those roles have

**Impact:** No security impact since `assertPermission` gates further. But it's a code smell — two different authorization paths that happen to converge.

**Fix:** Consolidate to single check path (use `assertPermission('admin.access')` only, or align with middleware's `canAccessAdminCmsForRole`).

---

## Recommendations

1. **Create `assertCeoAccess()`** in `src/lib/ceo/access.ts` following the `assertDeveloperAccess()` pattern
2. **Apply guard to all CEO queries** — both analytics (`'use server'`) and financial queries
3. **Align dev force user override** between middleware and `resolve-role.ts`
4. **Verify entitlement convergence** — ensure `getViewerEntitlements()` for `developerPortal` delegates to the same policy function used by middleware
5. **Consider renaming** `/api/admin/flags` to `/api/developer/flags` for clarity
