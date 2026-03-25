import { cn } from '@/lib/utils'
import { formatPeso } from '@/types/ceo'

interface RunwayGaugeProps {
  runwayMonths: number | null
  cashOnHand: number | null
}

const getRunwayConfig = (months: number) => {
  if (months >= 999) {
    return {
      label: 'Profitable',
      sublabel: 'Revenue exceeds burn',
      fillClass: 'bg-success',
      bgClass: 'bg-success/10',
      textClass: 'text-success',
      borderClass: 'border-success/20',
      fillPercent: 100,
    }
  }
  if (months >= 12) {
    return {
      label: 'Secure',
      sublabel: `${Math.round(months)} months of runway`,
      fillClass: 'bg-success',
      bgClass: 'bg-success/10',
      textClass: 'text-success',
      borderClass: 'border-success/20',
      fillPercent: Math.min(100, (months / 24) * 100),
    }
  }
  if (months >= 6) {
    return {
      label: 'Monitor',
      sublabel: `${Math.round(months)} months of runway`,
      fillClass: 'bg-warning',
      bgClass: 'bg-warning/10',
      textClass: 'text-warning',
      borderClass: 'border-warning/20',
      fillPercent: (months / 24) * 100,
    }
  }
  return {
    label: 'Action Needed',
    sublabel: `${Math.round(months)} months of runway`,
    fillClass: 'bg-accent',
    bgClass: 'bg-accent/10',
    textClass: 'text-accent',
    borderClass: 'border-accent/20',
    fillPercent: (months / 24) * 100,
  }
}

const getProjectedEndDate = (months: number): string => {
  if (months >= 999) return 'Ongoing — profitable'
  const end = new Date()
  end.setMonth(end.getMonth() + Math.round(months))
  return end.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
}

export const RunwayGauge = ({ runwayMonths, cashOnHand }: RunwayGaugeProps) => {
  if (runwayMonths === null || cashOnHand === null) {
    return (
      <div className="bg-card border border-border rounded-md p-4 flex flex-col gap-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Cash Runway
        </p>
        <div className="flex-1 flex items-center justify-center py-6">
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            Add a cash balance entry to calculate runway
          </p>
        </div>
      </div>
    )
  }

  const config = getRunwayConfig(runwayMonths)
  const displayMonths = runwayMonths >= 999 ? '∞' : String(Math.round(runwayMonths))
  const projectedEnd = getProjectedEndDate(runwayMonths)

  return (
    <div
      className={cn(
        'bg-card border rounded-md p-4 flex flex-col gap-3',
        config.borderClass,
      )}
    >
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        Cash Runway
      </p>

      <div className="flex items-end gap-3">
        <p
          className={cn(
            'font-mono font-medium tabular-nums text-4xl leading-none',
            config.textClass,
          )}
        >
          {displayMonths}
        </p>
        <p className="text-sm text-muted-foreground pb-1">months</p>
      </div>

      {/* Gauge bar */}
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', config.fillClass)}
          style={{ width: `${Math.max(2, config.fillPercent)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            'font-mono text-[11px] font-medium uppercase tracking-widest',
            config.textClass,
          )}
        >
          {config.label}
        </span>
        <span className="text-[12px] text-muted-foreground">
          {cashOnHand !== null ? formatPeso(cashOnHand) + ' on hand' : ''}
        </span>
      </div>

      <p className="text-[12px] text-muted-foreground">
        At current burn:{' '}
        <span className="font-medium text-foreground">{projectedEnd}</span>
      </p>
    </div>
  )
}
