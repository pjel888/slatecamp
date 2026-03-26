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
      className="rounded-md bg-white p-2 text-xs"
      style={{
        borderRadius: '8px',
        border: '1px solid #D4DAE3',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        fontSize: '12px',
      }}
    >
      <p className="font-bold mb-0.5" style={{ color: '#1A2332' }}>
        {d.label}
      </p>
      <p style={{ color: '#4A5568' }}>
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
        >
          <CartesianGrid stroke="#D4DAE3" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4A5568', fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4A5568', fontSize: 11 }}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Perfect calibration diagonal — approximated with a reference line */}
          <ReferenceLine
            segment={[
              { x: 'Guessing', y: 33 },
              { x: 'Confident', y: 100 },
            ]}
            stroke="#D4DAE3"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            ifOverflow="extendDomain"
          />

          {/* Overconfident region fill (accuracy < confidence) */}
          {hasOverconfident && (
            <ReferenceArea
              y1={0}
              y2={100}
              fill="#D64545"
              fillOpacity={0.04}
              ifOverflow="extendDomain"
            />
          )}

          {/* Underconfident region fill (accuracy > confidence) */}
          {hasUnderconfident && !hasOverconfident && (
            <ReferenceArea
              y1={0}
              y2={100}
              fill="#1B3FC4"
              fillOpacity={0.04}
              ifOverflow="extendDomain"
            />
          )}

          {/* Student's actual calibration line */}
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#1B3FC4"
            strokeWidth={2}
            dot={{
              r: 5,
              fill: '#1B3FC4',
              stroke: '#fff',
              strokeWidth: 2,
            }}
            activeDot={{ r: 6 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
