# Developer Feature Inventory

**Last Updated:** 2026-04-28

## Legend

| Status | Meaning |
|--------|---------|
| Complete | Implemented and functional |
| Partial | Core exists but has known gaps |
| Stubbed | Surface exists but logic is incomplete |
| Unknown | Cannot verify from code |

| Risk | Meaning |
|------|---------|
| Critical | Security or data integrity risk |
| High | Significant functional or UX risk |
| Medium | Moderate risk |
| Low | Minor risk |

---

## 1. Developer Portal Overview

| Field | Detail |
|-------|--------|
| **Feature** | Developer Portal Overview |
| **Purpose** | Landing page: platform metrics, system health, quick actions, tech stack, changelog |
| **Route** | `/developer` |
| **Components** | `SectionHeader`, `ActionCard`, `StatCard`, `Badge`, `Card` |
| **Data** | `getDeveloperRepoMetrics()`, `getDeveloperServiceStatusSnapshot()`, Supabase counts |
| **Actions** | None |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Complete |
| **Evidence** | `src/app/developer/page.tsx` |
| **Risk** | Low |
| **Notes** | Metrics fetched from Supabase count APIs. Repo metrics walk filesystem. Health snapshot from Supabase status API. |

## 2. API Reference

| Field | Detail |
|-------|--------|
| **Feature** | API Reference |
| **Purpose** | Document route handlers, server actions, and webhook contracts |
| **Route** | `/developer/api-reference` |
| **Components** | `EndpointCard`, `SectionHeader`, `Tabs`, `CodeBlock` |
| **Data** | Static data from `src/lib/developer/api-reference-data.ts` |
| **Actions** | None |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Complete |
| **Evidence** | `src/app/developer/api-reference/page.tsx` |
| **Risk** | Low |
| **Notes** | EndpointCard has accessibility gap (div onClick without keyboard support). |

## 3. Architecture Overview

| Field | Detail |
|-------|--------|
| **Feature** | Architecture Overview |
| **Purpose** | Tech stack, database schema, auth model, data flow, deployment config |
| **Route** | `/developer/architecture` |
| **Components** | `SectionHeader`, `Tabs`, `Card`, `CodeBlock`, `Badge` |
| **Data** | Static data from `src/lib/developer/architecture-data.ts` |
| **Actions** | None |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Complete |
| **Evidence** | `src/app/developer/architecture/page.tsx` |
| **Risk** | Low |
| **Notes** | Lists environment variable names (not values). Role matrix is static and may drift from live policy. |

## 4. Status Dashboard

| Field | Detail |
|-------|--------|
| **Feature** | Status Dashboard |
| **Purpose** | Real-time health metrics for SlateCamp infrastructure |
| **Route** | `/developer/status` |
| **Components** | `SectionHeader`, `StatusBanner`, `StatusKPICard`, `UptimeBar`, `SurfaceTruthNotice`, `Breadcrumbs` |
| **Data** | `getDeveloperServiceStatusSnapshot()`, live Supabase ping |
| **Actions** | None |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Partial |
| **Evidence** | `src/app/developer/status/page.tsx` |
| **Risk** | Medium |
| **Notes** | Uptime bars are deterministic snapshots (repeat current status) — documented via SurfaceTruthNotice. Supabase ping uses `performance.now()` which may not be meaningful in RSC. |

## 5. Database Status

| Field | Detail |
|-------|--------|
| **Feature** | Database Status |
| **Purpose** | Connection pool usage, table growth, migration health |
| **Route** | `/developer/status/database` |
| **Components** | `SectionHeader`, `StatusBadge`, `SurfaceTruthNotice`, `Breadcrumbs`, `Card` |
| **Data** | `getDatabaseStatus()` (mock provider) |
| **Actions** | None |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Partial |
| **Evidence** | `src/app/developer/status/database/page.tsx` |
| **Risk** | Medium |
| **Notes** | Explicitly marked as fallback/mock data via SurfaceTruthNotice. Connection pool bar uses `title` attribute for tooltips (not accessible). |

## 6. Infrastructure Status

