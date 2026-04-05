'use client'

import { memo } from 'react'
import { X, BookmarkSimple, SquaresFour, Timer, Fire } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { QuizSessionConfig, TimerMode } from '@/types/quiz-config'
import { MODE_LABELS } from '@/lib/quiz/mode-presets'
import { useQuizStore } from '@/stores/useQuizStore'

interface QuizHeaderProps {
  config: QuizSessionConfig
  currentPosition: number
  totalQuestions: number
  isFlagged?: boolean
  onExit: () => void
  onToggleFlag?: () => void
  onOpenPalette?: () => void
  /** Optional pressure-aware timer to replace the default timer display */
  timerSlot?: React.ReactNode
}

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const TIMER_COLOR_CLASSES: Record<string, string> = {
  normal: 'text-text-secondary',
  warning: 'text-warning',
  critical: 'text-destructive',
}

/** Standalone timer component to isolate 1Hz re-renders from the Header */
const DefaultTimer = ({ mode }: { mode: TimerMode }) => {
  const elapsedMs = useQuizStore((s) => s.timer.elapsedMs)
  const limitMs = useQuizStore((s) => s.timer.limitMs)
  const colorState = useQuizStore((s) => s.timer.colorState)

  if (mode === 'hidden') return null

  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const remainingSeconds =
    limitMs !== null ? Math.max(0, Math.floor((limitMs - elapsedMs) / 1000)) : 0

  const displaySeconds = mode === 'countdown' ? remainingSeconds : elapsedSeconds

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs tabular-nums font-medium shrink-0',
        TIMER_COLOR_CLASSES[colorState],
      )}
      aria-label={
        mode === 'countdown'
          ? `Time remaining: ${formatTime(displaySeconds)}`
          : `Time elapsed: ${formatTime(displaySeconds)}`
      }
    >
      <Timer size={14} aria-hidden="true" />
      {formatTime(displaySeconds)}
    </div>
  )
}

export const QuizHeader = memo(({
  config,
  currentPosition,
  totalQuestions,
  isFlagged = false,
  onExit,
  onToggleFlag,
  onOpenPalette,
  timerSlot,
}: QuizHeaderProps) => {
  const streakCount = useQuizStore((s) => s.streakCount)
  const streakBroken = useQuizStore((s) => s.streakBroken)
  const clearStreakBroken = useQuizStore((s) => s.clearStreakBroken)

  const progressPercent =
    totalQuestions > 0 ? Math.round((currentPosition / totalQuestions) * 100) : 0

  const halfwayReached = currentPosition === Math.ceil(totalQuestions / 2)

  const showTimer =
    config.timer.visible &&
    config.timer.enabled &&
    (config.mode === 'storm' || config.mode === 'fullexam' || config.mode === 'extended')

  return (
    <header
      className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-white"
      aria-label="Quiz header"
    >
      {/* Exit */}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Exit quiz"
        onClick={onExit}
        className="shrink-0"
      >
        <X size={16} aria-hidden="true" />
      </Button>

      {/* Progress bar + fraction */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuenow={currentPosition}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          className="flex-1 h-1.5 rounded-full bg-border overflow-hidden"
        >
          <div
            className={cn(
              'h-full rounded-full bg-primary transition-[width] duration-300 ease-out',
              halfwayReached && 'animate-pulse-once',
            )}
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {currentPosition}/{totalQuestions}
        </span>
      </div>

      {/* Mode badge */}
      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-sm bg-primary-50 text-primary text-[11px] font-medium shrink-0">
        {MODE_LABELS[config.mode]}
      </span>

      {/* Streak counter */}
      {streakCount > 0 && (
        <div
          className={cn(
            'flex items-center gap-0.5 text-xs font-semibold tabular-nums shrink-0',
            streakBroken && 'animate-shake',
          )}
          aria-label={`Current streak: ${streakCount} correct answers`}
          onAnimationEnd={streakBroken ? clearStreakBroken : undefined}
        >
          <Fire size={14} weight="fill" className="text-camp-orange" aria-hidden="true" />
          <span className="text-camp-orange">{streakCount}</span>
        </div>
      )}

      {/* Timer — pressure-aware slot takes priority, then default */}
      {timerSlot ? (
        timerSlot
      ) : showTimer ? (
        <DefaultTimer mode={config.timer.mode} />
      ) : null}

      {/* Bookmark */}
      {config.navigation.bookmarkEnabled && onToggleFlag && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isFlagged ? 'Remove bookmark' : 'Bookmark question'}
          aria-pressed={isFlagged}
          onClick={onToggleFlag}
          className="shrink-0"
        >
          <BookmarkSimple
            size={16}
            weight={isFlagged ? 'fill' : 'regular'}
            className={isFlagged ? 'text-primary' : undefined}
            aria-hidden="true"
          />
        </Button>
      )}

      {/* Question palette trigger */}
      {config.navigation.questionPalette && onOpenPalette && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open question palette"
          onClick={onOpenPalette}
          className="shrink-0"
        >
          <SquaresFour size={16} aria-hidden="true" />
        </Button>
      )}
    </header>
  )
})

QuizHeader.displayName = 'QuizHeader'
