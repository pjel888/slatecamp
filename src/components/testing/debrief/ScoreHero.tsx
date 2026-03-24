'use client'

import type { ScoreBand } from '@/types/testing'
import { SCORE_BAND_THRESHOLDS } from '@/types/testing'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreHeroProps {
  correct: number
  total: number
  percentage: number
  scoreBand: ScoreBand
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ScoreHero = ({ correct, total, percentage, scoreBand }: ScoreHeroProps) => {
  const band = SCORE_BAND_THRESHOLDS[scoreBand]

  return (
    <div className="bg-card rounded-lg border border-border p-8 text-center">
      {/* Section label */}
      <p
        className="text-[11px] font-medium uppercase tracking-widest"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Session Complete
      </p>

      {/* Score fraction */}
      <p
        className="mt-4 text-[48px] font-bold leading-none"
        style={{ color: 'var(--foreground)' }}
        aria-label={`${correct} out of ${total} correct`}
      >
        {correct} / {total}
      </p>

      {/* "correct" label */}
      <p
        className="mt-1 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        correct
      </p>

      {/* Percentage */}
      <p
        className="mt-3 text-xl font-semibold"
        style={{ color: band.color }}
      >
        {percentage}%
      </p>

      {/* Camp Voice copy */}
      <p
        className="mx-auto mt-3 max-w-[480px] text-[15px] italic"
        style={{ color: 'var(--text-secondary)' }}
      >
        {band.copy}
      </p>
    </div>
  )
}
