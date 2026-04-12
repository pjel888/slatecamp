import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/admin/roles'

const roleConfig: Record<string, { variant: 'danger' | 'warning' | 'info' | 'success'; label: string }> = {
  owner: { variant: 'danger', label: 'owner' },
  super_admin: { variant: 'danger', label: 'super_admin' },
  content_admin: { variant: 'warning', label: 'content_admin' },
  admin: { variant: 'warning', label: 'admin' },
  developer: { variant: 'success', label: 'developer' },
  ceo: { variant: 'info', label: 'ceo' },
  sme_reviewer: { variant: 'info', label: 'sme_reviewer' },
}

interface AdminRoleBadgeProps {
  role: UserRole
}

const AdminRoleBadge = ({ role }: AdminRoleBadgeProps) => {
  const config = roleConfig[role] ?? { variant: 'info', label: role }
  return (
    <Badge
      variant={config.variant as any}
      size="xs"
      shape="pill"
      className="font-[family-name:var(--font-dm-mono)]"
    >
      {config.label}
    </Badge>
  )
}

export { AdminRoleBadge }
