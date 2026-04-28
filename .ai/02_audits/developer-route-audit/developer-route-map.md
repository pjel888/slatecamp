# Developer Route Map

**Last Updated:** 2026-04-28

## Route Tree

```
/developer
├── /                          Developer Portal Overview (metrics, health, changelog)
├── /api-reference             API Reference (route handlers, server actions, webhooks)
├── /architecture              Architecture Overview (tech stack, DB schema, auth, deployment)
├── /status                    Status Dashboard (system health, KPIs, uptime bars)
├── /status/database           Database Status (connection pool, table counts, migrations)
├── /status/infrastructure     Infrastructure Status (API latency, edge functions, deployments)
├── /tools                     Dev Tools Landing (console, db, logs, test data)
├── /tools/console             Developer Console (feature flags, impersonation, system info)
├── /tools/db                  Database Browser (tables, row counts, RLS status)
├── /tools/logs                Audit Logs & Application Errors
└── /tools/test-data           Test Data Generator (mock sessions, organizations)
```

## Layouts, Loading, and Error Boundaries

| Path | Layout | Loading | Error | Notes |
|------|--------|---------|-------|-------|
| `/developer` | `layout.tsx` | `loading.tsx` | `error.tsx` | Root layout with auth gate |
| `/developer/api-reference` | inherited | `loading.tsx` | inherited | Static documentation |
| `/developer/architecture` | inherited | `loading.tsx` | inherited | Static documentation |
| `/developer/status` | inherited | `loading.tsx` | inherited | Live + mock data hybrid |
| `/developer/status/database` | inherited | `loading.tsx` | inherited | Mock data (documented) |
| `/developer/status/infrastructure` | inherited | `loading.tsx` | inherited | Mock data (documented) |
| `/developer/tools` | inherited | `loading.tsx` | inherited | Tool landing page |
| `/developer/tools/console` | inherited | `loading.tsx` | inherited | Client component shell |
| `/developer/tools/db` | inherited | `loading.tsx` | inherited | Server component table |
| `/developer/tools/logs` | inherited | `loading.tsx` | inherited | Server component tables |
| `/developer/tools/test-data` | inherited | `loading.tsx` | inherited | Client component form |

## Layout Details

### `src/app/developer/layout.tsx`
- **Type:** Async Server Component
- **Auth checks:**
  1. `getViewerEntitlements([ENTITLEMENT_FEATURE_KEYS.developerPortal])`
  2. Redirect to `/dashboard` if `developerPortal` decision is denied
- **Data:** None directly (layout only)
- **Props to DevPortalShell:** `env` (`development` | `staging` | `production`)
- **Env detection:** Uses `entitlements.overrides.allowDevPortalBypass` → `'development'`, otherwise checks `NEXT_PUBLIC_APP_URL` for `'staging'`

### `src/app/developer/error.tsx`
- **Type:** Client Component (`"use client"`)
- **Features:** Error message, digest ID, "Try again" button
- **Logs:** `[Developer Portal Error]` prefix to console

### `src/app/developer/not-found.tsx`
- **Type:** Server Component
- **Features:** 404 message, link back to `/developer`

## Middleware and Route Guards

### `src/lib/supabase/middleware.ts`
- First line of defense for all `/developer/*` paths
- Checks `canAccessDeveloperPortalForRole(role, allowDeveloperBypass)` from entitlements
- Redirects to `/dashboard` if denied
- Logs `entitlement.denied` audit event
- Dev bypass: `DEV_FORCE_USER_ID` on localhost

### Layout-Level Guards
- `getViewerEntitlements()` with `developerPortal` feature key
- Redirects unauthenticated to `/dashboard`

### Page-Level Guards
| Page | Guard | Redirect on Denial |
|------|-------|-------------------|
| All sub-pages | Inherited from layout | `/dashboard` |
| None have individual page guards | — | — |

## Related API/Server Routes

| Route | Purpose | Used By |
|-------|---------|---------|
| `src/lib/actions/dev/db-viewer.ts` | Table metadata, row counts, RLS status | `/developer/tools/db` |
| `src/lib/actions/dev/test-data.ts` | Generate mock quiz sessions and organizations | `/developer/tools/test-data` |
| `src/lib/developer/status-snapshot.ts` | Fetch Supabase service status | `/developer`, `/developer/status` |
| `src/lib/developer/repo-metrics.ts` | Count source files and Storybook stories | `/developer` |
| `src/lib/audit/audit-queries.ts` | Audit log queries | `/developer/tools/logs` |
| `src/lib/logging/server.ts` | Application error events | `/developer/tools/logs` |

## Evidence

- Routes: `src/app/developer/`
- Layout: `src/app/developer/layout.tsx`
- Error: `src/app/developer/error.tsx`
- Not found: `src/app/developer/not-found.tsx`
- Middleware: `src/lib/supabase/middleware.ts`
- Entitlements: `src/lib/entitlements/policy.ts`
- Dev actions: `src/lib/actions/dev/`
