import { Scroll } from '@phosphor-icons/react/dist/ssr'

import { DataTable, type Column } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionHeader } from '@/components/shared/section-header'
import { getAuditLogs } from '@/lib/audit/audit-queries'
import { getApplicationErrorEvents } from '@/lib/logging/server'

interface AuditLogRow extends Record<string, unknown> {
  id: string
  actor_id: string
  event_type: string
  table_name: string
  record_id: string
  metadata: Record<string, unknown> | null
  created_at: string
  user_label: string
  details_summary: string
}

interface ApplicationErrorRow extends Record<string, unknown> {
  id: string
  severity: string
  family: string
  message: string
  routeOrAction: string
  userId: string | null
  provider: string | null
  eventName: string
  createdAt: string
  details_summary: string
}

const auditColumns: Column<AuditLogRow>[] = [
  {
    key: 'created_at',
    header: 'Time',
    type: 'date',
    sortable: true,
    className: 'font-mono text-muted-foreground',
  },
  {
    key: 'event_type',
    header: 'Event',
    type: 'text',
    sortable: true,
    className: 'font-medium text-foreground',
  },
  {
    key: 'table_name',
    header: 'Table',
    type: 'text',
    sortable: true,
    className: 'font-medium text-foreground',
  },
  {
    key: 'user_label',
    header: 'Actor',
    type: 'text',
    className: 'font-mono text-muted-foreground',
  },
  {
    key: 'details_summary',
    header: 'Metadata',
    type: 'text',
    className: 'font-mono text-muted-foreground',
  },
]

const applicationColumns: Column<ApplicationErrorRow>[] = [
  {
    key: 'createdAt',
    header: 'Time',
    type: 'date',
    sortable: true,
    className: 'font-mono text-muted-foreground',
  },
  {
    key: 'severity',
    header: 'Severity',
    type: 'text',
    sortable: true,
    className: 'font-medium text-foreground',
  },
  {
    key: 'family',
    header: 'Family',
    type: 'text',
    sortable: true,
    className: 'font-medium text-foreground',
  },
  {
    key: 'routeOrAction',
    header: 'Route / Action',
    type: 'text',
    className: 'font-mono text-muted-foreground',
  },
  {
    key: 'message',
    header: 'Message',
    type: 'text',
    className: 'text-foreground',
  },
  {
    key: 'details_summary',
    header: 'Metadata',
    type: 'text',
    className: 'font-mono text-muted-foreground',
  },
]

export default async function LogsPage() {
  let auditError: Error | null = null
  let applicationError: Error | null = null
  let auditRows: AuditLogRow[] = []
  let applicationRows: ApplicationErrorRow[] = []

  try {
    const logs = await getAuditLogs({ limit: 50 })
    auditRows = logs.map((log) => ({
      ...log,
      user_label: log.actor_id ? `${log.actor_id.slice(0, 8)}...` : 'system',
      details_summary:
        log.metadata && Object.keys(log.metadata).length > 0
          ? JSON.stringify(log.metadata)
          : '-',
    }))
  } catch (error) {
    auditError = error instanceof Error ? error : new Error('Failed to load audit logs')
  }

  try {
    const logs = await getApplicationErrorEvents({ limit: 50 })
    applicationRows = logs.map((log) => ({
      ...log,
      details_summary:
        Object.keys(log.metadata).length > 0 ? JSON.stringify(log.metadata) : '-',
    }))
  } catch (error) {
    applicationError =
      error instanceof Error ? error : new Error('Failed to load application errors')
  }

  return (
    <div className="max-w-5xl space-y-8">
      <SectionHeader
        eyebrow="Engineering"
        title="Logs"
        subtitle="Separate immutable audit history from operational application errors."
        level="page"
        className="max-w-xl"
      />

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Compliance"
          title="Audit Logs"
          subtitle="Immutable CREATE, UPDATE, and DELETE records from trigger-backed audit history."
          level="section"
        />

        {auditError ? (
          <EmptyState
            icon={<Scroll className="h-5 w-5" />}
            title="Audit logs are unavailable in this environment."
            description={`The audit_logs query failed: ${auditError.message}`}
          />
        ) : auditRows.length === 0 ? (
          <EmptyState
            icon={<Scroll className="h-5 w-5" />}
            title="No audit log entries have been recorded yet."
            description="Generate an admin mutation on a trigger-backed table to populate this view."
          />
        ) : (
          <DataTable
            columns={auditColumns}
            data={auditRows}
            keyField="id"
            searchable
            searchPlaceholder="Search audit logs"
            searchFields={['event_type', 'table_name', 'actor_id', 'details_summary']}
            defaultSort={{ key: 'created_at', direction: 'desc' }}
            pageSize={10}
          />
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          eyebrow="Operations"
          title="Application Errors"
          subtitle="Operational failures persisted through the application error logger."
          level="section"
        />

        {applicationError ? (
          <EmptyState
            icon={<Scroll className="h-5 w-5" />}
            title="Application errors are unavailable in this environment."
            description={applicationError.message}
          />
        ) : applicationRows.length === 0 ? (
          <EmptyState
            icon={<Scroll className="h-5 w-5" />}
            title="No application errors have been captured yet."
            description="Trigger a logged middleware, action, or webhook failure to populate this view."
          />
        ) : (
          <DataTable
            columns={applicationColumns}
            data={applicationRows}
            keyField="id"
            searchable
            searchPlaceholder="Search application errors"
            searchFields={['severity', 'family', 'routeOrAction', 'message', 'details_summary']}
            defaultSort={{ key: 'createdAt', direction: 'desc' }}
            pageSize={10}
          />
        )}
      </section>
    </div>
  )
}
