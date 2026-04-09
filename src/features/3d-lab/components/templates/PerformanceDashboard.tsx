'use client'

// src/features/3d-lab/components/templates/PerformanceDashboard.tsx
// Performance dashboard — 2×2 grid of fire, STC, cost, R-value metrics
// Lives in the RIGHT PANEL — NOT in the 3D viewport (Viewport Sanctity Rule)

import type { PerformanceMetrics } from '@/features/3d-lab/config/modules/10-materials/wall-types'
import { PerformanceMetricCell } from './PerformanceMetricCell'

interface PerformanceDashboardProps {
  performance: PerformanceMetrics
}

const getFireStatus = (mins: number): 'good' | 'warning' | 'danger' => {
  if (mins >= 120) return 'good'
  if (mins >= 60) return 'warning'
  return 'danger'
}

const getSTCStatus = (stc: number): 'good' | 'warning' | 'danger' => {
  if (stc >= 50) return 'good'
  if (stc >= 35) return 'warning'
  return 'danger'
}

const getCostStatus = (cost: number): 'good' | 'warning' | 'danger' => {
  if (cost <= 2000) return 'good'
  if (cost <= 3500) return 'warning'
  return 'danger'
}

const getRValueStatus = (r: number): 'good' | 'warning' | 'danger' => {
  if (r >= 3.0) return 'good'
  if (r >= 1.5) return 'warning'
  return 'danger'
}

export const PerformanceDashboard = ({ performance }: PerformanceDashboardProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Performance
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <PerformanceMetricCell
          icon={<span className="text-sm">🔥</span>}
          label="Fire"
          value={performance.fireRatingLabel}
          progressPercent={Math.min(100, (performance.fireRatingMinutes / 240) * 100)}
          status={getFireStatus(performance.fireRatingMinutes)}
          requirement={performance.fireRatingMinutes >= 120 ? 'RA 9514 ✓' : 'RA 9514 ⚠'}
        />
        <PerformanceMetricCell
          icon={<span className="text-sm">🔊</span>}
          label="Acoustic"
          value={`STC ${performance.stcRating}`}
          progressPercent={Math.min(100, (performance.stcRating / 60) * 100)}
          status={getSTCStatus(performance.stcRating)}
          requirement={performance.stcRating >= 50 ? 'IBC min ✓' : 'IBC min ⚠'}
        />
        <PerformanceMetricCell
          icon={<span className="text-sm">₱</span>}
          label="Cost/sqm"
          value={`₱${performance.costPerSqm.toLocaleString()}`}
          progressPercent={Math.min(100, (performance.costPerSqm / 5000) * 100)}
          status={getCostStatus(performance.costPerSqm)}
        />
        <PerformanceMetricCell
          icon={<span className="text-sm">🌡</span>}
          label="Thermal"
          value={`R-${performance.rValue.toFixed(1)}`}
          progressPercent={Math.min(100, (performance.rValue / 5) * 100)}
          status={getRValueStatus(performance.rValue)}
        />
      </div>
    </div>
  )
}
