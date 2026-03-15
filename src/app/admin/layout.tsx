import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { canReviewContent } from '@/lib/admin/roles'
import { AdminNav } from '@/components/admin/AdminNav'
import { SignOutButton } from '@/components/auth/SignOutButton'
import Link from 'next/link'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  
  // CRITICAL: Public Landing Bypass
  if (pathname === '/admin') {
    return <>{children}</>
  }

  const { data: { user } } = await getUser()
  if (!user) return <>{children}</> // Handled by Middleware

  const isAdmin = await canReviewContent()
  if (!isAdmin && pathname !== '/admin') {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold">Control Room</h1>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
        <AdminNav />
      </aside>

      <main className="flex-1">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">Admin Panel</div>
          <div className="flex items-center gap-6">
            <Link href={ROUTES.DASHBOARD} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Dashboard
            </Link>
            <div className="h-4 w-px bg-border" />
            <SignOutButton />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
