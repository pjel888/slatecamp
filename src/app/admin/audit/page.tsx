import type { Metadata } from 'next'
import { isSuperAdmin } from '@/lib/admin/roles'

export const metadata: Metadata = { title: 'Audit Log — SlateCamp Admin' }
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
