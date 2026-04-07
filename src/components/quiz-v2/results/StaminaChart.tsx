'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { StaminaBlock } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaminaChartProps {
  blocks: StaminaBlock[]
}

// ─── Fatigue annotation ───────────────────────────────────────────────────────

const getFatigueAnnotation = (blocks: StaminaBlock[]): string | null => {
  if (blocks.length < 3) return null
  const third = Math.ceil(blocks.length / 3)
  const firstThird = blocks.slice(0, third)
  const lastThird = blocks.slice(-third)
  const firstAvg = firstThird.reduce((s, b) => s + b.accuracy, 0) / firstThird.length
  const lastAvg = lastThird.reduce((s, b) => s + b.accuracy, 0) / lastThird.length
  const drop = firstAvg - lastAvg
  if (drop >= 15)
    return `Your accuracy dropped ${Math.round(drop)}% in the final third — a common sign of mental fatigue. Shorter sessions can help maintain consistent performance.`
  if (drop >= 8)
    return 'Slight accuracy dip in later blocks — this is normal. Regular practice builds stamina over time.'
  return 'Solid consistency throughout — your accuracy held up across the session.'
}

// ─── SVG line path ────────────────────────────────────────────────────────────

const buildPath = (blocks: StaminaBlock[], width: number, height: number): string => {
  if (blocks.length < 2) return ''
  const points = blocks.map((b, i) => {
    const x = (i / (blocks.length - 1)) * width
    const y = height - (b.accuracy / 100) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M ${points.join(' L ')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

const CHART_W = 600
const CHART_H = 140

export const StaminaChart = ({ blocks }: StaminaChartProps) => {
  const annotation = useMemo(() => getFatigueAnnotation(blocks), [blocks])
  const path = useMemo(() => buildPath(blocks, CHART_W, CHART_H), [blocks])
  const maxAccuracy = Math.max(...blocks.map((b) => b.accuracy))
  const minAccuracy = Math.min(...blocks.map((b) => b.accuracy))

  if (blocks.length < 2) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        Stamina
      </p>

      <div className="bg-white rounded-md border border-border p-4">
        {/* SVG chart */}
        <div className="w-full overflow-hidden" aria-hidden="true">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: 120 }}
          >
            {/* 70% reference line */}
            <line
              x1={0}
              y1={CHART_H - 70 * (CHART_H / 100)}
              x2={CHART_W}
              y2={CHART_H - 70 * (CHART_H / 100)}
              stroke="#D4DAE3"
              strokeDasharray="6 4"
              strokeWidth={1}
            />
            {/* Line path */}
            <path
              d={path}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Data points */}
            {blocks.map((b, i) => {
              const x = (i / (blocks.length - 1)) * CHART_W
              const y = CHART_H - (b.accuracy / 100) * CHART_H
              const isLow = b.accuracy < 50
              return (
                <circle
                  key={b.blockNumber}
                  cx={x}
                  cy={y}
                  r={4}
                  fill={isLow ? '#D4DAE3' : '#1B3FC4'}
                  stroke="white"
                  strokeWidth={1.5}
                />
              )
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-1 px-0.5">
          {blocks.map((b) => (
            <span key={b.blockNumber} className="text-[10px] text-muted-foreground tabular-nums">
              B{b.blockNumber}
            </span>
          ))}
        </div>

        {/* Range summary */}
        <div className="flex gap-4 mt-3 text-xs text-text-secondary">
          <span>
            High:{' '}
            <span className="font-semibold text-success tabular-nums">{maxAccuracy}%</span>
          </span>
          <span>
            Low:{' '}
            <span
              className={cn(
                'font-semibold tabular-nums',
                minAccuracy < 50 ? 'text-text-secondary' : 'text-warning',
              )}
            >
              {minAccuracy}%
            </span>
          </span>
        </div>

        {/* Fatigue annotation */}
        {annotation && (
          <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{annotation}</p>
        )}
      </div>
    </div>
  )
}
