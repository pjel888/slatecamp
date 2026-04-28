# Security Risk Review

**Last Updated:** 2026-04-27

## Risk Register

### RISK-001: Client-Only Guard Risks

| Field | Detail |
|-------|--------|
| **Risk** | Some UI elements are hidden client-side without server-side enforcement |
| **Location** | `src/components/admin/` (inferred pattern) |
| **Severity** | Medium |
| **Evidence** | Common React pattern; needs per-component verification |
| **Impact** | Malicious user could potentially trigger admin actions if server-side guards are missing |
| **Mitigation** | Verify every admin server action has `assertPermission()` at the top |
| **Test** | ADM-API-05, ADM-API-06 |

### RISK-002: Missing Server-Side Authorization in Some Actions

| Field | Detail |
|-------|--------|
| **Risk** | Not all admin server actions explicitly check permissions |
| **Location** | `src/lib/actions/admin/dashboard.ts`, `src/lib/actions/admin/question-queries.ts` |
| **Severity** | Medium |
| **Evidence** | `getQuestionsForAnalytics()` uses `canReviewContent()` but `getAdminDashboardData()` may not have explicit action-level guard |
| **Impact** | Data leakage if action is called directly |
| **Mitigation** | Add `assertPermission()` to all read-only actions |
| **Test** | ADM-API-01 through ADM-API-06 |

### RISK-003: Legacy `isAdminByEmail()` with Hardcoded Domain

| Field | Detail |
|-------|--------|
| **Risk** | `isAdminByEmail()` checks `email.endsWith('@slatecamp.com')` |
| **Location** | `src/lib/admin/is-admin.ts` |
| **Severity** | Medium |
| **Evidence** | `export async function isAdminByEmail(email: string | undefined): Promise<boolean> { return email.endsWith('@slatecamp.com') || ... }` |
| **Impact** | Any email ending with `@slatecamp.com` is treated as admin |
| **Mitigation** | Remove or hard-disable `isAdminByEmail()` |
| **Test** | Verify no callers exist |

### RISK-004: Direct Object Reference

| Field | Detail |
|-------|--------|
| **Risk** | Some actions accept IDs without verifying ownership |
| **Location** | `src/lib/actions/admin/content.ts`, `src/lib/actions/admin/questions.ts` |
| **Severity** | Low |
| **Evidence** | Needs per-action verification |
| **Impact** | User A could potentially mutate User B's content if ID is guessable |
| **Mitigation** | Add ownership checks to all mutating actions |
| **Test** | Fuzz test with random IDs |

### RISK-005: Missing Audit Logs for Sensitive Actions

| Field | Detail |
|-------|--------|
| **Risk** | No audit trail for role changes, content deletions, or user mutations |
| **Location** | `src/lib/actions/admin/roles.ts`, `src/lib/actions/admin/questions.ts`, `src/lib/actions/admin/wiki.ts` |
| **Severity** | High |
| **Evidence** | No `audit_logs` insert found in action files |
| **Impact** | Cannot trace who made what change when |
| **Mitigation** | Add audit logging to all mutations |
| **Test** | ADM-DATA consistency tests |

### RISK-006: Overly Broad Admin Roles

| Field | Detail |
|-------|--------|
| **Risk** | `admin` and `content_admin` roles have broad permissions without granularity |
| **Location** | `src/lib/entitlements/policy.ts` |
| **Severity** | High |
| **Evidence** | `canManageContent()` grants edit, delete, publish, import without separation |
| **Impact** | Principle of least privilege is violated |
| **Mitigation** | Implement fine-grained permissions (see rbac-audit-and-plan.md) |
| **Test** | ADM-RBAC-03, ADM-RBAC-04 |

### RISK-007: Inconsistent Role Checks

| Field | Detail |
|-------|--------|
| **Risk** | Some CEO pages lack `verifyCeoAccess()` |
| **Location** | `src/app/(protected)/ceo/analytics/page.tsx`, `src/app/(protected)/ceo/insights/page.tsx` |
| **Severity** | Medium |
| **Evidence** | Only layout gate protects these pages; `financials` and `team` have additional guards |
| **Impact** | If layout guard is bypassed, page data is accessible |
| **Mitigation** | Add `verifyCeoAccess()` to all CEO pages |
| **Test** | E2E-CEO-01 |

