import { cn } from '@/lib/utils'
import type { TimeToValue } from '@/types/ceo'

interface TimeToValueFunnelProps {
  data: TimeToValue
}

interface FunnelStage {
  label: string
  value: string
  subValue?: string
  widthFraction: number
}

const formatDays = (days: number | null): string => {
  if (days === null) return '—'
  return `${days.toFixed(1)}d`
}

const formatRate = (rate: number): string => {
  if (rate === 0) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

const formatScore = (score: number | null): string => {
  if (score === null) return '—'
  return `${(score * 100).toFixed(0)}%`
}

export const TimeToValueFunnel = ({ data }: TimeToValueFunnelProps) => {
  const hasData =
    data.medianDaysToFirstSession !== null ||
    data.diagnosticCompletionRate > 0 ||
    data.freeToConversionRate > 0

  if (!hasData) {
    return (
      <div className="bg-card border border-border rounded-md p-6 text-center">
        <p className="text-[13px] text-muted-foreground">
          Conversion funnel data requires user activity history.
        </p>
      </div>
    )
  }

  const stages: FunnelStage[] = [
    {
      label: 'Signup → First Session',
      value: formatDays(data.medianDaysToFirstSession),
      subValue: 'median days',
      widthFraction: 1.0,
    },
    {
      label: 'Diagnostic Completion',
      value: formatRate(data.diagnosticCompletionRate),
      subValue: 'completed intake',
      widthFraction: 0.8,
    },
    {
      label: 'Free → Paid Conversion',
      value: formatRate(data.freeToConversionRate),
      subValue: data.medianDaysToConversion !== null
        ? `${formatDays(data.medianDaysToConversion)} to convert`
        : undefined,
      widthFraction: 0.6,
    },
    {
      label: 'Score at Conversion',
      value: formatScore(data.avgScoreAtConversion),
      subValue: 'avg readiness',
      widthFraction: 0.45,
    },
  ]

  return (
    <div className="bg-card border border-border rounded-md p-4">
      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <div key={stage.label} className="flex items-center gap-4">
            {/* Stage number */}
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-mono text-[11px] font-medium text-primary">
                {idx + 1}
              </span>
            </div>

            {/* Bar + label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-muted-foreground truncate pr-2">
                  {stage.label}
                </span>
                <div className="flex-shrink-0 text-right">
                  <span className="font-mono text-[14px] font-medium tabular-nums text-foreground">
                    {stage.value}
                  </span>
                  {stage.subValue && (
                    <span className="ml-1.5 text-[11px] text-muted-foreground">
                      {stage.subValue}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-3 w-full bg-muted/40 rounded-sm overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-sm transition-all duration-300 ease-out',
                    // Decreasing opacity cobalt
                    idx === 0 && 'bg-primary',
                    idx === 1 && 'bg-primary/75',
                    idx === 2 && 'bg-primary/55',
                    idx === 3 && 'bg-primary/40',
                  )}
                  style={{ width: `${stage.widthFraction * 100}%` }}
                />
              </div>
            </div>

            {/* Arrow connector (not on last) */}
            {idx < stages.length - 1 && (
              <div className="flex-shrink-0 text-muted-foreground/40 text-[11px] select-none">
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
