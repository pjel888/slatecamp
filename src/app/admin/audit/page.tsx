import type { Metadata } from 'next'
import { requirePermissionOrRedirect } from '@/lib/admin/roles'
import { AuditLogViewer } from '@/components/admin/AuditLogViewer'

export const metadata: Metadata = { title: 'Audit Log - SlateCamp Admin' }

export default async function AdminAuditPage() {
  await requirePermissionOrRedirect('admin.audit.view')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Audit Log</h1>
        <p className="text-muted-foreground">View all admin actions and changes</p>
      </div>

      <AuditLogViewer />
    </div>
  )
}
