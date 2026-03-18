'use client'

import { cn } from '@/lib/utils'

interface TimerBarProps {
  totalSeconds: number
  remainingSeconds: number
  isAheadOfPace: boolean
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

export function TimerBar({
  totalSeconds,
  remainingSeconds,
  isAheadOfPace,
  isMinimized = false,
  onToggleMinimize,
}: TimerBarProps) {
  const pct = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
  const isFinal = pct <= 20
  const isCritical = pct <= 10
  const mins = Math.floor(remainingSeconds / 60)
  const secs = remainingSeconds % 60
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <div
      className="flex items-center gap-3 bg-[#F5F7FA] border border-border rounded-sm px-3 py-1.5 cursor-pointer"
      onClick={onToggleMinimize}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleMinimize?.() }}
      aria-label={isMinimized ? `${timeLabel} remaining — tap to show timer` : `${timeLabel} remaining — tap to minimize timer`}
    >
      {/* Depletion bar — always visible */}
      <div
        className="w-24 h-1.5 bg-[#EEF2FC] rounded-sm overflow-hidden"
        role="timer"
        aria-label={`${timeLabel} remaining`}
      >
        <div
          className={cn(
            'h-full rounded-sm transition-all duration-300 ease-linear',
            isFinal ? 'bg-amber-500' : 'bg-[#1B3FC4]',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Time label — hideable */}
      {!isMinimized && (
        <span
          className={cn(
            'font-medium text-[14px] tabular-nums w-10 transition-colors',
            isCritical && 'animate-pulse',
            isFinal ? 'text-[#D4951A]' : 'text-[#4A5568]',
          )}
        >
          {timeLabel}
        </span>
      )}

      {/* Pace indicator — subtle, not alarming */}
      {!isMinimized && (
        <span
          className={cn(
            'text-[11px] font-black uppercase tracking-wider hidden sm:block',
            isAheadOfPace ? 'text-[#2D9F6F]' : 'text-[#8896A7]',
          )}
        >
          {isAheadOfPace ? 'On pace' : 'Pace'}
        </span>
      )}
    </div>
  )
}
