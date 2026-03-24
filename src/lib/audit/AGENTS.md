<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# audit

Audit trail logging for admin actions and data changes. Server-side only (use server).

## Purpose

Immutable log of admin/system actions (create, update, delete) for compliance and debugging. Requires super-admin role to query. Supports filtering by table, event type, actor, date range, record ID.

## Key Files

| File | Description |
|------|-------------|
| `audit-actions.ts` | `getAuditLogsAction(filters)` — server action to fetch audit logs. Super-admin gated. Returns `AuditLog[]` ordered by created_at DESC. |
| `audit-queries.ts` | `getAuditLogs(filters)`, `getAuditLogsByTable(tableName, recordId?)`, `getAuditLogsByActor(actorId)`, `getAuditLogCount(filters)`. All super-admin gated. |

## For AI Agents

### Working In This Directory

- All functions are `'use server'` (server actions/utilities).
- Every function checks `isSuperAdmin()` before querying; throws if not authorized.
- `AuditLog` schema: `id`, `actor_id`, `event_type`, `table_name`, `record_id`, `metadata`, `content_snapshot`, `created_at`.
- Supports filtering: `tableName`, `eventType`, `actorId`, `recordId`, date range, pagination (offset/limit).

### Adding New Audit Query

1. Create function in `audit-queries.ts`.
2. Call `isSuperAdmin()` first; throw if not authorized.
3. Build query from base: `supabase.from('audit_logs').select('*')`.
4. Apply filters using `.eq()`, `.gte()`, `.lte()` as needed.
5. Return `AuditLog[]` or count; handle errors with throw.

### Common Patterns

- **Filtering**: Each filter param is optional; only add `.eq()` if provided.
- **Pagination**: Use `.range(offset, offset + limit - 1)` for slice behavior.
- **Authorization**: All queries check super-admin; no partial/role-based data filtering.
- **Error handling**: Throw on Supabase error; client/caller handles try/catch.

## Dependencies

### Internal

- `@/lib/supabase/server` — Create server Supabase client.
- `@/lib/admin/roles` — `isSuperAdmin()` authorization check.

### External

- Supabase (server client).

<!-- MANUAL: -->
