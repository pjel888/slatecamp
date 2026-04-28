'use client'

import { useEffect, useState } from 'react'
import { Shield, UserMinus, Users } from '@phosphor-icons/react/dist/ssr'
import {
  assignAdminRole,
  revokeAdminRole,
} from '@/lib/actions/ceo/admin-role-actions'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { RoleSelect } from '@/components/admin/settings/RoleSelect'

interface AdminUserRow {
  id: string
  user_id: string
  role: string
  created_at: string
  profiles?: { full_name: string | null; email: string | null } | null
}

const ROLE_BADGE_MAP: Record<string, { variant: 'danger' | 'warning' | 'info' | 'success'; label: string }> = {
  owner: { variant: 'danger', label: 'Owner' },
  super_admin: { variant: 'danger', label: 'Super Admin' },
  content_admin: { variant: 'warning', label: 'Content Admin' },
  admin: { variant: 'warning', label: 'Admin' },
  developer: { variant: 'success', label: 'Developer' },
  ceo: { variant: 'info', label: 'CEO' },
  sme_reviewer: { variant: 'info', label: 'SME Reviewer' },
}

const truncateUuid = (uuid: string) =>
  uuid.length > 12 ? `${uuid.slice(0, 8)}…${uuid.slice(-4)}` : uuid

const getAdminRoleRowKey = (row: AdminUserRow) =>
  row.id || `${row.user_id}-${row.role}-${row.created_at}`

export const CeoAdminRoleManager = ({
  initialAdminUsers,
}: {
  initialAdminUsers: AdminUserRow[]
}) => {
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const handleAssignRole = async () => {
    setAssigning(true)
    setError(null)
    try {
      const result = await assignAdminRole(userId, role)
      if (!result.success) {
        setError(result.error || 'Failed to assign role')
        return
      }

      const now = new Date().toISOString()
      setAdminUsers((prev) => {
        const existingIndex = prev.findIndex((row) => row.user_id === userId && row.role === role)
        if (existingIndex >= 0) {
          const next = [...prev]
          next[existingIndex] = { ...next[existingIndex], created_at: now }
          return next
        }
        return [{ id: `${userId}-${role}`, user_id: userId, role, created_at: now }, ...prev]
      })

      setUserId('')
      setRole('')
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : 'Failed to assign role')
    } finally {
      setAssigning(false)
    }
  }

  const handleRevokeRole = async (row: AdminUserRow) => {
    setRevokingId(row.id)
    setError(null)
    try {
      const result = await revokeAdminRole(row.user_id, row.role)
      if (!result.success) {
        setError(result.error || 'Failed to revoke role')
        return
      }
      setAdminUsers((prev) => prev.filter((item) => item.id !== row.id))
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : 'Failed to revoke role')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div
      className="space-y-6"
      data-testid="ceo-admin-role-manager"
      data-hydrated={hydrated ? 'true' : 'false'}
    >
      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      ) : null}

      <Card>
        {adminUsers.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No admin roles assigned"
            description="Use the form below to assign a role to a user."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Added
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                  const displayName = row.profiles?.full_name || row.profiles?.email || truncateUuid(row.user_id)

                  return (
                    <tr
                      key={getAdminRoleRowKey(row)}
                      className="border-b border-border bg-card transition-colors duration-150 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium">{displayName}</span>
                        <span
                          className="ml-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground"
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
                        {formatRelativeTime(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          loading={revokingId === row.id}
                          loadingText="Revoking..."
                          leftIcon={<UserMinus size={14} />}
                          onClick={() => handleRevokeRole(row)}
                          aria-label={`Revoke ${badge.label} role for user ${truncateUuid(row.user_id)}`}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Add Role</h3>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[240px] flex-1 flex-col gap-1.5">
              <label
                htmlFor="userId"
                className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                User ID
              </label>
              <Input
                id="userId"
                name="userId"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="User UUID"
                pattern="^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                title="Enter a valid UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                required
                size="md"
              />
            </div>

            <div className="flex min-w-[180px] flex-col gap-1.5">
              <label
                htmlFor="role"
                className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Role
              </label>
              <RoleSelect value={role} onValueChange={setRole} />
            </div>

            <Button
              type="button"
              size="md"
              loading={assigning}
              loadingText="Assigning..."
              onClick={handleAssignRole}
              disabled={!userId || !role}
            >
              Assign Role
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
