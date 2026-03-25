import * as React from 'react'
import { cn } from '@/lib/utils'

interface QuickStatsRowProps {
  daysToExam?: number
  sessionsCompleted: number
  greenTopics: number
  totalTopics: number
  className?: string
}

const QuickStatsRow = ({
  daysToExam,
  sessionsCompleted,
  greenTopics,
  totalTopics,
  className,
}: QuickStatsRowProps) => {
  const chipClass =
    'bg-muted rounded-full px-3 py-1 text-xs font-mono text-muted-foreground'

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {daysToExam !== undefined && (
        <span className={chipClass}>{daysToExam} days</span>
      )}
      <span className={chipClass}>{sessionsCompleted} sessions</span>
      <span className={chipClass}>
        {greenTopics}/{totalTopics} topics
      </span>
    </div>
  )
}

export { QuickStatsRow }
export type { QuickStatsRowProps }
