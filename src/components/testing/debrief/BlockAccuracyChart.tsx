'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import type { AccuracyBlock } from '@/types/testing'
import { Eyebrow } from '@/components/ui/eyebrow'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlockAccuracyChartProps {
  blocks: AccuracyBlock[]
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number
  payload: AccuracyBlock
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) => {
  if (!active || !payload?.length) return null
  const block = payload[0]
  return (
    <div
      className="rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs shadow-md"
      style={{ color: 'var(--foreground)' }}
    >
      <p className="font-medium">Block {block.payload.block}</p>
      <p style={{ color: 'var(--text-secondary)' }}>
        {block.value}% accuracy
      </p>
      <p style={{ color: 'var(--muted-foreground)' }}>
        {block.payload.questionCount} questions
      </p>
    </div>
  )
}

// ─── Fatigue annotation ───────────────────────────────────────────────────────

const getFatigueAnnotation = (blocks: AccuracyBlock[]): string | null => {
  if (blocks.length < 3) return null
  const firstHalf = blocks.slice(0, Math.floor(blocks.length / 2))
  const secondHalf = blocks.slice(Math.floor(blocks.length / 2))
  const firstAvg = firstHalf.reduce((s, b) => s + b.accuracy, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((s, b) => s + b.accuracy, 0) / secondHalf.length
  const drop = firstAvg - secondAvg
  if (drop >= 15) return 'Your accuracy dropped noticeably in later blocks — a common sign of mental fatigue. Shorter, more frequent sessions can help maintain consistent performance.'
  if (drop >= 8) return 'Slight accuracy dip in later blocks — this is normal. Building stamina through regular practice will help flatten this curve over time.'
  return 'Solid consistency across blocks — your accuracy held up throughout the session.'
}

// ─── Component ────────────────────────────────────────────────────────────────

export const BlockAccuracyChart = ({ blocks }: BlockAccuracyChartProps) => {
  const annotation = getFatigueAnnotation(blocks)

  return (
    <div>
      {/* Section label */}
      <Eyebrow className="mb-3 block">Accuracy by Block</Eyebrow>

      <div className="bg-card rounded-lg border border-border p-5">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={blocks}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <XAxis
              dataKey="block"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-default)' }}
              label={{
                value: 'Block',
                position: 'insideBottom',
                offset: -2,
                fontSize: 11,
                fill: 'var(--muted-foreground)',
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine
              y={70}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{
                value: 'Reliable threshold',
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'var(--muted-foreground)',
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="accuracy" radius={[2, 2, 0, 0]} maxBarSize={48}>
              {blocks.map((block) => (
                <Cell
                  key={`cell-${block.block}`}
                  fill={block.accuracy >= 70 ? 'var(--success)' : 'var(--destructive)'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Fatigue annotation */}
        {annotation && (
          <p
            className="mt-3 text-[13px] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {annotation}
          </p>
        )}
      </div>
    </div>
  )
}
