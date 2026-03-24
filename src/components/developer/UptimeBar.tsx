/* ------------------------------------------------------------------ */
/*  UptimeBar                                                          */
/*  30-day uptime visualization as a row of thin colored bars.         */
/*  Each day is a 4px-wide, 20px-tall div color-coded by status.      */
/* ------------------------------------------------------------------ */

interface UptimeBarProps {
  days: Array<{ date: string; status: 'ok' | 'degraded' | 'outage' | 'none' }>
  uptimePercentage: string
}

const dayColorMap = {
  ok: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  outage: 'bg-red-500',
  none: 'bg-border',
} as const

const dayLabelMap = {
  ok: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  none: 'No data',
} as const

export const UptimeBar = ({ days, uptimePercentage }: UptimeBarProps) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-[1.5px]">
      {days.map((day) => (
        <div
          key={day.date}
          className={`w-1 h-5 rounded-[1px] ${dayColorMap[day.status]}`}
          title={`${day.date}: ${dayLabelMap[day.status]}`}
        />
      ))}
    </div>
    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] tabular-nums text-foreground font-medium whitespace-nowrap">
      {uptimePercentage}
    </span>
  </div>
)
