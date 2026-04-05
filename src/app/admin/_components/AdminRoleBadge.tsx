import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/admin/roles'

const roleConfig = {
  super_admin: { variant: 'danger' as const, label: 'super_admin' },
  content_admin: { variant: 'warning' as const, label: 'content_admin' },
  sme_reviewer: { variant: 'info' as const, label: 'sme_reviewer' },
} as const

interface AdminRoleBadgeProps {
  role: UserRole
}

const AdminRoleBadge = ({ role }: AdminRoleBadgeProps) => {
  const config = roleConfig[role]
  return (
    <Badge
      variant={config.variant}
      size="xs"
      shape="pill"
      className="font-[family-name:var(--font-dm-mono)]"
    >
      {config.label}
    </Badge>
  )
}

export { AdminRoleBadge }
