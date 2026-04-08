'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'

const TABS = [
  { href: ROUTES.dashboard.analytics, label: 'Overview', exact: true },
  { href: ROUTES.dashboard.analyticsAdvanced, label: 'Deep Insights', exact: false },
] as const

export const AnalyticsTabNav = () => {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b border-border mb-2" aria-label="Analytics sections">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out border-b-2 -mb-px',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
