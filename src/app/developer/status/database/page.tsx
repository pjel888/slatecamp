import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { StatusBadge } from '@/components/developer/StatusBadge'
import { Card } from '@/components/ui/card'
import { getDatabaseStatus } from '@/lib/mocks/status'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const timeAgo = (timestamp: string): string => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const migrationStatusMap = {
  applied: 'operational',
  failed: 'outage',
  pending: 'degraded',
} as const

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const DatabaseStatusPage = async () => {
  const db = await getDatabaseStatus()

  const { active, idle, max } = db.connections
  const activePercent = (active / max) * 100
  const idlePercent = (idle / max) * 100
  const remainingPercent = 100 - activePercent - idlePercent

  return (
    <div className="max-w-5xl space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
          Database
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight">
          Database Status
        </h1>
      </div>

      {/* Connection Pool */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Connection Pool
        </p>
        <Card size="sm">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary transition-all duration-150"
              style={{ width: `${activePercent}%` }}
              title={`Active: ${active}`}
            />
            <div
              className="bg-emerald-500 transition-all duration-150"
              style={{ width: `${idlePercent}%` }}
              title={`Idle: ${idle}`}
            />
            <div
              className="bg-border transition-all duration-150"
              style={{ width: `${remainingPercent}%` }}
              title={`Available: ${max - active - idle}`}
            />
          </div>
          <div className="flex items-center gap-4 mt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="font-[family-name:var(--font-dm-mono)] tabular-nums">{active}</span> active
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-[family-name:var(--font-dm-mono)] tabular-nums">{idle}</span> idle
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-border shrink-0" />
              <span className="font-[family-name:var(--font-dm-mono)] tabular-nums">{max}</span> max
            </span>
          </div>
        </Card>
      </div>

      {/* Table Row Counts */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Table Row Counts
        </p>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-[family-name:var(--font-dm-mono)]">
                  Table
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-[family-name:var(--font-dm-mono)] text-right">
                  Rows
                </th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-[family-name:var(--font-dm-mono)] text-right">
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              {db.tables.map((table) => (
                <tr
                  key={table.name}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors duration-150"
                >
                  <td className="px-4 py-2 text-xs font-[family-name:var(--font-dm-mono)] text-foreground">
                    {table.name}
                  </td>
                  <td className="px-4 py-2 text-xs font-[family-name:var(--font-dm-mono)] tabular-nums text-muted-foreground text-right">
                    {table.rowCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs font-[family-name:var(--font-dm-mono)] tabular-nums text-muted-foreground text-right">
                    {table.size}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Migrations */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Recent Migrations
        </p>
        <Card size="sm" className="divide-y divide-border">
          {db.migrations.map((migration) => (
            <div
              key={migration.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-[family-name:var(--font-dm-mono)] text-foreground">
                  {migration.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(migration.timestamp)}
                </span>
              </div>
              <StatusBadge
                status={migrationStatusMap[migration.status]}
                size="sm"
              />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export default DatabaseStatusPage
