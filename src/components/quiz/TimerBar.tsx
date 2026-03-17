'use client'

import { cn } from '@/lib/utils'

interface TimerBarProps {
  totalSeconds: number
  remainingSeconds: number
  isAheadOfPace: boolean
}

export function TimerBar({ totalSeconds, remainingSeconds, isAheadOfPace }: TimerBarProps) {
  const pct = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
  const isFinal = pct <= 20
  const mins = Math.floor(remainingSeconds / 60)
  const secs = remainingSeconds % 60
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <div className="flex items-center gap-3 bg-zinc-100 border border-zinc-200 rounded-sm px-3 py-1.5">
      {/* Depletion bar */}
      <div className="w-24 h-1.5 bg-zinc-200 rounded-sm overflow-hidden" role="timer" aria-label={`${timeLabel} remaining`}>
        <div
          className={cn(
            'h-full rounded-sm transition-all duration-1000 ease-linear',
            isFinal ? 'bg-amber-500' : 'bg-blue-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Time label */}
      <span
        className={cn(
          'font-mono font-semibold text-[12px] tabular-nums w-10',
          isFinal ? 'text-amber-600' : 'text-zinc-500',
        )}
      >
        {timeLabel}
      </span>

      {/* Pace indicator — subtle, not alarming */}
      <span
        className={cn(
          'text-[9px] font-black uppercase tracking-wider hidden sm:block',
          isAheadOfPace ? 'text-green-600' : 'text-zinc-400',
        )}
      >
        {isAheadOfPace ? 'On pace' : 'Pace'}
      </span>
    </div>
  )
}
