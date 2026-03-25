'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { ScorePoint } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  ScoreTrajectoryChart                                               */
/* ------------------------------------------------------------------ */

interface ScoreTrajectoryChartProps {
  data: ScorePoint[]
  variant: 'inline' | 'full'
}

export const ScoreTrajectoryChart = ({
  data,
  variant,
}: ScoreTrajectoryChartProps) => {
  const height = variant === 'inline' ? 200 : 300

  // Summary stats
  const { startScore, endScore, delta, dayCount } = useMemo(() => {
    if (data.length === 0) {
      return { startScore: 0, endScore: 0, delta: 0, dayCount: 0 }
    }
    const s = data[0].score
    const e = data[data.length - 1].score
    return {
      startScore: s,
      endScore: e,
      delta: e - s,
      dayCount: data.length,
    }
  }, [data])

  // Find the first point where score crosses 70
  const crossingPoint = useMemo(() => {
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1].score < 70 && data[i].score >= 70) {
        return data[i]
      }
    }
    return null
  }, [data])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-border bg-[#F8F7F5] p-6" style={{ height }}>
        <p className="text-sm text-text-secondary">
          Complete your first day to see your score trajectory.
        </p>
      </div>
    )
  }

  const deltaLabel = delta >= 0 ? `+${delta}` : `${delta}`
  const gainOrLoss = delta >= 0 ? 'gain' : 'change'

  return (
    <div className="flex flex-col gap-3">
      {/* Summary sentence */}
      <p className="text-lg font-semibold text-text-primary">
        Your Readiness Score {delta >= 0 ? 'rose' : 'moved'} from {startScore}%
        to {endScore}% &mdash; a {deltaLabel}-point {gainOrLoss} over{' '}
        {dayCount} days.
      </p>

      {/* Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 4, left: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B3FC4" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#1B3FC4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#D4DAE3"
              opacity={0.4}
              vertical={false}
            />

            {/* X axis: hide labels on inline/mobile variant */}
            <XAxis
              dataKey="day_number"
              tick={variant === 'full' ? { fontSize: 11, fill: '#8896A7' } : false}
              tickLine={false}
              axisLine={{ stroke: '#D4DAE3' }}
              tickFormatter={(v: number) => `Day ${v}`}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#8896A7' }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v: number) => `${v}%`}
            />

            {/* Passing threshold */}
            <ReferenceLine
              y={70}
              stroke="#E63329"
              strokeDasharray="4 3"
              label={{
                value: 'Passing threshold',
                position: 'insideTopRight',
                fill: '#E63329',
                fontSize: 11,
                fontFamily: 'var(--font-mono, monospace)',
              }}
            />

            {/* Area + line */}
            <Area
              type="monotone"
              dataKey="score"
              stroke="#1B3FC4"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#1B3FC4', stroke: '#fff', strokeWidth: 2 }}
            />

            {/* Green dot when score first crosses 70 */}
            {crossingPoint && (
              <ReferenceDot
                x={crossingPoint.day_number}
                y={crossingPoint.score}
                r={5}
                fill="#2D9F6F"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
