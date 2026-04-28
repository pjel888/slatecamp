import { verifyCeoAccess } from '@/lib/queries/ceo/auth'
import { getAdminUsers } from '@/lib/actions/ceo/admin-role-actions'
import { SectionHeader } from '@/components/shared/section-header'
import { CeoAdminRoleManager } from '@/components/ceo/CeoAdminRoleManager'

export const metadata = {
  title: 'Admin Roles — CEO Dashboard',
}

export default async function CeoAdminRolesPage() {
  await verifyCeoAccess()

  const adminUsersResult = await getAdminUsers()

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin Roles"
        title="Manage Admin Access"
        subtitle="Assign and revoke admin roles through the canonical user_roles table"
        level="page"
      />

      <CeoAdminRoleManager initialAdminUsers={adminUsersResult.rows} />
    </div>
  )
}
