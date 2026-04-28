import { verifyCeoAccess } from '@/lib/queries/ceo/auth'
import { getPermissionAuditLog } from '@/lib/actions/ceo/admin-role-actions'
import { SectionHeader } from '@/components/shared/section-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { EmptyState } from '@/components/shared/empty-state'
import { Clock } from '@phosphor-icons/react/dist/ssr'

export const metadata = {
  title: 'Permission Audit — CEO Dashboard',
}

const ACTION_LABEL_MAP: Record<string, string> = {
  'role.assign': 'Assigned',
  'role.revoke': 'Revoked',
}

export default async function CeoPermissionAuditPage() {
  await verifyCeoAccess()

  const logs = await getPermissionAuditLog(50, 0)

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Permission Audit"
        title="Role Change History"
        subtitle="Track all admin role assignments and revocations"
        level="page"
      />

      <Card>
        {logs.length === 0 ? (
          <EmptyState
            icon={<Clock size={20} />}
            title="No audit entries yet"
            description="Role changes will appear here once they are made."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actor
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Target User
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const action = (log.metadata as Record<string, string> | null)?.action ?? 'unknown'
                  const role = (log.metadata as Record<string, string> | null)?.role ?? 'unknown'
                  const label = ACTION_LABEL_MAP[action] ?? action

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-border bg-card transition-colors duration-150 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm font-[family-name:var(--font-dm-mono)] text-xs">
                        {log.actor_id ? `${log.actor_id.slice(0, 8)}…${log.actor_id.slice(-4)}` : 'System'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={action === 'role.revoke' ? 'danger' : 'success'} size="sm">
                          {label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-[family-name:var(--font-dm-mono)] text-xs">
                        {log.record_id ? `${log.record_id.slice(0, 8)}…${log.record_id.slice(-4)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="capitalize">{role.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatRelativeTime(log.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
