# Developer Permission Matrix

**Last Updated:** 2026-04-28

## Current State

The app uses a **coarse-grained** permission model for developer access. There is a single feature key `developer_portal` that gates the entire `/developer` route tree. All sub-features (console, db browser, logs, test data) are accessible to anyone with `developer_portal` access.

## Proposed Fine-Grained Permissions

While the current coarse model is acceptable for MVP, the following fine-grained permissions are proposed for future scalability:

| Permission Key | Purpose | Current Guard | Proposed Guard |
|----------------|---------|---------------|----------------|
| `developer.access` | Access developer portal | `developerPortal` feature key | Same |
| `developer.dashboard.view` | View overview page | `developerPortal` | Same |
| `developer.docs.view` | View API reference and architecture | `developerPortal` | Same |
| `developer.status.view` | View status pages | `developerPortal` | Same |
| `developer.tools.console` | Use feature flags and impersonation | `developerPortal` | Same (MVP) |
| `developer.tools.db` | Browse database tables | `developerPortal` | Same (MVP) |
| `developer.tools.logs` | View application errors | `developerPortal` | Same (MVP) |
| `developer.tools.testData` | Generate test data | `developerPortal` | **Add server-side check** |
| `developer.audit.view` | View audit logs | `isSuperAdmin()` | Keep separate |

## Matrix: Route × Role

| Route | owner | super_admin | content_admin | developer | admin | ceo | sme_reviewer | member | anonymous |
|-------|-------|-------------|---------------|-----------|-------|-----|--------------|--------|-----------|
| `/developer` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/api-reference` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/architecture` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/status` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/status/database` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/status/infrastructure` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/tools` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/tools/console` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/tools/db` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/tools/logs` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/developer/tools/test-data` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**Notes:**
- Audit logs within `/developer/tools/logs` require `isSuperAdmin()` independently.
- `ALLOW_DEV_PORTAL_BYPASS=true` grants access to ALL authenticated users for ALL routes.

## Matrix: Action × Role

| Action | owner | super_admin | content_admin | developer | admin | ceo | sme_reviewer | member | anonymous |
|--------|-------|-------------|---------------|-----------|-------|-----|--------------|--------|-----------|
| `getTableInfo` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌* | ❌* | ❌ |
| `generateTestSessions` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌* | ❌* | ❌ |
| `generateTestOrg` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌* | ❌* | ❌ |
| `getAuditLogs` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `getApplicationErrorEvents` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**\*** These actions currently only check `getUser()`, not developer role. They should deny non-developers.

## Implementation Notes

### Files to Modify

1. `src/lib/actions/dev/test-data.ts` — Add developer role assertion
2. `src/lib/actions/dev/db-viewer.ts` — Add developer role assertion
3. `src/lib/entitlements/policy.ts` — Optionally add fine-grained dev permissions (future)
4. `src/app/developer/tools/console/page.tsx` — Optionally add page-level guard
5. `src/app/developer/tools/test-data/page.tsx` — Optionally add page-level guard
6. `src/app/developer/tools/db/page.tsx` — Optionally add page-level guard
7. `src/app/developer/tools/logs/page.tsx` — Optionally add page-level guard

### Helper Function Proposal

```typescript
// src/lib/developer/access.ts
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

export async function assertDeveloperAccess() {
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.developerPortal,
  ])
  const allowed =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.developerPortal]?.allowed ?? false
  if (!allowed) {
    throw new Error('Not authorized to access developer tools')
  }
}
```

This helper should be called at the top of every dev server action.
