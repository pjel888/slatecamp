// ─── Types ────────────────────────────────────────────────────────────────────

interface ReadinessDeltaProps {
  before: number
  after: number
  delta: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReadinessDelta = ({ before, after, delta }: ReadinessDeltaProps) => {
  const isPositive = delta >= 0
  const deltaColor = isPositive ? 'var(--primary)' : 'var(--destructive)'
  const deltaLabel = isPositive ? `(+${delta})` : `(${delta})`

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'rgba(27, 63, 196, 0.05)' }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Label */}
        <p
          className="text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Readiness Score
        </p>

        {/* Value */}
        <p
          className="text-base font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          {before}% → {after}%
        </p>

        {/* Delta */}
        <p
          className="text-sm font-semibold"
          style={{ color: deltaColor }}
          aria-label={`Change: ${deltaLabel}`}
        >
          {deltaLabel}
        </p>
      </div>

      {/* Reassurance if negative */}
      {!isPositive && (
        <p
          className="mt-2 text-xs"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Score adjustments are normal — they help keep your Readiness Score accurate.
        </p>
      )}
    </div>
  )
}
