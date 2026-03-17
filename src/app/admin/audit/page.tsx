import { isSuperAdmin } from '@/lib/admin/roles'
import { redirect } from 'next/navigation'
import { AuditLogViewer } from '@/components/admin/AuditLogViewer'

export default async function AdminAuditPage() {
  const admin = await isSuperAdmin()
  
  if (!admin) {
    redirect('/admin')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Audit Log</h1>
        <p className="text-muted-foreground">View all admin actions and changes (Super Admin only)</p>
      </div>

      <AuditLogViewer />
    </div>
  )
}
