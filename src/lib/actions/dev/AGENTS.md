<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# dev

## Purpose

Development and debugging utilities. Database inspection tools, test data generation, and introspection helpers for development environments only.

## Key Files

| File | Description |
|------|-------------|
| **db-viewer.ts** | Query table info: table names, approximate row counts, RLS status for all public tables |
| **test-data.ts** | Generate test data: seed users, quiz sessions, interactions, mastery snapshots for testing |

## For AI Agents

### Working In This Directory

1. **Use `'use server'`** on all action files.
2. **Development only** — these actions should be wrapped with environment checks (dev mode only, not production).
3. **RPC fallback** — db-viewer attempts RPC first (`get_table_info_for_dev`), falls back to direct table queries if RPC unavailable.
4. **No auth required** — dev actions may bypass authentication if explicitly intended for developer tooling.
5. **Non-destructive** — prefer read-only queries; if write operations are needed, guard with explicit dev mode checks.
6. **Error handling** — be graceful with RPC failures and missing tables; return sensible defaults.

### Common Patterns

**RPC with fallback:**
```typescript
'use server'

export async function getTableInfo(): Promise<TableInfo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_table_info_for_dev')

  if (error) {
    // Fallback: iterate known tables manually
    const knownTables = ['profiles', 'quiz_sessions', ...]
    const results: TableInfo[] = []

    for (const table of knownTables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      results.push({
        table_name: table,
        row_count: count ?? 0,
        rls_enabled: true,
      })
    }

    return results
  }

  return (data as TableInfo[]) ?? []
}
```

## Dependencies

### Internal

- `@/lib/supabase/server` — createClient

### External

- `@supabase/supabase-js` — Supabase client
