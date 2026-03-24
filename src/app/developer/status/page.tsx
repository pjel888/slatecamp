import Link from 'next/link'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { StatusBanner } from '@/components/developer/StatusBanner'
import { StatusKPICard } from '@/components/developer/StatusKPICard'
import { UptimeBar } from '@/components/developer/UptimeBar'
import { StatusBadge } from '@/components/developer/StatusBadge'
import { Card } from '@/components/ui/card'
import { getDatabaseStatus, getInfrastructureStatus } from '@/lib/mocks/status'
import type { ServiceStatus } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const generateUptimeData = (days: number = 30) =>
  Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0],
    status: Math.random() > 0.95 ? ('degraded' as const) : ('ok' as const),
  }))

const computeUptimePercentage = (days: Array<{ status: string }>) => {
  const ok = days.filter((d) => d.status === 'ok').length
  return `${((ok / days.length) * 100).toFixed(1)}%`
}

/* ------------------------------------------------------------------ */
/*  Service definitions                                                */
/* ------------------------------------------------------------------ */

const services: Array<{ key: string; label: string; href: string }> = [
  { key: 'database', label: 'Database', href: '/developer/status/database' },
  { key: 'api', label: 'API', href: '/developer/status/infrastructure' },
  { key: 'auth', label: 'Auth', href: '/developer/status/infrastructure' },
  { key: 'edge', label: 'Edge Functions', href: '/developer/status/infrastructure' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const StatusOverviewPage = async () => {
  const [db, infra] = await Promise.all([getDatabaseStatus(), getInfrastructureStatus()])

  /* Compute service statuses */
  const connectionRatio = db.connections.active / db.connections.max
  const dbStatus: ServiceStatus = connectionRatio > 0.8 ? 'degraded' : 'operational'

  const operationalEdge = infra.edgeFunctions.filter((f) => f.status === 'operational').length
  const totalEdge = infra.edgeFunctions.length
  const edgeStatus: ServiceStatus =
    infra.edgeFunctions.some((f) => f.status === 'outage')
      ? 'outage'
      : infra.edgeFunctions.some((f) => f.status === 'degraded')
        ? 'degraded'
        : 'operational'

  const apiStatus: ServiceStatus =
    infra.apiLatency.p50 > 200 ? 'degraded' : 'operational'

  const deployStatus: ServiceStatus =
    infra.deployment.status === 'failed' ? 'outage' : 'operational'

  const bannerStatuses = [
    { service: 'Database', status: dbStatus },
    { service: 'API', status: apiStatus },
    { service: 'Auth', status: 'operational' as ServiceStatus },
    { service: 'Edge Functions', status: edgeStatus },
  ]

  /* Generate uptime bars per service */
  const uptimeData = Object.fromEntries(
    services.map((s) => {
      const days = generateUptimeData()
      return [s.key, { days, percentage: computeUptimePercentage(days) }]
    }),
  )

  return (
    <div className="max-w-5xl space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
          System Health
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight">
          Status Dashboard
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mt-1">
          Real-time health metrics for the SlateCamp infrastructure.
        </p>
      </div>

      {/* Banner */}
      <StatusBanner statuses={bannerStatuses} />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatusKPICard
          label="Connections"
          value={`${db.connections.active}/${db.connections.max}`}
          status={dbStatus}
        />
        <StatusKPICard
          label="API p50 Latency"
          value={infra.apiLatency.p50}
          unit="ms"
          status={apiStatus}
        />
        <StatusKPICard
          label="Edge Functions"
          value={`${operationalEdge}/${totalEdge}`}
          status={edgeStatus}
        />
        <StatusKPICard
          label="Last Deploy"
          value={infra.deployment.status === 'success' ? 'Success' : 'Failed'}
          status={deployStatus}
        />
      </div>

      {/* Service Uptime Rows */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          30-Day Uptime
        </p>
        <Card size="sm" className="divide-y divide-border">
          {services.map((service) => {
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
