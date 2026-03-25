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
  const deltaClass = isPositive ? 'text-[#2D9F6F]' : 'text-[#4A5568]'
  const deltaText = isPositive ? `▲ +${delta}` : `▼ ${delta}`

  return (
    <div
      className="rounded-md border border-[#1B3FC4]/20 p-4"
      style={{ backgroundColor: 'rgba(27, 63, 196, 0.04)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8896A7] mb-2">
        Readiness Score
      </p>

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xl font-bold text-[#1A2332] tabular-nums">
          {before}
        </span>
        <span className="text-sm text-[#8896A7]">→</span>
        <span className="text-xl font-bold text-[#1A2332] tabular-nums">
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
        <p className="mt-2 text-xs text-[#8896A7] leading-relaxed">
          Adjustments help keep your Readiness Score accurate over time.
        </p>
      )}
    </div>
  )
}
