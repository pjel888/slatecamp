import { Database } from '@phosphor-icons/react/dist/ssr'

import { DataTable, type Column } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionHeader } from '@/components/shared/section-header'
import { getTableInfo, type TableInfo } from '@/lib/actions/dev/db-viewer'
import { assertDeveloperAccess } from '@/lib/developer/access'

type DatabaseTableRow = Record<string, unknown> & TableInfo & {
  rls_status: string
}

export default async function DatabaseViewerPage() {
  await assertDeveloperAccess()

  const tables = await getTableInfo()

  const rows: DatabaseTableRow[] = tables.map((table) => ({
    ...table,
    rls_status: table.rls_enabled ? 'Enabled' : 'Disabled',
  }))

  const columns: Column<DatabaseTableRow>[] = [
    {
      key: 'table_name',
      header: 'Table',
      type: 'text',
      sortable: true,
      className: 'font-mono text-foreground',
    },
    {
      key: 'row_count',
      header: 'Rows',
      type: 'number',
      sortable: true,
    },
    {
      key: 'rls_status',
      header: 'RLS',
      type: 'text',
      sortable: true,
    },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="Engineering"
        title="Database Browser"
        subtitle="Read-only view of database tables, row counts, and row-level security coverage."
        level="page"
        className="max-w-xl"
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Database className="h-5 w-5" />}
          title="No tables are available to inspect."
          description="The developer RPC did not return any table metadata for this environment."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          keyField="table_name"
          searchable
          searchPlaceholder="Search tables"
          searchFields={['table_name', 'rls_status']}
          defaultSort={{ key: 'row_count', direction: 'desc' }}
        />
      )}
    </div>
  )
}
