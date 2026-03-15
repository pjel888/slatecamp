import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { canReviewContent } from '@/lib/admin/roles'
import { 
  LayoutDashboard, 
  FileQuestion, 
  FileText, 
  Box, 
  Network, 
  ClipboardList,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
  { href: '/admin/wiki', label: 'Wiki', icon: FileText },
  { href: '/admin/assets', label: '3D Assets', icon: Box },
  { href: '/admin/taxonomy', label: 'Taxonomy', icon: Network },
  { href: '/admin/audit', label: 'Audit Log', icon: Shield },
  { href: '/admin/reviews', label: 'Reviews', icon: ClipboardList },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  // Check admin role
  const isAdmin = await canReviewContent()
  if (!isAdmin) {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold">Control Room</h1>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
        
        <nav className="p-2 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-colors"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            Admin Panel
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href={ROUTES.DASHBOARD}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
