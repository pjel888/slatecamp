import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/routes'
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
  const pathname =
    headerList.get('x-pathname') ||
    headerList.get('next-url') ||
    ''

  // CRITICAL: Public Landing Bypass — login page renders without portal chrome
  if (pathname === ROUTES.admin.login) {
    return <>{children}</>
  }

  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.admin.login)

  const isAdmin = await canReviewContent()
  if (!isAdmin && pathname !== ROUTES.admin.login) {
    redirect(ROUTES.dashboard.root)
  }

  const role = await getUserRole()
  if (!role) {
    redirect(ROUTES.dashboard.root)
  }

  const attentionData = await getNeedsAttentionData()

  // Full-bleed editor routes get no padding — the editor manages its own layout
  const isFullBleedEditor = /^\/admin\/knowledge(\/questions)?\/[^/]+$/.test(pathname)

  return (
    <AdminShell
      role={role}
      badgeCounts={{ pendingReviews: attentionData.pendingReviews }}
      noPadding={isFullBleedEditor}
    >
      {children}
    </AdminShell>
  )
}
