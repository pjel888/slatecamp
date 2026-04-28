# Functionality Audit

**Last Updated:** 2026-04-28

## 1. Developer Portal Overview (`/developer`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Direct navigation to `/developer` |
| **Expected behavior** | Load platform metrics, system health, quick actions, tech stack, changelog |
| **Actual code path** | `page.tsx` → `createClient()` → parallel count queries + `getDeveloperRepoMetrics()` + `getDeveloperServiceStatusSnapshot()` |
| **Success handling** | Renders cards, stats, health dots, tech stack table, changelog entries |
| **Error handling** | Caught by `error.tsx` boundary |
| **Loading state** | `loading.tsx` with skeleton cards and stat skeletons |
| **Empty state** | Counts default to `0` if null |
| **Validation** | None needed (read-only) |
| **Permission checks** | Layout-level `developerPortal` entitlement |
| **Test coverage** | E2E: `e2e/admin-permissions-developer.spec.ts` |
| **Issues found** | `getDeveloperRepoMetrics` walks filesystem without timeout. `performance.now()` in RSC for ping is not meaningful (runs server-side). |
| **Fix required** | Remove `performance.now()` ping from overview page (already on status page). Add timeout to repo metrics walk. |

## 2. API Reference (`/developer/api-reference`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/api-reference` |
| **Expected behavior** | Display route handlers, server actions, webhooks in tabs |
| **Actual code path** | Static page rendering from `api-reference-data.ts` |
| **Success handling** | Tabs render with endpoint cards and tables |
| **Error handling** | None (static data) |
| **Loading state** | `loading.tsx` |
| **Empty state** | N/A |
| **Validation** | N/A |
| **Permission checks** | Layout-level only |
| **Issues found** | `EndpointCard` uses `<div onClick>` without keyboard support. No `aria-expanded`. No focus trap for expanded content. |
| **Fix required** | Add keyboard support, `aria-expanded`, and focus management to `EndpointCard`. |

## 3. Architecture Overview (`/developer/architecture`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/architecture` |
| **Expected behavior** | Display tech stack, DB schema, auth, data flow, deployment |
| **Actual code path** | Static page rendering from `architecture-data.ts` |
| **Success handling** | Tabs render with tables, code blocks, cards |
| **Error handling** | None (static data) |
| **Loading state** | `loading.tsx` |
| **Empty state** | N/A |
| **Validation** | N/A |
| **Permission checks** | Layout-level only |
| **Issues found** | Static role matrix may drift from live `policy.ts`. Environment variables listed are names only (safe). |
| **Fix required** | Add comment noting static matrix is illustrative. |

## 4. Status Dashboard (`/developer/status`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/status` |
| **Expected behavior** | Show system health banner, KPI cards, uptime bars |
| **Actual code path** | `page.tsx` → `getDeveloperServiceStatusSnapshot()` → Supabase status API fetch + live ping |
| **Success handling** | Banner shows worst status. KPIs show database, API, edge health. |
| **Error handling** | Status API fetch fails gracefully (returns `operational` default). Ping `.catch(() => null)`. |
| **Loading state** | `loading.tsx` |
| **Empty state** | Uptime bars always show 30 days (deterministic from current status) |
| **Validation** | None |
| **Permission checks** | Layout-level only |
| **Issues found** | `fetch` to Supabase status API has no timeout. `performance.now()` in RSC is server-side render time, not client latency. Uptime bars are not persisted history. |
| **Fix required** | Add `AbortSignal` timeout to status fetch. Clarify ping is server-to-Supabase latency. |

## 5. Database Status (`/developer/status/database`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/status/database` |
| **Expected behavior** | Show connection pool, table counts, recent migrations |
| **Actual code path** | `page.tsx` → `getDatabaseStatus()` (mock) |
| **Success handling** | Renders pool bar, table list, migration list |
| **Error handling** | None (mock data always succeeds) |
| **Loading state** | `loading.tsx` |
| **Empty state** | N/A |
| **Permission checks** | Layout-level only |
| **Issues found** | Mock data is hardcoded. Pool bar uses `title` attribute for tooltips (not screen-reader friendly). |
| **Fix required** | Add aria-label to pool segments. Document that this page uses mock data until live telemetry is wired. |