| Field | Detail |
|-------|--------|
| **Feature** | Infrastructure Status |
| **Purpose** | API latency, edge-function health, deployment telemetry |
| **Route** | `/developer/status/infrastructure` |
| **Components** | `SectionHeader`, `StatusBadge`, `SurfaceTruthNotice`, `Breadcrumbs`, `Card` |
| **Data** | `getInfrastructureStatus()` (mock provider) |
| **Actions** | None |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Partial |
| **Evidence** | `src/app/developer/status/infrastructure/page.tsx` |
| **Risk** | Medium |
| **Notes** | Explicitly marked as fallback/mock data via SurfaceTruthNotice. |

## 7. Dev Tools Landing

| Field | Detail |
|-------|--------|
| **Feature** | Dev Tools Landing |
| **Purpose** | Navigate to console, db browser, logs, test data |
| **Route** | `/developer/tools` |
| **Components** | `SectionHeader`, `ActionCard` |
| **Data** | Static surface registry |
| **Actions** | None |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Complete |
| **Evidence** | `src/app/developer/tools/page.tsx` |
| **Risk** | Low |

## 8. Developer Console

| Field | Detail |
|-------|--------|
| **Feature** | Developer Console |
| **Purpose** | Feature flags, impersonation, system info inspection |
| **Route** | `/developer/tools/console` |
| **Components** | `ConsoleClient`, `ImpersonationPanel`, `FeatureFlagBoard`, `SystemInfo` |
| **Data** | `feature_flags` table, `buildDevSystemInfo()` |
| **Actions** | None directly (client components handle mutations) |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Partial |
| **Evidence** | `src/app/developer/tools/console/page.tsx`, `console-client.tsx` |
| **Risk** | Medium |
| **Notes** | System info exposes `userId`, `userEmail`, `userRole` to client. No page-level guard beyond layout. |

## 9. Database Browser

| Field | Detail |
|-------|--------|
| **Feature** | Database Browser |
| **Purpose** | Read-only view of tables, row counts, RLS coverage |
| **Route** | `/developer/tools/db` |
| **Components** | `SectionHeader`, `DataTable`, `EmptyState` |
| **Data** | `getTableInfo()` server action |
| **Actions** | `src/lib/actions/dev/db-viewer.ts` |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Partial |
| **Evidence** | `src/app/developer/tools/db/page.tsx` |
| **Risk** | Medium |
| **Notes** | Server action only checks `getUser()`, not developer role. RPC fallback queries known tables individually. |

## 10. Audit Logs & Application Errors

| Field | Detail |
|-------|--------|
| **Feature** | Audit Logs & Application Errors |
| **Purpose** | View immutable audit history and operational errors |
| **Route** | `/developer/tools/logs` |
| **Components** | `SectionHeader`, `DataTable`, `EmptyState`, `SurfaceTruthNotice` |
| **Data** | `getAuditLogs()`, `getApplicationErrorEvents()` |
| **Actions** | `src/lib/audit/audit-queries.ts`, `src/lib/logging/server.ts` |
| **Auth** | `developerPortal` entitlement (layout). `getAuditLogs` requires super admin. `getApplicationErrorEvents` requires developer portal access. |
| **Status** | Partial |
| **Evidence** | `src/app/developer/tools/logs/page.tsx` |
| **Risk** | Low |
| **Notes** | Graceful error handling for both audit and application log sections. Audit logs require super admin (separate from dev portal). |

## 11. Test Data Generator

| Field | Detail |
|-------|--------|
| **Feature** | Test Data Generator |
| **Purpose** | Generate mock quiz sessions and test organizations |
| **Route** | `/developer/tools/test-data` |
| **Components** | `TestDataClient` |
| **Data** | None |
| **Actions** | `generateTestSessions()`, `generateTestOrg()` |
| **Auth** | `developerPortal` entitlement (layout) |
| **Status** | Partial |
| **Evidence** | `src/app/developer/tools/test-data/page.tsx`, `test-data-client.tsx` |
| **Risk** | High |
| **Notes** | Server actions only check `getUser()`, not developer role. No rate limiting. No confirmation dialog. Uses raw `<button>` instead of design system. Generates real DB rows. |

## Evidence

- All routes: `src/app/developer/`
- All actions: `src/lib/actions/dev/`
- All components: `src/components/developer/`
- Dev shell: `src/app/developer/_components/DevPortalShell.tsx`
- Surface registry: `src/lib/developer/surface-registry.ts`
