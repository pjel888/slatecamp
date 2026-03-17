import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'
import {
  Terminal,
  Database,
  FileText,
  TestTube2,
  ScrollText,
  Palette,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: ROUTES.DEVELOPER_CONSOLE, label: 'Console', icon: Terminal },
  { href: ROUTES.DEVELOPER_TEST_DATA, label: 'Test Data', icon: TestTube2 },
  { href: ROUTES.DEVELOPER_DOCS, label: 'Docs', icon: FileText },
  { href: ROUTES.DEVELOPER_DB, label: 'Database', icon: Database },
  { href: ROUTES.DEVELOPER_LOGS, label: 'Logs', icon: ScrollText },
  { href: ROUTES.DEVELOPER_DESIGN_SYSTEM, label: 'Design System', icon: Palette },
]

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    data: { user },
  } = await getUser()

  if (!user) redirect(ROUTES.LOGIN)

  const isDevOrAdmin =
    process.env.NODE_ENV === 'development' ||
    user.app_metadata?.role === 'admin' ||
    user.email?.endsWith('@slatecamp.com') ||
    user.email === 'philipjonlewis@gmail.com'

  if (!isDevOrAdmin) redirect(ROUTES.DASHBOARD)

  return (
    <div className="flex h-full">
      {/* Secondary sidebar */}
      <nav className="w-48 shrink-0 border-r border-border bg-background p-3">
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Developer
          </h2>
        </div>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}
