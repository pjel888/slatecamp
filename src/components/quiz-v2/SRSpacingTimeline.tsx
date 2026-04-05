'use client'

import { cn } from '@/lib/utils'

const INTERVALS = [
  { days: 1, label: '1d' },
  { days: 3, label: '3d' },
  { days: 7, label: '7d' },
  { days: 14, label: '14d' },
] as const

interface SRSpacingTimelineProps {
  /** Current spacing level (1-based). 0 = not yet in spacing. 5 = all complete (durable). */
  currentLevel: number
  className?: string
}

export const SRSpacingTimeline = ({
  currentLevel,
  className,
}: SRSpacingTimelineProps) => {
  const isDurable = currentLevel > INTERVALS.length

  return (
    <div
      className={cn('flex items-center gap-0', className)}
      role="img"
      aria-label={
        isDurable
          ? 'All spacing intervals complete — knowledge is durable'
          : `Spacing progress: level ${currentLevel} of ${INTERVALS.length}`
      }
    >
      {INTERVALS.map((interval, idx) => {
        const level = idx + 1
        const isCompleted = level < currentLevel
        const isCurrent = level === currentLevel
        const isUpcoming = level > currentLevel

        return (
          <div key={interval.days} className="flex items-center">
            {/* Connector line (not before first dot) */}
            {idx > 0 && (
              <div
                className={cn(
                  'h-[2px] w-6',
                  isCompleted || isCurrent
                    ? 'bg-success'
                    : 'bg-border',
                )}
              />
            )}

            {/* Dot + label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors duration-150',
                  isCompleted && 'bg-success text-white',
                  isCurrent && 'bg-primary text-white',
                  isUpcoming && 'border border-border bg-white text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5L4.5 7.5L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </div>
              <span
                className={cn(
                  'mt-1 text-[10px] tabular-nums',
                  isCompleted && 'font-medium text-success',
                  isCurrent && 'font-medium text-primary',
                  isUpcoming && 'text-muted-foreground',
                )}
              >
                {interval.label}
              </span>
            </div>
          </div>
        )
      })}

      {/* Durable endpoint */}
      <div className="flex items-center">
        <div
          className={cn(
            'h-[2px] w-6',
            isDurable ? 'bg-success' : 'bg-border',
          )}
        />
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors duration-150',
              isDurable
                ? 'bg-success text-white'
                : 'border border-border bg-white text-muted-foreground',
            )}
          >
            {isDurable ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5L4.5 7.5L8 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </div>
          <span
            className={cn(
              'mt-1 text-[10px]',
              isDurable ? 'font-medium text-success' : 'text-muted-foreground',
            )}
          >
            Durable
          </span>
        </div>
      </div>
    </div>
  )
}
