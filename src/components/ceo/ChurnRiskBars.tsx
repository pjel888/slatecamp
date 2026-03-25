import { cn } from '@/lib/utils'
import type { ChurnRiskSegment } from '@/types/ceo'

interface ChurnRiskBarsProps {
  data: ChurnRiskSegment[]
}

interface RiskConfig {
  label: string
  action: string
  barClass: string
}

const RISK_CONFIG: Record<ChurnRiskSegment['riskLevel'], RiskConfig> = {
  low: {
    label: 'Low',
    action: 'No action needed',
    barClass: 'bg-success',
  },
  medium: {
    label: 'Medium',
    action: 'Monitor closely',
    barClass: 'bg-warning',
  },
  high: {
    label: 'High',
    action: 'Trigger re-engagement',
    barClass: 'bg-accent',
  },
  critical: {
    label: 'Critical',
    action: 'Intervention required',
    barClass: 'bg-destructive/80',
  },
}

export const ChurnRiskBars = ({ data }: ChurnRiskBarsProps) => {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-md p-6 text-center">
        <p className="text-[13px] text-muted-foreground">
          Churn risk data will appear once students have activity history.
        </p>
      </div>
    )
  }

  const totalUsers = data.reduce((sum, seg) => sum + seg.userCount, 0) || 1

  return (
    <div className="bg-card border border-border rounded-md p-4 space-y-5">
      {data.map((seg) => {
        const config = RISK_CONFIG[seg.riskLevel]
        const widthPct = (seg.userCount / totalUsers) * 100

        return (
          <div key={seg.riskLevel}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-medium text-foreground w-16">
                  {config.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {config.action}
                </span>
              </div>
              <span className="font-mono text-[12px] tabular-nums text-foreground">
                {seg.userCount.toLocaleString()} users
              </span>
            </div>
            <div className="h-5 w-full bg-muted/40 rounded-sm overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-sm transition-all duration-300 ease-out',
                  config.barClass,
                )}
                style={{ width: `${Math.max(widthPct, seg.userCount > 0 ? 1 : 0)}%` }}
              />
            </div>
            <div className="flex gap-4 mt-1">
              <span className="text-[11px] text-muted-foreground">
                {seg.avgDaysSinceLastSession.toFixed(0)}d since last session
              </span>
              <span className="text-[11px] text-muted-foreground">
                avg readiness {(seg.avgReadinessScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
