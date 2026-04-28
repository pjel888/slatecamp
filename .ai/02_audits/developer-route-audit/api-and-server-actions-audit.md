# API and Server Actions Audit

**Last Updated:** 2026-04-28

## Server Actions Used by `/developer`

### 1. `getTableInfo`

| Field | Detail |
|-------|--------|
| **File** | `src/lib/actions/dev/db-viewer.ts` |
| **Type** | Server Action (`'use server'`) |
| **Purpose** | Return table names, approximate row counts, and RLS status |
| **Inputs** | None |
| **Outputs** | `TableInfo[]` — `{ table_name, row_count, rls_enabled }` |
| **Validation** | None |
| **Authorization** | `getUser()` — checks authentication only. **Missing developer role check.** |
| **Error handling** | RPC error falls back to iterating known tables with individual count queries |
| **Data access** | Supabase RPC `get_table_info_for_dev` or individual table `count` queries |
| **External services** | None |
| **Logging** | None |
| **Rate limiting** | None |
| **Tests** | None |
| **Risk** | Medium — any authenticated user can call this |
| **Fix required** | Add `assertDeveloperAccess()` |

### 2. `generateTestSessions`

| Field | Detail |
|-------|--------|
| **File** | `src/lib/actions/dev/test-data.ts` |
| **Type** | Server Action (`'use server'`) |
| **Purpose** | Generate mock quiz sessions for the current user |
| **Inputs** | `count: number` |
| **Outputs** | `{ message: string }` |
| **Validation** | None (count not validated) |
| **Authorization** | `getUser()` — checks authentication only. **Missing developer role check.** |
| **Error handling** | Returns message if no exam profile or no subjects |
| **Data access** | Inserts into `review_sessions` |
| **External services** | None |
| **Logging** | None |
| **Rate limiting** | None |
| **Tests** | None |
| **Risk** | Medium — any authenticated user can create test data |
| **Fix required** | Add `assertDeveloperAccess()` and input validation |

### 3. `generateTestOrg`

| Field | Detail |
|-------|--------|
| **File** | `src/lib/actions/dev/test-data.ts` |
| **Type** | Server Action (`'use server'`) |
| **Purpose** | Generate a test organization with current user as owner |
| **Inputs** | None |
| **Outputs** | `{ message: string }` |
| **Validation** | None |
| **Authorization** | `getUser()` — checks authentication only. **Missing developer role check.** |
| **Error handling** | Returns message on org or member insert error |
| **Data access** | Inserts into `organizations` and `organization_members` |
| **External services** | None |
| **Logging** | None |
| **Rate limiting** | None |
| **Tests** | None |
| **Risk** | Medium — any authenticated user can create organizations |
| **Fix required** | Add `assertDeveloperAccess()` |

### 4. `getAuditLogs`

| Field | Detail |
|-------|--------|
| **File** | `src/lib/audit/audit-queries.ts` |
| **Type** | Server Action (exported async function) |
| **Purpose** | Query audit logs with filters |
| **Inputs** | `AuditLogFilters` — table, event type, actor, dates, limit, offset |
| **Outputs** | `AuditLog[]` |
| **Validation** | None |
| **Authorization** | `isSuperAdmin()` — requires super admin role |
| **Error handling** | Falls back to synthetic audit rows if `audit_logs` table unavailable (PGRST205) |
| **Data access** | `audit_logs` table via service client |
| **External services** | None |
| **Logging** | None |
| **Rate limiting** | None |
| **Tests** | `src/lib/audit/audit-queries.test.ts` |
| **Risk** | Low — properly restricted to super admin |
| **Fix required** | None |

### 5. `getApplicationErrorEvents`

| Field | Detail |
|-------|--------|
| **File** | `src/lib/logging/server.ts` |
| **Type** | Server function (not exported as action) |
| **Purpose** | Query application error events from analytics_events |
| **Inputs** | `ApplicationErrorFilters` — severity, family, limit |
| **Outputs** | `ApplicationErrorLogRow[]` |
| **Validation** | None |
| **Authorization** | `assertCanViewOperationalLogs()` — checks developer portal access |
| **Error handling** | Throws on query error |
| **Data access** | `analytics_events` table via admin client |
| **External services** | None |
| **Logging** | None |
| **Rate limiting** | None |
| **Tests** | `src/lib/logging/server.test.ts` |
| **Risk** | Low — properly restricted |
| **Fix required** | None |

## API Routes Referenced in Documentation

The `/developer/api-reference` page documents these API routes but they are not directly part of the developer portal:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/payments/checkout` | POST | Create checkout session |
| `/api/webhooks/lemonsqueezy` | POST | LemonSqueezy webhook handler |
| `/api/webhooks/payrex` | POST | PayRex webhook handler |
| `/api/cron/focus-review-scan` | GET | Daily cron job |
| `/api/cron/compute-signals` | GET | Daily cron job |
| `/api/ai/tutor` | POST | AI tutoring |
| `/api/ai/generate-questions` | POST | AI question generation |
| `/api/ai/study-agent` | POST | AI study assistance |
| `/api/admin/flags` | POST/DELETE | Feature flag overrides |

These routes have their own auth and are documented statically in the developer portal.

## External API Calls from Developer Portal

| Function | Endpoint | Purpose | Timeout |
|----------|----------|---------|---------|
| `getDeveloperServiceStatusSnapshot` | `https://status.supabase.com/api/v2/summary.json` | Supabase service health | **None** |

## Evidence

- Dev actions: `src/lib/actions/dev/`
- Audit queries: `src/lib/audit/audit-queries.ts`
- Logging: `src/lib/logging/server.ts`
- API docs: `src/lib/developer/api-reference-data.ts`
- Status snapshot: `src/lib/developer/status-snapshot.ts`
