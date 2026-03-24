import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin/roles'

export const metadata: Metadata = { title: 'Settings — SlateCamp Admin' }
import { getAdminUsers, assignRole, revokeRole } from '@/lib/actions/admin/roles'
import { SectionHeader } from '@/components/shared/section-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmitButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { Shield, UserX, Users } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ROLE_BADGE_MAP: Record<string, { variant: 'danger' | 'warning' | 'info'; label: string }> = {
  super_admin: { variant: 'danger', label: 'Super Admin' },
  content_admin: { variant: 'warning', label: 'Content Admin' },
  sme_reviewer: { variant: 'info', label: 'SME Reviewer' },
}

const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '\u2014'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay <= 7) return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const truncateUuid = (uuid: string) =>
  uuid.length > 12 ? `${uuid.slice(0, 8)}\u2026${uuid.slice(-4)}` : uuid

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const AdminSettingsPage = async () => {
  const isSuper = await isSuperAdmin()
  if (!isSuper) redirect('/admin/dashboard')

  const adminUsers = await getAdminUsers()

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Settings"
        title="User Roles"
        subtitle="Manage admin access and permissions"
        level="page"
      />

      {/* Current admin users */}
      <Card>
        {adminUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            message="No admin roles assigned"
            description="Use the form below to assign a role to a user."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Added
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {/* Actions */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((row) => {
                  const badge = ROLE_BADGE_MAP[row.role] ?? {
                    variant: 'info' as const,
                    label: row.role,
                  }

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border bg-card transition-colors duration-150 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm">
                        <span
                          className="font-[family-name:var(--font-dm-mono)] text-xs"
                          title={row.user_id}
                        >
                          {truncateUuid(row.user_id)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatRelativeDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={revokeRole}>
                          <input type="hidden" name="roleId" value={row.id} />
                          <SubmitButton
                            variant="ghost"
                            size="xs"
                            pendingLabel="Revoking..."
                            leftIcon={<UserX className="size-3.5" />}
                          >
                            Revoke
                          </SubmitButton>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assign role form */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Add Role</h3>
          </div>

          <form action={assignRole} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5 min-w-[240px] flex-1">
              <label
                htmlFor="userId"
                className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                User ID
              </label>
              <Input
                id="userId"
                name="userId"
                placeholder="User UUID"
                required
                size="md"
              />
            </div>

            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <label
                htmlFor="role"
                className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="h-9 rounded-sm border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                defaultValue=""
              >
                <option value="" disabled>
                  Select role...
                </option>
                <option value="super_admin">Super Admin</option>
                <option value="content_admin">Content Admin</option>
                <option value="sme_reviewer">SME Reviewer</option>
              </select>
            </div>

            <SubmitButton size="md" pendingLabel="Assigning...">
              Assign Role
            </SubmitButton>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default AdminSettingsPage
