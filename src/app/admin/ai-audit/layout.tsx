import { requirePermissionOrRedirect } from '@/lib/admin/roles'
import { AiAuditPageHeader } from '@/components/admin/ai-audit/AiAuditShared'

export default async function AiAuditLayout({ children }: { children: React.ReactNode }) {
  await requirePermissionOrRedirect('admin.content.view')

  return (
    <div className="space-y-6">
      <AiAuditPageHeader />
      {children}
    </div>
  )
}
