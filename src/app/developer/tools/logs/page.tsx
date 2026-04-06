import { Scroll } from '@phosphor-icons/react/dist/ssr'

import { DataTable, type Column } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionHeader } from '@/components/shared/section-header'
import { createClient } from '@/lib/supabase/server'

interface AuditLog {
  id: string
  user_id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

interface AuditLogRow extends Record<string, unknown>, AuditLog {
  user_label: string
  details_summary: string
}

export default async function LogsPage() {
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, user_id, action, details, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const entries = (error ? [] : (logs as AuditLog[])) ?? []
  const rows: AuditLogRow[] = entries.map((log) => ({
    ...log,
    user_label: `${log.user_id.slice(0, 8)}...`,
    details_summary: log.details ? JSON.stringify(log.details) : '-',
  }))

  const columns: Column<AuditLogRow>[] = [
    {
      key: 'created_at',
      header: 'Time',
      type: 'date',
      sortable: true,
      className: 'font-mono text-muted-foreground',
    },
    {
      key: 'action',
      header: 'Action',
      type: 'text',
      sortable: true,
      className: 'font-medium text-foreground',
    },
    {
      key: 'user_label',
      header: 'User',
      type: 'text',
      className: 'font-mono text-muted-foreground',
    },
    {
      key: 'details_summary',
      header: 'Details',
      type: 'text',
      className: 'font-mono text-muted-foreground',
    },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="Engineering"
        title="Audit Logs"
        subtitle="Recent CREATE, UPDATE, and DELETE events emitted by internal platform tooling."
        level="page"
        className="max-w-xl"
      />

      {error ? (
        <EmptyState
          icon={<Scroll className="h-5 w-5" />}
          title="Audit logs are unavailable in this environment."
          description={`The audit_logs query failed: ${error.message}`}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Scroll className="h-5 w-5" />}
          title="No audit log entries have been recorded yet."
          description="Generate an admin mutation or background task event to populate this table."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          keyField="id"
          searchable
          searchPlaceholder="Search audit logs"
          searchFields={['action', 'user_id', 'details_summary']}
          defaultSort={{ key: 'created_at', direction: 'desc' }}
          pageSize={10}
        />
      )}
    </div>
  )
}
