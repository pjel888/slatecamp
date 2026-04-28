# RBAC and Security Audit

**Last Updated:** 2026-04-28

## Current Auth Provider

- **Provider:** Supabase Auth with cookie-based SSR sessions (`@supabase/ssr`)
- **Role resolution:** `resolveRoleFromInputs()` considers `app_metadata.role`, `user_metadata.role`, `profiles.role`, `user_roles` table, and dev force overrides
- **Entitlement system:** `getViewerEntitlements()` with feature keys

## Developer Portal Entitlement

### Policy Definition

```typescript
// src/lib/entitlements/policy.ts
const DEV_TOOLBAR_ROLES = new Set([
  'owner', 'super_admin', 'content_admin', 'developer', 'admin', 'ceo'
])

export const canAccessDeveloperPortalForRole = (
  role: CanonicalRole,
  allowBypass: boolean,
): boolean => allowBypass || canSeeDevToolbarForRole(role)
```

**Allowed roles:** `owner`, `super_admin`, `content_admin`, `developer`, `admin`, `ceo`
**Denied roles:** `member`, `anonymous`, `sme_reviewer`

### Bypass Controls

| Bypass | Env Var | Effect |
|--------|---------|--------|
| Dev portal bypass | `ALLOW_DEV_PORTAL_BYPASS=true` | Opens portal to ALL authenticated users |
| Local dev bypass | `DEV_FORCE_USER_ID` + localhost | Bypasses all middleware checks |
| Dev flag cookie | `cerebro_dev_flags` | Can simulate tier but NOT role |

## Middleware Guard

**File:** `src/lib/supabase/middleware.ts`

- Checks `isDeveloperPath` for all `/developer/*`
- Calls `canAccessDeveloperPortalForRole(normalizedRole, allowDeveloperBypass)`
- Redirects to `/dashboard` if denied
- Logs `entitlement.denied` audit event
- Dev bypass: `DEV_FORCE_USER_ID` on localhost skips all checks

## Layout Guard

**File:** `src/app/developer/layout.tsx`

- Calls `getViewerEntitlements([ENTITLEMENT_FEATURE_KEYS.developerPortal])`
- Redirects to `/dashboard` if `developerPortal` decision is denied
- Sets `env` badge based on bypass state and app URL

## Page-Level Guards

| Route | Guard | Notes |
|-------|-------|-------|
| `/developer` | Layout only | — |
| `/developer/api-reference` | Layout only | — |
| `/developer/architecture` | Layout only | — |
| `/developer/status` | Layout only | — |
| `/developer/status/database` | Layout only | — |
| `/developer/status/infrastructure` | Layout only | — |
| `/developer/tools` | Layout only | — |
| `/developer/tools/console` | Layout only | No page guard |
| `/developer/tools/db` | Layout only | No page guard |
| `/developer/tools/logs` | Layout only | No page guard |
| `/developer/tools/test-data` | Layout only | No page guard |

**Finding:** No page-level guards exist. All sub-routes rely solely on the layout guard.

## Server Action Guards

| Action | File | Auth Check | Developer Check | Notes |
|--------|------|------------|-----------------|-------|
| `getTableInfo` | `src/lib/actions/dev/db-viewer.ts` | `getUser()` | ❌ No | Only checks authentication |
| `generateTestSessions` | `src/lib/actions/dev/test-data.ts` | `getUser()` | ❌ No | Only checks authentication |
| `generateTestOrg` | `src/lib/actions/dev/test-data.ts` | `getUser()` | ❌ No | Only checks authentication |
| `getAuditLogs` | `src/lib/audit/audit-queries.ts` | `isSuperAdmin()` | ❌ N/A | Requires super admin |
| `getApplicationErrorEvents` | `src/lib/logging/server.ts` | `assertCanViewOperationalLogs()` | ✅ Yes | Checks developer portal access |

## Client-Side Gates

- **DevPortalShell** renders navigation based on surface registry
- No client-side permission checks hide specific tools
- All authenticated developers see all tools

## Secret/Data Exposure Audit

| Concern | Status | Evidence |
|---------|--------|----------|
| Environment variable values exposed | ✅ Safe | Only names listed in architecture page |
| API keys displayed | ✅ Safe | No keys displayed |
| Stack traces exposed to user | ✅ Safe | Error boundary shows message only |
| User IDs exposed | ⚠️ Partial | `SystemInfo` shows current user ID |
| User emails exposed | ⚠️ Partial | `SystemInfo` shows current user email |
| Database connection strings | ✅ Safe | Not displayed |
| Feature flag values | ✅ Safe | Only boolean enabled state |

## Production-Dangerous Dev Bypasses

| Bypass | Production Risk | Mitigation |
|--------|----------------|------------|
| `ALLOW_DEV_PORTAL_BYPASS=true` | High — opens dev portal to all users | Env var control; should never be set in production |
| `DEV_FORCE_USER_ID` | Medium — only on localhost | Hostname check (`localhost` or `127.0.0.1`) |
| `DEV_FORCE_TIER` | Low — affects tier only | Does not grant developer portal access |

## Security Risks

| Risk | Severity | Location | Evidence | Recommended Mitigation |
|------|----------|----------|----------|------------------------|
| Test data actions lack developer role check | **Medium** | `src/lib/actions/dev/test-data.ts` | `getUser()` only | Add `assertDeveloperAccess()` to actions |
| DB viewer action lacks developer role check | **Medium** | `src/lib/actions/dev/db-viewer.ts` | `getUser()` only | Add `assertDeveloperAccess()` to action |
| No rate limiting on test data generation | **Medium** | `src/lib/actions/dev/test-data.ts` | No rate limit | Add rate limiting or confirmation |
| No audit logging for test data mutations | **Medium** | `src/lib/actions/dev/test-data.ts` | No logging | Add audit log entries |
| `ALLOW_DEV_PORTAL_BYPASS` could be set in production | **Low** | `src/lib/entitlements/dev-overrides.ts` | Env var read | Add env validation warning in build |
| Console page exposes user ID/email to client | **Low** | `src/app/developer/tools/console/page.tsx` | Props passed to client | Consider if exposure is necessary |

## Classification of Current Protection

| Layer | Classification |
|-------|----------------|
| Middleware | Role-based + bypass control |
| Layout | Permission-based (feature key) |
| Page | ❌ No protection (inherits layout) |
| Server Action | Mixed — some have checks, some don't |
| Client-side | UX only (no hiding of tools by permission) |

## Recommended Security Improvements

1. **Add `assertDeveloperAccess()` helper** and use it in all dev server actions
2. **Add page-level guards** to console, test-data, db, and logs
3. **Add rate limiting** to test data generation
4. **Add audit logging** for test data mutations
5. **Validate `ALLOW_DEV_PORTAL_BYPASS`** is not set in production builds
6. **Minimize user data** passed to console client
