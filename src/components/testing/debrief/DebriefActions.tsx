'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ModeSource } from '@/types/testing'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DebriefActionsProps {
  wrongCount: number
  sessionSource: ModeSource
  onRetryWrong: () => void
  onNewSession: () => void
  onBackToHub: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DebriefActions = ({
  wrongCount,
  sessionSource: _sessionSource,
  onRetryWrong,
  onNewSession,
  onBackToHub,
}: DebriefActionsProps) => {
  const isPerfect = wrongCount === 0

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Primary action */}
      {isPerfect ? (
        <Button
          variant="default"
          size="lg"
          onClick={onNewSession}
          fullWidth
          className="sm:w-auto"
        >
          Start new session
        </Button>
      ) : (
        <Button
          variant="default"
          size="lg"
          onClick={onRetryWrong}
          fullWidth
          className="sm:w-auto"
        >
          Retry wrong answers ({wrongCount})
        </Button>
      )}

      {/* Secondary: new session (only shown when not perfect, since primary is already new session for perfect) */}
      {!isPerfect && (
        <Button
          variant="outline"
          size="lg"
          onClick={onNewSession}
          fullWidth
          className="sm:w-auto"
        >
          Start new session
        </Button>
      )}

      {/* Tertiary: back to hub */}
      <Button
        variant="ghost"
        size="lg"
        onClick={onBackToHub}
        fullWidth
        className="sm:w-auto"
      >
        Back to Review
      </Button>
    </div>
  )
}
