import type { EndSessionResult } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReadinessImpactProps {
  before: EndSessionResult['readinessScoreBefore']
  after: EndSessionResult['readinessScoreAfter']
  delta: EndSessionResult['readinessScoreDelta']
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReadinessImpact = ({ before, after, delta }: ReadinessImpactProps) => {
  const isPositive = delta >= 0
  // Negative deltas shown in neutral charcoal — never red
  const deltaClass = isPositive ? 'text-success' : 'text-text-secondary'
  const deltaText = isPositive ? `▲ +${delta}` : `▼ ${delta}`

  return (
    <div
      className="rounded-md border border-primary/20 p-4"
      style={{ backgroundColor: 'rgba(27, 63, 196, 0.04)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Readiness Score
      </p>

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xl font-bold text-foreground tabular-nums">
          {before}
        </span>
        <span className="text-sm text-muted-foreground">→</span>
        <span className="text-xl font-bold text-foreground tabular-nums">
          {after}
        </span>
        <span
          className={`text-sm font-semibold tabular-nums ${deltaClass}`}
          aria-label={`Change: ${deltaText}`}
        >
          ({deltaText})
        </span>
      </div>

      {!isPositive && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Adjustments help keep your Readiness Score accurate over time.
        </p>
      )}
    </div>
  )
}
