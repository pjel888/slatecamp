'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface QuestionDot {
  index: number
  status:
    | 'unanswered'
    | 'answered'
    | 'flagged'
    | 'current'
    | 'correct'
    | 'incorrect'
}

interface QuestionDotNavigatorProps {
  dots: QuestionDot[]
  onDotClick?: (index: number) => void
  className?: string
}

const dotStyles: Record<QuestionDot['status'], string> = {
  unanswered: 'bg-muted',
  answered: 'bg-primary',
  flagged: 'bg-camp-orange',
  current: 'bg-transparent ring-2 ring-primary',
  correct: 'bg-emerald',
  incorrect: 'bg-destructive',
}

const QuestionDotNavigator = ({
  dots,
  onDotClick,
  className,
}: QuestionDotNavigatorProps) => (
  <div
    className={cn('flex flex-wrap items-center gap-1.5', className)}
    role="navigation"
    aria-label="Question navigator"
  >
    {dots.map((dot) => {
      const isCurrent = dot.status === 'current'

      return (
        <button
          key={dot.index}
          type="button"
          aria-label={`Question ${dot.index + 1}, ${dot.status}`}
          aria-current={isCurrent ? 'step' : undefined}
          onClick={onDotClick ? () => onDotClick(dot.index) : undefined}
          className={cn(
            'rounded-full transition-colors duration-150',
            onDotClick ? 'cursor-pointer' : 'cursor-default',
            isCurrent ? 'w-3 h-3' : 'w-2.5 h-2.5',
            dotStyles[dot.status],
            onDotClick &&
              'hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          )}
        />
      )
    })}
  </div>
)

export { QuestionDotNavigator }
export type { QuestionDot, QuestionDotNavigatorProps }
