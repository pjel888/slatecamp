'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ANALYTICS_TABS,
  getAnalyticsTabHref,
  getAnalyticsTabId,
} from '@/lib/analytics/tabs'

export const AnalyticsTabNav = () => {
  const searchParams = useSearchParams()
  const activeTab = getAnalyticsTabId(searchParams.get('tab'))

  return (
    <nav
      className="flex shrink-0 items-end overflow-x-auto border-b border-border px-1 pt-1"
      aria-label="Analytics sections"
      data-analytics-primary-nav
      data-analytics-tab-strip
    >
      {ANALYTICS_TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <Link
            key={tab.id}
            href={getAnalyticsTabHref(tab.id)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative inline-flex h-10 shrink-0 items-center justify-center rounded-t-md border px-3 text-sm font-semibold transition-colors duration-150 ease-out focus-visible:z-20 sm:px-4',
              isActive
                ? 'z-10 -mb-px border-border border-b-card bg-card text-foreground shadow-xs'
                : 'border-transparent border-b-border bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
            )}
            data-analytics-tab-link={tab.id}
          >
            <span>{tab.shortLabel}</span>
          </Link>
        )
      })}
    </nav>
  )
}
