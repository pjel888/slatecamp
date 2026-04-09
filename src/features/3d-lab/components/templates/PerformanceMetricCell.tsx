'use client'

// src/features/3d-lab/components/templates/PerformanceMetricCell.tsx
// Single performance metric cell — icon, value, progress bar, status color

import type { ReactNode } from 'react'

type MetricStatus = 'good' | 'warning' | 'danger'

interface PerformanceMetricCellProps {
  icon: ReactNode
  label: string
  value: string
  progressPercent: number  // 0-100
  status: MetricStatus
  requirement?: string     // e.g., "RA 9514: 2hr ✓"
}

const statusColors: Record<MetricStatus, { bar: string; text: string; bg: string }> = {
  good: { bar: 'bg-success', text: 'text-success', bg: 'bg-success/10' },
  warning: { bar: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10' },
  danger: { bar: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' },
}

export const PerformanceMetricCell = ({
  icon,
  label,
  value,
  progressPercent,
  status,
  requirement,
}: PerformanceMetricCellProps) => {
  const colors = statusColors[status]

  return (
    <div className={`rounded-md border border-border p-3 ${colors.bg}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span className="font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-lg font-display font-semibold ${colors.text}`}>
        {value}
      </div>
      {/* Mini progress bar */}
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-200 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
      {requirement && (
        <div className="mt-1 text-[10px] text-muted-foreground">
          {requirement}
        </div>
      )}
    </div>
  )
}
