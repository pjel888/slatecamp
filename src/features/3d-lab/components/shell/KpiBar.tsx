'use client'

// KpiBar — shared KPI metrics bar for 3D Lab modules
// Config-driven: modules declare which metrics to show.
// Style: glass morphism, positioned above camera nav bar.

interface KpiMetric {
  id: string
  label: string
  value: string
  unit?: string
}

interface KpiBarProps {
  metrics: KpiMetric[]
}

export const KpiBar = ({ metrics }: KpiBarProps) => {
  if (metrics.length === 0) return null

  return (
    <div
      className="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 flex items-center gap-0.5 rounded-lg px-2 py-1 pointer-events-auto"
      style={{ backgroundColor: 'var(--viewport-overlay-bg)', backdropFilter: 'blur(8px)' }}
    >
      {metrics.map((metric, i) => (
        <span key={metric.id} className="contents">
          {i > 0 && (
            <div className="mx-1 h-4 w-px" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
          )}
          <div className="flex items-baseline gap-1 px-1">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--viewport-overlay-text)', opacity: 0.6 }}>
              {metric.label}
            </span>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--viewport-overlay-text)' }}>
              {metric.value}
            </span>
            {metric.unit && (
              <span className="font-mono text-[10px]" style={{ color: 'var(--viewport-overlay-text)', opacity: 0.5 }}>
                {metric.unit}
              </span>
            )}
          </div>
        </span>
      ))}
    </div>
  )
}
