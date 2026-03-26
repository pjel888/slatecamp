'use client'

import { useCallback, useState } from 'react'
import { PostdictionPrompt } from '@/components/quiz-v2/PostdictionPrompt'

// ─── Props ──────────────────────────────────────────────────────────────────

interface ResultsWithPostdictionProps {
  sessionId: string
  actualScore: number
  hasPrediction: boolean
  children: React.ReactNode
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Client wrapper that gates the results dashboard behind a postdiction prompt.
 * If the user made a pre-session prediction, they are asked to estimate their
 * score before the actual results are revealed. Otherwise renders children immediately.
 */
const ResultsWithPostdiction = ({
  sessionId,
  actualScore,
  hasPrediction,
  children,
}: ResultsWithPostdictionProps) => {
  const [revealed, setRevealed] = useState(!hasPrediction)

  const handleReveal = useCallback(() => {
    setRevealed(true)
  }, [])

  if (!revealed) {
    return (
      <PostdictionPrompt
        sessionId={sessionId}
        actualScore={actualScore}
        onReveal={handleReveal}
      />
    )
  }

  return <>{children}</>
}

ResultsWithPostdiction.displayName = 'ResultsWithPostdiction'

export { ResultsWithPostdiction }
