import { createClient } from '@/lib/supabase/server'

interface AuditLog {
  id: string
  user_id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

export default async function LogsPage() {
  const supabase = await createClient()

  // Attempt to read audit_logs — table may not exist yet
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const entries = (error ? [] : (logs as AuditLog[])) ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recent audit log entries from the system.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-600">
          audit_logs table not available: {error.message}
        </div>
      )}

      {entries.length === 0 && !error ? (
        <div className="rounded-lg border border-border bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
          No audit log entries found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Time
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-2 text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs font-medium text-foreground">
                    {log.action}
                  </td>
                  <td className="px-4 py-2 text-[11px] font-mono text-muted-foreground">
                    {log.user_id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-2 text-[11px] font-mono text-muted-foreground max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
