import Link from 'next/link'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { SurfaceTruthNotice } from '@/components/developer/SurfaceTruthNotice'
import { StatusBanner } from '@/components/developer/StatusBanner'
import { StatusKPICard } from '@/components/developer/StatusKPICard'
import { UptimeBar } from '@/components/developer/UptimeBar'
import { SectionHeader } from '@/components/shared/section-header'
import { Card } from '@/components/ui/card'
import type { ServiceStatus } from '@/types/developer'
import { createClient } from '@/lib/supabase/server'
import { developerStatusServices, developerSurfaceTruthNotes } from '@/lib/developer/surface-registry'
import { getDeveloperServiceStatusSnapshot } from '@/lib/developer/status-snapshot'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const buildAvailabilitySnapshot = (
  status: ServiceStatus,
  days: number = 30,
) =>
  Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000)
      .toISOString()
      .split('T')[0],
    status:
      status === 'operational'
        ? ('ok' as const)
        : status === 'outage'
          ? ('outage' as const)
          : ('degraded' as const),
  }))

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const StatusOverviewPage = async () => {
  const serviceStatuses = await getDeveloperServiceStatusSnapshot()
  const { database: dbStatus, api: apiStatus, auth: authStatus, edge: edgeStatus } = serviceStatuses

  // Measure server-to-Supabase latency (not client-facing)
  const startPing = performance.now()
  const supabase = await createClient()
  await supabase.from('profiles').select('id').limit(1).catch(() => null)
  const latency = Math.round(performance.now() - startPing)

  const bannerStatuses = [
    { service: 'Database', status: dbStatus },
    { service: 'API', status: apiStatus },
    { service: 'Auth', status: authStatus },
    { service: 'Edge Functions', status: edgeStatus },
  ]
  const checkedAtLabel = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  /* Deterministic availability snapshot per service */
  const uptimeData = Object.fromEntries(
    developerStatusServices.map((service) => {
      const status =
        service.key === 'database'
          ? dbStatus
          : service.key === 'api'
            ? apiStatus
            : service.key === 'auth'
              ? authStatus
              : edgeStatus

      return [service.key, { days: buildAvailabilitySnapshot(status), percentage: 'live' }]
    }),
  )

  return (
    <div className="max-w-5xl space-y-8">
      <Breadcrumbs />

      <SectionHeader
        eyebrow="System Health"
        title="Status Dashboard"
        subtitle="Real-time health metrics for the SlateCamp infrastructure."
        level="page"
        className="max-w-xl"
      />

      <SurfaceTruthNotice
        badge={developerSurfaceTruthNotes['status-overview']!.badge}
        variant={developerSurfaceTruthNotes['status-overview']!.variant}
        description={developerSurfaceTruthNotes['status-overview']!.description}
      />

      {/* Banner */}
      <StatusBanner statuses={bannerStatuses} checkedAtLabel={checkedAtLabel} />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatusKPICard
          label="Database Status"
          value={dbStatus === 'operational' ? 'Healthy' : 'Issues'}
          status={dbStatus}
        />
        <StatusKPICard
          label="API Ping Latency"
          value={latency}
          unit="ms"
          status={latency > 500 ? 'degraded' : 'operational'}
        />
        <StatusKPICard
          label="Edge Functions"
          value={edgeStatus === 'operational' ? 'Healthy' : 'Issues'}
          status={edgeStatus}
        />
        <StatusKPICard
          label="Global API Gateway"
          value={apiStatus === 'operational' ? 'Healthy' : 'Issues'}
          status={apiStatus}
        />
      </div>

      {/* Service availability snapshot */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Current Availability Snapshot
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Historical uptime bars are not wired to a persisted status history yet. These bars repeat the current service state so the page stays deterministic instead of showing random synthetic history.
        </p>
        <Card size="sm" className="divide-y divide-border">
          {developerStatusServices.map((service) => {
            const data = uptimeData[service.key]
            return (
              <div
                key={service.key}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <Link
                  href={service.href}
                  className="text-[12px] font-medium text-foreground hover:text-primary transition-colors duration-150 min-w-[120px]"
                >
                  {service.label}
                </Link>
                <UptimeBar days={data.days} uptimePercentage={data.percentage} />
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}

export default StatusOverviewPage
