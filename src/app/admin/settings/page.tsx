import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { isSuperAdmin } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import { getAdminUsers } from '@/lib/actions/admin/roles'
import { SectionHeader } from '@/components/shared/section-header'
import { AdminRoleManager } from '@/components/admin/settings/AdminRoleManager'

export const metadata: Metadata = { title: 'Settings - SlateCamp Admin' }

const AdminSettingsPage = async () => {
  const isSuper = await isSuperAdmin()
  if (!isSuper) redirect(ROUTES.admin.root)

  const { rows: adminUsers, storageMode } = await getAdminUsers()

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Settings"
        title="User Roles"
        subtitle="Manage admin access and permissions"
        level="page"
      />

      <AdminRoleManager initialAdminUsers={adminUsers} storageMode={storageMode} />
    </div>
  )
}

export default AdminSettingsPage
