import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { StatusBadge } from '@/components/developer/StatusBadge'
import { Card } from '@/components/ui/card'
import { SectionHeader } from '@/components/shared/section-header'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { getInfrastructureStatus } from '@/lib/mocks/status'

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const InfrastructureStatusPage = async () => {
  const infra = await getInfrastructureStatus()

  const latencyMetrics = [
    { label: 'P50', value: infra.apiLatency.p50 },
    { label: 'P95', value: infra.apiLatency.p95 },
    { label: 'P99', value: infra.apiLatency.p99 },
  ]

  return (
    <div className="max-w-5xl space-y-8">
      <Breadcrumbs />

      <SectionHeader
        eyebrow="Infrastructure"
        title="Infrastructure Status"
        subtitle="API latency, edge-function health, and recent deployment telemetry for platform operations."
        level="page"
        className="max-w-xl"
      />

      {/* API Latency */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          API Latency
        </p>
        <div className="grid grid-cols-3 gap-3">
          {latencyMetrics.map((metric) => (
            <Card key={metric.label} size="sm" className="flex flex-col gap-1">
              <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {metric.label}
              </span>
              <span className="font-[family-name:var(--font-dm-mono)] text-2xl font-semibold tabular-nums text-foreground">
                {metric.value}
                <span className="text-sm text-muted-foreground ml-1">ms</span>
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Edge Functions */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Edge Functions
        </p>
        <Card size="sm" className="divide-y divide-border">
          {infra.edgeFunctions.map((fn) => (
            <div
              key={fn.name}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-[family-name:var(--font-dm-mono)] text-foreground">
                  {fn.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Last invoked {formatRelativeTime(fn.lastInvocation)}
                </span>
              </div>
              <StatusBadge status={fn.status} size="sm" />
            </div>
          ))}
        </Card>
      </div>

      {/* Last Deployment */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Last Deployment
        </p>
        <Card size="sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <StatusBadge
                status={infra.deployment.status === 'success' ? 'operational' : 'outage'}
                size="md"
              />
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  Commit{' '}
                  <span className="font-[family-name:var(--font-dm-mono)] text-primary font-medium">
                    {infra.deployment.commit}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  Duration{' '}
                  <span className="font-[family-name:var(--font-dm-mono)] font-medium text-foreground">
                    {infra.deployment.duration}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-[family-name:var(--font-dm-mono)]">
                    {formatRelativeTime(infra.deployment.timestamp)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default InfrastructureStatusPage