## 6. Infrastructure Status (`/developer/status/infrastructure`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/status/infrastructure` |
| **Expected behavior** | Show API latency percentiles, edge function health, last deployment |
| **Actual code path** | `page.tsx` → `getInfrastructureStatus()` (mock) |
| **Success handling** | Renders latency cards, edge function list, deployment card |
| **Error handling** | None (mock data always succeeds) |
| **Loading state** | `loading.tsx` |
| **Empty state** | N/A |
| **Permission checks** | Layout-level only |
| **Issues found** | Mock data is hardcoded with future timestamps. |
| **Fix required** | Document mock status. Consider wiring to Vercel deployment API. |

## 7. Developer Console (`/developer/tools/console`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/tools/console` |
| **Expected behavior** | Show feature flags, impersonation panel, system info |
| **Actual code path** | `page.tsx` → `getUser()` + `feature_flags` query → `ConsoleClient` |
| **Success handling** | Renders impersonation, feature flag board, system info |
| **Error handling** | None specific (generic error boundary) |
| **Loading state** | `loading.tsx` |
| **Empty state** | N/A |
| **Permission checks** | Layout-level only |
| **Issues found** | System info passes `userId`, `userEmail`, `userRole` to client. No page-level guard. `FeatureFlagBoard` and `ImpersonationPanel` are client components with their own state. |
| **Fix required** | Add page-level developer guard. Mask sensitive user data in system info if needed. |

## 8. Database Browser (`/developer/tools/db`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/tools/db` |
| **Expected behavior** | Show table list with row counts and RLS status |
| **Actual code path** | `page.tsx` → `getTableInfo()` server action |
| **Success handling** | Renders `DataTable` with sortable/searchable rows |
| **Error handling** | Empty state if no tables returned |
| **Loading state** | `loading.tsx` |
| **Empty state** | `EmptyState` component with database icon |
| **Permission checks** | Layout-level only. Server action checks `getUser()` but not developer role. |
| **Issues found** | Server action only checks authentication, not authorization. RPC fallback iterates known tables with individual count queries. |
| **Fix required** | Add developer role assertion to `getTableInfo()`. |

## 9. Audit Logs & Application Errors (`/developer/tools/logs`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Navigation to `/developer/tools/logs` |
| **Expected behavior** | Show audit logs and application errors in separate sections |
| **Actual code path** | `page.tsx` → `getAuditLogs()` + `getApplicationErrorEvents()` with try/catch |
| **Success handling** | Renders two `DataTable` components |
| **Error handling** | Each section has independent error handling with `EmptyState` |
| **Loading state** | `loading.tsx` |
| **Empty state** | `EmptyState` for empty logs and for errors |
| **Permission checks** | `getAuditLogs` requires super admin. `getApplicationErrorEvents` requires developer portal access. |
| **Issues found** | Audit logs section may show error state for non-super-admin developers. This is correct behavior but UI could be clearer. |
| **Fix required** | Consider showing a "Super Admin Only" notice for audit logs section when user lacks permission. |

## 10. Test Data Generator (`/developer/tools/test-data`)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Click "Generate Sessions" or "Generate Org" |
| **Expected behavior** | Create mock quiz sessions or test organization |
| **Actual code path** | `test-data-client.tsx` → `generateTestSessions()` / `generateTestOrg()` |
| **Success handling** | Shows success message with count |
| **Error handling** | Shows generic error message. No retry. |
| **Loading state** | Button disabled with "Generating..." text |
| **Empty state** | N/A |
| **Confirmation** | None |
| **Permission checks** | Layout-level only. Server actions check `getUser()` but not developer role. |
| **Issues found** | No developer role check in server actions. No rate limiting. No confirmation dialog. Generates real DB rows. Uses raw `<button>` instead of design system. |
| **Fix required** | Add developer role assertion. Add confirmation dialog. Use design system Button. Add basic rate limiting. |

## Evidence

- All routes: `src/app/developer/`
- All actions: `src/lib/actions/dev/`
- Components: `src/components/developer/`
- Dev shell: `src/app/developer/_components/DevPortalShell.tsx`
