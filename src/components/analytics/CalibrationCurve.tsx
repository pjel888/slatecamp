'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'

// ── Types ────────────────────────────────────────────────────────────────────

interface CalibrationPoint {
  label: string
  confidence: number
  accuracy: number
}

interface Props {
  confidentAccuracy: number
  guessingAccuracy: number
  partlyAccuracy: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CalibrationPoint }>
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      className="rounded-md bg-card p-2 text-xs"
      style={{
        borderRadius: '8px',
        border: `1px solid ${CHART_COLORS.tooltipBorder}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        fontSize: '12px',
      }}
    >
      <p className="font-bold mb-0.5" style={{ color: CHART_COLORS.foreground }}>
        {d.label}
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        Expected: {d.confidence}% / Actual: {d.accuracy}%
      </p>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export const CalibrationCurve = ({
  confidentAccuracy,
  guessingAccuracy,
  partlyAccuracy,
}: Props) => {
  const colors = useChartColors()
  // Build the three data points: Guessing (33%), Partly Sure (67%), Confident (100%)
  const data: CalibrationPoint[] = [
    {
      label: 'Guessing',
      confidence: 33,
      accuracy: Math.round(guessingAccuracy * 100),
    },
    {
      label: 'Partly Sure',
      confidence: 67,
      accuracy: Math.round(partlyAccuracy * 100),
    },
    {
      label: 'Confident',
      confidence: 100,
      accuracy: Math.round(confidentAccuracy * 100),
    },
  ]

  // Determine overconfident / underconfident regions for area fills
  // We compare each point's accuracy to its confidence (the diagonal)
  const hasOverconfident = data.some((d) => d.accuracy < d.confidence)
  const hasUnderconfident = data.some((d) => d.accuracy > d.confidence)

  return (
    <div className="h-[200px]">
      <div role="img" aria-label="Calibration curve chart comparing confidence levels to actual accuracy">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
        >
          <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.axisTickFill, fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.axisTickFill, fontSize: 11 }}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Perfect calibration diagonal — approximated with a reference line */}
          <ReferenceLine
            segment={[
              { x: 'Guessing', y: 33 },
              { x: 'Confident', y: 100 },
            ]}
            stroke={colors.border}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
          />

          {/* Overconfident region fill (accuracy < confidence) */}
          {hasOverconfident && (
            <ReferenceArea
              y1={0}
              y2={100}
              fill={colors.destructive}
              fillOpacity={0.04}
              ifOverflow="extendDomain"
            />
          )}

          {/* Underconfident region fill (accuracy > confidence) */}
          {hasUnderconfident && !hasOverconfident && (
            <ReferenceArea
              y1={0}
              y2={100}
              fill={colors.primary}
              fillOpacity={0.04}
              ifOverflow="extendDomain"
            />
          )}

          {/* Student's actual calibration line */}
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke={colors.primary}
            strokeWidth={2}
            dot={{
              r: 5,
              fill: colors.primary,
              stroke: '#fff',
              strokeWidth: 2,
            }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
