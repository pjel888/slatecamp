import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { canReviewContent, getUserRole } from '@/lib/admin/roles'
import { AdminShell } from './_components/AdminShell'
import { getNeedsAttentionData } from '@/lib/actions/admin/dashboard'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''

  // CRITICAL: Public Landing Bypass — login page renders without portal chrome
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const { data: { user } } = await getUser()
  if (!user) redirect('/admin/login')

  const isAdmin = await canReviewContent()
  if (!isAdmin && pathname !== '/admin/login') {
    redirect(ROUTES.DASHBOARD)
  }

  const role = await getUserRole()
  if (!role) {
    redirect(ROUTES.DASHBOARD)
  }

  const attentionData = await getNeedsAttentionData()

  return (
    <AdminShell role={role} badgeCounts={{ pendingReviews: attentionData.pendingReviews }}>
      {children}
    </AdminShell>
  )
}
