'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { cn } from '@/lib/utils'
import type { StudyActivityDay } from '@/lib/actions/analytics-data'

interface Props {
  data: StudyActivityDay[]
  monthLabel: string
  variant?: 'default' | 'compact'
}

const INTENSITY_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-surface-focused border border-border',
  1: 'bg-primary-50',
  2: 'bg-primary/30',
  3: 'bg-primary/60',
  4: 'bg-primary',
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const StudyStreakCalendar = ({ data, monthLabel, variant = 'default' }: Props) => {
  const isCompact = variant === 'compact'

  // Determine the day-of-week offset for the first day
  const firstDayOfWeek = data.length > 0
    ? new Date(`${data[0].date}T12:00:00`).getDay()
    : 0

  const activeDays = data.filter(d => d.count > 0).length
  const totalQuestions = data.reduce((acc, d) => acc + d.count, 0)

  return (
    <Card className="border-border bg-card rounded-md shadow-none p-2 relative gap-1 h-full">
      <RichInfoPopover
        title="Study Activity — This Month"
        description="Each cell is one calendar day. Darker blue means more questions answered that day."
      />
      <CardHeader className={isCompact ? 'p-1 pt-0' : 'p-2 pt-1'}>
        <div className="flex items-center justify-between">
          <CardTitle className={isCompact ? 'text-[10px] font-bold tracking-wider uppercase text-muted-foreground' : 'text-[11px] font-bold tracking-wider uppercase text-muted-foreground'}>
            Study Activity — {monthLabel}
          </CardTitle>
          {activeDays > 0 && !isCompact && (
            <span className="text-[11px] text-text-secondary">
              <span className="font-mono font-semibold text-foreground">{activeDays}</span> active days
              {' · '}
              <span className="font-mono font-semibold text-foreground">{totalQuestions}</span> questions
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className={isCompact ? 'p-1 pt-0' : 'p-2 pt-0'}>
        {data.length === 0 ? (
          <ChartEmptyState
            title="No activity data"
            description="Your study activity calendar will fill in as you practice."
            height="h-[280px]"
          />
        ) : (
          <div>
            {/* Day-of-week header */}
            <div className={isCompact ? 'mb-1 grid grid-cols-7 gap-0.5' : 'grid grid-cols-7 gap-1 mb-1'}>
              {DAY_LABELS.map(d => (
                <div key={d} className={isCompact ? 'text-center text-[8px] font-medium text-muted-foreground' : 'text-[10px] font-medium text-muted-foreground text-center'}>
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className={isCompact ? 'grid grid-cols-7 gap-0.5' : 'grid grid-cols-7 gap-1'}>
              {/* Offset cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`offset-${i}`} />
              ))}
              {/* Day cells */}
              {data.map((day, index) => {
                const dayNum = parseInt(day.date.split('-')[2], 10)
                return (
                  <div
                    key={`${day.date}-${index}`}
                    title={day.count > 0 ? `${dayNum}: ${day.count} questions` : `${dayNum}: no activity`}
                    className={cn(
                      'flex flex-col items-center justify-center cursor-default overflow-hidden',
                      isCompact ? 'h-[18px] rounded-[3px]' : 'aspect-square rounded-sm',
                      INTENSITY_CLASSES[day.intensity],
                    )}
                  >
                    <span className={cn(
                      isCompact ? 'text-[8px] font-medium select-none leading-none' : 'text-[9px] font-medium select-none leading-none',
                      day.intensity >= 3 ? 'text-white' : 'text-text-secondary',
                    )}>
                      {dayNum}
                    </span>
                    {day.count > 0 && !isCompact && (
                      <span className={cn(
                        'text-[8px] font-bold select-none leading-none tabular-nums',
                        day.intensity >= 3 ? 'text-white' : 'text-foreground',
                      )}>
                        {day.count}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div className={isCompact ? 'mt-1 flex items-center justify-end gap-1' : 'flex items-center gap-1.5 mt-2 justify-end'}>
              <span className={isCompact ? 'text-[9px] text-muted-foreground' : 'text-[10px] text-muted-foreground'}>Less</span>
              {([0, 1, 2, 3, 4] as const).map(i => (
                <div
                  key={i}
                  className={cn(isCompact ? 'h-2.5 w-2.5 rounded-[3px]' : 'w-3 h-3 rounded-sm', INTENSITY_CLASSES[i])}
                />
              ))}
              <span className={isCompact ? 'text-[9px] text-muted-foreground' : 'text-[10px] text-muted-foreground'}>More</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
