'use client'

import { Lock } from '@phosphor-icons/react/dist/ssr'

/* ------------------------------------------------------------------ */
/*  TrailDayCard — Client Component (onClick)                          */
/* ------------------------------------------------------------------ */

interface TrailDayCardProps {
  dayNumber: number
  topicName: string
  estimatedMinutes: number
  status: 'available' | 'completed' | 'locked' | 'current'
  score?: number
  onStart?: () => void
}

const STATUS_BORDER: Record<TrailDayCardProps['status'], string> = {
  available: '',
  completed: 'border border-success/20 bg-success-50',
  locked: '',
  current: 'border border-warning/20 bg-warning-50',
}

export const TrailDayCard = ({
  dayNumber,
  topicName,
  estimatedMinutes,
  status,
  score,
  onStart,
}: TrailDayCardProps) => {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'
  const isCurrent = status === 'current'

  const ariaLabel = [
    `Day ${dayNumber}: ${topicName}.`,
    `Estimated ${estimatedMinutes} minutes.`,
    isLocked
      ? 'Locked.'
      : isCompleted
        ? `Completed${score !== undefined ? `. Score: ${score}%` : ''}.`
        : isCurrent
          ? 'Current day.'
          : 'Available.',
  ].join(' ')

  return (
    <div
      className={[
        'bg-card border border-border rounded-md p-4',
        'flex items-center gap-3',
        'transition-shadow duration-150 ease-out',
        STATUS_BORDER[status],
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-sm cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={isLocked ? true : undefined}
      onClick={isLocked ? undefined : onStart}
      onKeyDown={
        isLocked
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onStart?.()
              }
            }
      }
    >
      {/* Day badge */}
      <div
        className={[
          'flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-sm',
          'font-mono text-xs font-medium tabular-nums',
          isCompleted
            ? 'bg-success/10 text-success'
            : isCurrent
              ? 'bg-warning/10 text-warning'
              : 'bg-muted text-muted-foreground',
        ].join(' ')}
        aria-hidden="true"
      >
        {dayNumber}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            'font-sans font-medium text-sm truncate',
            isLocked ? 'text-muted-foreground' : 'text-foreground',
          ].join(' ')}
        >
          {topicName}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
          {estimatedMinutes} min
          {isCompleted && score !== undefined && ` · ${score}%`}
        </p>
      </div>

      {/* Right-side indicator */}
      {isLocked && (
        <Lock
          size={14}
          weight="regular"
          className="flex-shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export type { TrailDayCardProps }
