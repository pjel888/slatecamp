import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ANALYTICS_DETAIL_PANELS,
  ANALYTICS_TAB_PANELS,
} from './_lib/tab-sections'
import {
  ANALYTICS_DETAILS_BY_TAB,
  getAnalyticsDetail,
  getAnalyticsDetailHref,
  getAnalyticsTab,
  getAnalyticsTabHref,
  resolveAnalyticsRoute,
} from '@/lib/analytics/tabs'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = (await searchParams) ?? {}
  const route = resolveAnalyticsRoute({
    tab: params.tab,
    detail: params.detail,
  })

  if (route.shouldRedirect) {
    redirect(route.canonicalHref)
  }

  const activeTabId = route.tabId
  const activeDetailId = route.detailId
  const activeTab = getAnalyticsTab(activeTabId)
  const activeDetail = activeDetailId
    ? getAnalyticsDetail(activeDetailId)
    : undefined
  const panel = activeDetailId
    ? ANALYTICS_DETAIL_PANELS[activeDetailId]
    : ANALYTICS_TAB_PANELS[activeTabId]
  const detailLinks = ANALYTICS_DETAILS_BY_TAB[activeTabId]
  const activeLabel = activeDetail?.label ?? activeTab.label
  const activeDescription = activeDetail?.description ?? activeTab.description

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-md rounded-tr-md border border-t-0 border-border bg-card p-2 shadow-xs"
      aria-labelledby="analytics-active-tab-title"
      data-analytics-canonical-slug={activeDetailId ?? activeTabId}
      data-analytics-active-detail={activeDetailId}
      data-analytics-shell
      data-analytics-tab={activeTabId}
    >
      <div className="sr-only">
        <h1 id="analytics-active-tab-title">{activeLabel}</h1>
        <p>{activeDescription}</p>
      </div>
      {detailLinks.length > 0 && (
        <nav
          aria-label={`${activeTab.label} diagnostics`}
          className="mb-2 flex shrink-0 flex-wrap items-center gap-1 text-xs"
          data-analytics-detail-nav={activeTabId}
        >
          <Link
            href={getAnalyticsTabHref(activeTabId)}
            className={cn(
              'rounded-sm border px-2 py-1 font-medium transition-colors',
              !activeDetailId
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            Primary
          </Link>
          {detailLinks.map((detail) => {
            const isActive = activeDetailId === detail.id
            return (
              <Link
                key={detail.id}
                href={getAnalyticsDetailHref(detail.tabId, detail.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'rounded-sm border px-2 py-1 font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
                )}
                data-analytics-detail-link={detail.id}
              >
                {detail.shortLabel}
              </Link>
            )
          })}
        </nav>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        {panel.render()}
      </div>
    </section>
  )
}
