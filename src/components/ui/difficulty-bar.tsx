interface DifficultyBarProps {
  value: number | null // 0.0 - 1.0; null treated as 0
  size?: 'sm' | 'md'
}

/**
 * sm — horizontal progress bar (used in tables/lists)
 * md — 5-segment dot bar (used in question editors)
 */
export const DifficultyBar = ({ value, size = 'md' }: DifficultyBarProps) => {
  const clamped = Math.max(0, Math.min(1, value ?? 0))

  if (size === 'sm') {
    const pct = Math.round(clamped * 100)
    const barColor =
      clamped < 0.35
        ? 'bg-emerald-500'
        : clamped < 0.65
          ? 'bg-amber-500'
          : 'bg-red-500'

    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-150 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] tabular-nums text-muted-foreground">
          {clamped.toFixed(2)}
        </span>
      </div>
    )
  }

  // md: 5-segment dots
  const filled = Math.round(clamped * 5)

  return (
    <div className="flex items-center gap-0.5" title={`Difficulty: ${clamped.toFixed(2)}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 w-1.5 rounded-[1px] ${i < filled ? 'bg-[#D4951A]' : 'bg-[#D4DAE3]'}`}
        />
      ))}
    </div>
  )
}
