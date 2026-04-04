import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { StatusBadge } from '@/components/developer/StatusBadge'
import { Card } from '@/components/ui/card'
import { getInfrastructureStatus } from '@/lib/mocks/status'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const timeAgo = (timestamp: string): string => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

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

      {/* Header */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
          Infrastructure
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground">
          Infrastructure Status
        </h1>
      </div>

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
                  Last invoked {timeAgo(fn.lastInvocation)}
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
                    {timeAgo(infra.deployment.timestamp)}
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