### RISK-008: Dev Bypass in Production

| Field | Detail |
|-------|--------|
| **Risk** | `DEV_FORCE_USER_ID` and `ALLOW_DEV_PORTAL_BYPASS` could leak to production |
| **Location** | `src/lib/supabase/middleware.ts`, `src/lib/entitlements/dev-overrides.ts` |
| **Severity** | Critical |
| **Evidence** | `process.env.DEV_FORCE_USER_ID` and `process.env.ALLOW_DEV_PORTAL_BYPASS` |
| **Impact** | Complete auth bypass if env vars are set in production |
| **Mitigation** | Ensure `DISABLE_DEV_FORCE_USER_ID=true` in all production/CI environments; block `ALLOW_DEV_PORTAL_BYPASS` in production builds |
| **Test** | Verify env vars are absent in production |

### RISK-009: `profiles.role` Fallback

| Field | Detail |
|-------|--------|
| **Risk** | When `user_roles` is unavailable, system falls back to `profiles.role` |
| **Location** | `src/lib/actions/admin/roles.ts` |
| **Severity** | Low |
| **Evidence** | Try/catch with fallback to `profiles` table |
| **Impact** | Two sources of truth for role data |
| **Mitigation** | Remove fallback; fail loudly if `user_roles` is unavailable |
| **Test** | ADM-RBAC-12 |

### RISK-010: No Rate Limiting on Admin Actions

| Field | Detail |
|-------|--------|
| **Risk** | No rate limiting observed on admin mutations |
| **Location** | `src/lib/actions/admin/` |
| **Severity** | Medium |
| **Evidence** | No rate limit middleware or wrapper found |
| **Impact** | Brute force or accidental flooding of admin endpoints |
| **Mitigation** | Add rate limiting to sensitive actions (bulk import, role changes) |
| **Test** | Load test admin actions |

### RISK-011: CEO Role Sync Architecture Gap

| Field | Detail |
|-------|--------|
| **Risk** | CEO `assignSystemRole` updates `ceo_team_members.system_role` → `profiles.role` via trigger, but NOT `user_roles` |
| **Location** | `src/lib/actions/ceo/team-actions.ts`, `DATABASE_SCHEMA.sql` |
| **Severity** | High |
| **Evidence** | `tr_sync_team_role` trigger syncs to `profiles.role` only |
| **Impact** | CEO-assigned roles may not grant actual admin access |
| **Mitigation** | Update trigger or action to also write to `user_roles` |
| **Test** | E2E-CEO-01 |

### RISK-012: Missing CSRF Protection on Server Actions

| Field | Detail |
|-------|--------|
| **Risk** | Next.js Server Actions have built-in CSRF protection via origin check, but custom API routes may not |
| **Location** | `src/app/api/admin/flags` |
| **Severity** | Low |
| **Evidence** | Next.js 16 handles SA CSRF; API routes need manual verification |
| **Impact** | CSRF on API routes if not protected |
| **Mitigation** | Verify origin header on all custom API routes |
| **Test** | ADM-API-06 |

## Summary by Severity

| Severity | Count | Top Risks |
|----------|-------|-----------|
| Critical | 1 | RISK-008: Dev bypass in production |
| High | 3 | RISK-005: Missing audit logs, RISK-006: Overly broad roles, RISK-011: CEO role sync gap |
| Medium | 6 | RISK-001, RISK-002, RISK-003, RISK-007, RISK-010, RISK-012 |
| Low | 2 | RISK-004, RISK-009 |

## Evidence

- Admin actions: `src/lib/actions/admin/`
- Role helpers: `src/lib/admin/roles.ts`
- Entitlements: `src/lib/entitlements/`
- Middleware: `src/lib/supabase/middleware.ts`
- CEO actions: `src/lib/actions/ceo/team-actions.ts`
- Schema: `DATABASE_SCHEMA.sql`
