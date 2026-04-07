'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { cn } from '@/lib/utils'
import type { StudyActivityDay } from '@/lib/actions/analytics-data'

interface Props {
  data: StudyActivityDay[]
  monthLabel: string
}

const INTENSITY_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-surface-focused border border-border',
  1: 'bg-primary-50',
  2: 'bg-primary/30',
  3: 'bg-primary/60',
  4: 'bg-primary',
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const StudyStreakCalendar = ({ data, monthLabel }: Props) => {
  // Determine the day-of-week offset for the first day
  const firstDayOfWeek = data.length > 0
    ? new Date(`${data[0].date}T12:00:00`).getDay()
    : 0

  const activeDays = data.filter(d => d.count > 0).length
  const totalQuestions = data.reduce((acc, d) => acc + d.count, 0)

  return (
    <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
      <RichInfoPopover
        title="Study Activity — This Month"
        description="Each cell is one calendar day. Darker blue means more questions answered that day."
      />
      <CardHeader className="p-2 pt-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Study Activity — {monthLabel}
          </CardTitle>
          {activeDays > 0 && (
            <span className="text-[11px] text-text-secondary">
              <span className="font-mono font-semibold text-foreground">{activeDays}</span> active days
              {' · '}
              <span className="font-mono font-semibold text-foreground">{totalQuestions}</span> questions
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length === 0 ? (
          <div className="h-[140px] flex items-center justify-center">
            <p className="text-xs text-center leading-snug max-w-[200px] text-muted-foreground">
              Complete a few study sessions to see your analytics here.
            </p>
          </div>
        ) : (
          <div>
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-[10px] font-medium text-muted-foreground text-center">
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Offset cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`offset-${i}`} />
              ))}
              {/* Day cells */}
              {data.map((day) => {
                const dayNum = parseInt(day.date.split('-')[2], 10)
                return (
                  <div
                    key={day.date}
                    title={day.count > 0 ? `${dayNum}: ${day.count} questions` : `${dayNum}: no activity`}
                    className={cn(
                      'aspect-square rounded-sm flex items-center justify-center cursor-default',
                      INTENSITY_CLASSES[day.intensity],
                    )}
                  >
                    <span className={cn(
                      'text-[9px] font-medium select-none',
                      day.intensity >= 3 ? 'text-white' : 'text-text-secondary',
                    )}>
                      {dayNum}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-2 justify-end">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {([0, 1, 2, 3, 4] as const).map(i => (
                <div
                  key={i}
                  className={cn('w-3 h-3 rounded-sm', INTENSITY_CLASSES[i])}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
