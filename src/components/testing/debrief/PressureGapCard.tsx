import type { PressureGap } from '@/types/testing'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PressureGapCardProps {
  pressureGap: PressureGap
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGapColor = (gap: number): string => {
  if (gap > 10) return 'var(--destructive)'
  if (gap >= 5) return 'var(--warning)'
  return 'var(--success)'
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PressureGapCard = ({ pressureGap }: PressureGapCardProps) => {
  const { readinessScore, simulationScore, gap, interpretation } = pressureGap
  const gapColor = getGapColor(Math.abs(gap))
  const gapLabel = gap > 0
    ? `${gap}-point pressure gap`
    : gap < 0
      ? `${Math.abs(gap)}-point overperformance`
      : 'No pressure gap'

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      {/* Label */}
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--foreground)' }}
      >
        Pressure Gap Analysis
      </p>

      {/* Score comparison */}
      <p
        className="mt-3 text-base font-semibold"
        style={{ color: 'var(--foreground)' }}
      >
        Readiness Score: {readinessScore}% → Simulation: {simulationScore}%
      </p>

      {/* Gap badge */}
      <p
        className="mt-1 text-base font-semibold"
        style={{ color: gapColor }}
      >
        {gapLabel}
      </p>

      {/* Interpretation */}
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {interpretation}
      </p>
    </div>
  )
}
