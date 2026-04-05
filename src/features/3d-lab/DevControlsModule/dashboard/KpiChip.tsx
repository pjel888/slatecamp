'use client'

// ─── KPI Chip ──────────────────────────────────────────────────────────────
// Compact metric display for the KPI bar.

interface KpiChipProps {
  label: string
  value: string
  unit: string
  isViolating?: boolean
}

export function KpiChip({ label, value, unit, isViolating = false }: KpiChipProps) {
  return (
    <div className="flex min-w-[56px] flex-col items-center px-2 py-1">
      <span className="font-mono text-[8px] uppercase tracking-widest text-white/50">
        {label}
      </span>
      <span
        className={`font-mono text-base font-bold tabular-nums leading-tight ${
          isViolating ? 'text-red-400' : 'text-white'
        }`}
      >
        {value}
        {unit && <span className="ml-0.5 text-[10px] font-normal text-white/50">{unit}</span>}
      </span>
    </div>
  )
}
