import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { canReviewContent, getUserRole } from '@/lib/admin/roles'
import { UnifiedAppShell } from '@/components/layout/UnifiedAppShell'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''

  // CRITICAL: Public Landing Bypass — login page renders without portal chrome
  if (pathname === '/admin') {
    return <>{children}</>
  }

  const { data: { user } } = await getUser()
  if (!user) return <>{children}</>

  const isAdmin = await canReviewContent()
  if (!isAdmin && pathname !== '/admin') {
    redirect(ROUTES.DASHBOARD)
  }

  const role = await getUserRole()
  if (!role) {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <UnifiedAppShell role="admin" displayName="Admin">
      {children}
    </UnifiedAppShell>
  )
}
