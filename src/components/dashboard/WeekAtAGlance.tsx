import { Card } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { WeekStat } from '@/types/dashboard'

interface WeekAtAGlanceProps {
  stats: WeekStat[]
}

export function WeekAtAGlance({ stats }: WeekAtAGlanceProps) {
  return (
    <Card className="border p-3 bg-white w-full" style={{ borderColor: '#D4DAE3' }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-sm font-semibold cursor-default" style={{ color: '#1A2332' }}>
              This week at a glance
            </h3>
          </TooltipTrigger>
          <TooltipContent side="top">
            A summary of this week&apos;s study activity compared to last week.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-[11px] mb-3" style={{ color: '#8896A7' }}>
        Compared to last week
      </p>

      <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#D4DAE3' }}>
        {stats.map((stat) => (
          <Tooltip key={stat.label}>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center px-2 py-1 cursor-default">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tabular-nums" style={{ color: '#1A2332' }}>
                    {stat.value}
                  </span>
                  {stat.delta != null && stat.delta !== 0 && (
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: stat.delta > 0 ? '#F5A623' : '#8896A7' }}
                    >
                      {stat.delta > 0 ? `+${stat.delta}` : stat.delta}
                    </span>
                  )}
                </div>
                <span
                  className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.1em] text-center mt-0.5"
                  style={{ color: '#8896A7' }}
                >
                  {stat.label}
                </span>
                <span className="text-[11px] mt-0.5" style={{ color: '#8896A7' }}>
                  {stat.subLabel}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">{stat.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </Card>
  )
}

export function WeekAtAGlanceSkeleton() {
  return (
    <Card className="border p-3" style={{ borderColor: '#D4DAE3' }}>
      <Skeleton className="h-4 w-40 mb-1" />
      <Skeleton className="h-3 w-32 mb-3" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </Card>
  )
}
