'use client'

import { X, BookmarkSimple, SquaresFour, Timer } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { QuizMode, QuizSessionConfig } from '@/types/quiz-config'
import { MODE_LABELS } from '@/lib/quiz/mode-presets'

interface QuizHeaderProps {
  config: QuizSessionConfig
  currentPosition: number
  totalQuestions: number
  isFlagged?: boolean
  elapsedSeconds?: number
  remainingSeconds?: number | null
  onExit: () => void
  onToggleFlag?: () => void
  onOpenPalette?: () => void
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

export const QuizHeader = ({
  config,
  currentPosition,
  totalQuestions,
  isFlagged = false,
  elapsedSeconds,
  remainingSeconds,
  onExit,
  onToggleFlag,
  onOpenPalette,
}: QuizHeaderProps) => {
  const progressPercent =
    totalQuestions > 0 ? Math.round((currentPosition / totalQuestions) * 100) : 0

  const showTimer =
    config.timer.visible &&
    config.timer.enabled &&
    (config.mode === 'storm' || config.mode === 'fullexam' || config.mode === 'extended')

  const displaySeconds =
    config.timer.mode === 'countdown' ? (remainingSeconds ?? 0) : (elapsedSeconds ?? 0)

  const isWarning =
    config.timer.mode === 'countdown' &&
    remainingSeconds !== null &&
    remainingSeconds !== undefined &&
    config.timer.totalSeconds !== null &&
    config.timer.totalSeconds > 0 &&
    remainingSeconds / config.timer.totalSeconds <= 0.1

  return (
    <header
      className="flex items-center gap-3 px-4 py-2.5 border-b border-[#D4DAE3] bg-white"
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
          className="flex-1 h-1.5 rounded-full bg-[#D4DAE3] overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-[#1B3FC4] transition-[width] duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="text-xs text-[#8896A7] tabular-nums shrink-0">
          {currentPosition}/{totalQuestions}
        </span>
      </div>

      {/* Mode badge */}
      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-[#1B3FC4] text-[11px] font-medium shrink-0">
        {MODE_LABELS[config.mode]}
      </span>

      {/* Timer */}
      {showTimer && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs tabular-nums font-medium shrink-0',
            isWarning ? 'text-[#D64545]' : 'text-[#4A5568]',
          )}
          aria-label={
            config.timer.mode === 'countdown'
              ? `Time remaining: ${formatTime(displaySeconds)}`
              : `Time elapsed: ${formatTime(displaySeconds)}`
          }
        >
          <Timer size={14} aria-hidden="true" />
          {formatTime(displaySeconds)}
        </div>
      )}

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
            className={isFlagged ? 'text-[#1B3FC4]' : undefined}
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
}
