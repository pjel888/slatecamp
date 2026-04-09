'use client'

// src/features/3d-lab/components/templates/ComparisonDashboard.tsx
// Side-by-side wall type comparison with decision matrix
// Lives in RIGHT PANEL — NOT in 3D viewport

import type { PerformanceMetrics } from '@/features/3d-lab/config/modules/10-materials/wall-types'

interface ComparisonDashboardProps {
  typeALabel: string
  typeBLabel: string
  perfA: PerformanceMetrics
  perfB: PerformanceMetrics
}

interface MetricRow {
  icon: string
  label: string
  valueA: string
  valueB: string
  winnerIsA: boolean | null  // null = tie
}

const getWinner = (a: number, b: number, lowerIsBetter: boolean): boolean | null => {
  if (a === b) return null
  return lowerIsBetter ? a < b : a > b
}

export const ComparisonDashboard = ({ typeALabel, typeBLabel, perfA, perfB }: ComparisonDashboardProps) => {
  const metrics: MetricRow[] = [
    {
      icon: '🔥',
      label: 'Fire',
      valueA: perfA.fireRatingLabel,
      valueB: perfB.fireRatingLabel,
      winnerIsA: getWinner(perfA.fireRatingMinutes, perfB.fireRatingMinutes, false),
    },
    {
      icon: '🔊',
      label: 'Acoustic',
      valueA: `STC ${perfA.stcRating}`,
      valueB: `STC ${perfB.stcRating}`,
      winnerIsA: getWinner(perfA.stcRating, perfB.stcRating, false),
    },
    {
      icon: '₱',
      label: 'Cost/sqm',
      valueA: `₱${perfA.costPerSqm.toLocaleString()}`,
      valueB: `₱${perfB.costPerSqm.toLocaleString()}`,
      winnerIsA: getWinner(perfA.costPerSqm, perfB.costPerSqm, true),
    },
    {
      icon: '🌡',
      label: 'Thermal',
      valueA: `R-${perfA.rValue.toFixed(1)}`,
      valueB: `R-${perfB.rValue.toFixed(1)}`,
      winnerIsA: getWinner(perfA.rValue, perfB.rValue, false),
    },
  ]

  const winsA = metrics.filter((m) => m.winnerIsA === true).length
  const winsB = metrics.filter((m) => m.winnerIsA === false).length

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Compare
      </h3>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-muted/30 px-2 py-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">Metric</span>
          <span className="text-[10px] font-semibold text-foreground text-center">{typeALabel}</span>
          <span className="text-[10px] font-semibold text-foreground text-center">{typeBLabel}</span>
        </div>

        {/* Metric rows */}
        {metrics.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_1fr_1fr] border-b border-border/50 px-2 py-1.5">
            <span className="text-xs text-muted-foreground">
              {row.icon} {row.label}
            </span>
            <span className={`text-xs text-center font-mono ${row.winnerIsA === true ? 'text-success font-semibold' : row.winnerIsA === false ? 'text-warning' : 'text-foreground'}`}>
              {row.valueA} {row.winnerIsA === true ? '✓' : row.winnerIsA === false ? '⚠' : ''}
            </span>
            <span className={`text-xs text-center font-mono ${row.winnerIsA === false ? 'text-success font-semibold' : row.winnerIsA === true ? 'text-warning' : 'text-foreground'}`}>
              {row.valueB} {row.winnerIsA === false ? '✓' : row.winnerIsA === true ? '⚠' : ''}
            </span>
          </div>
        ))}

        {/* Summary row */}
        <div className="grid grid-cols-[1fr_1fr_1fr] px-2 py-1.5 bg-muted/20">
          <span className="text-[10px] font-semibold text-muted-foreground">Winner</span>
          <span className="text-[10px] font-semibold text-center text-foreground">{winsA} / {metrics.length}</span>
          <span className="text-[10px] font-semibold text-center text-foreground">{winsB} / {metrics.length}</span>
        </div>
      </div>
    </div>
  )
}
