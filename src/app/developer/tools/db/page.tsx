import { getTableInfo } from '@/lib/actions/dev/db-viewer'

export default async function DatabaseViewerPage() {
  const tables = await getTableInfo()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Database Browser</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Read-only view of database tables, row counts, and RLS status.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Table
              </th>
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Rows
              </th>
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                RLS
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr
                key={t.table_name}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-2 text-xs font-mono text-foreground">
                  {t.table_name}
                </td>
                <td className="px-4 py-2 text-xs font-mono text-muted-foreground text-right">
                  {t.row_count.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      t.rls_enabled ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    title={t.rls_enabled ? 'RLS enabled' : 'RLS disabled'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
