import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import Link from 'next/link'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { DEV_NAV_ITEMS } from '@/lib/constants/developer'

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
          {DEV_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <SCIcon icon={Icon} size="xs" />
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
