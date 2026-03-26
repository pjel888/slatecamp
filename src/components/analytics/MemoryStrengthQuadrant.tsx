'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
} from 'recharts'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type {
  MemoryStrengthTopic,
} from '@/lib/actions/analytics/get-memory-strength-data'

// ── Constants ────────────────────────────────────────────────────────────────

const COLORS: Record<string, string> = {
  mastered: '#2D9F6F',       // Emerald
  surface_learning: '#D4951A', // Amber
  rusty: '#1B3FC4',          // Cobalt
  needs_learning: '#D64545', // Warm Red
}

const QUADRANT_LABELS: Record<string, string> = {
  mastered: 'Mastered',
  surface_learning: 'Surface learning',
  rusty: 'Rusty',
  needs_learning: 'Needs learning',
}

const ACTIVITY_LABELS: Record<string, string> = {
  quick_refresh: 'Quick Refresh',
  full_learning: 'Full Learning Session',
  deepen: 'Interleaved Practice',
  camp_quiz: 'Camp Quiz',
}

// ── Subcomponents ────────────────────────────────────────────────────────────

interface DotProps {
  cx?: number
  cy?: number
  payload?: MemoryStrengthTopic
  onDotClick: (topic: MemoryStrengthTopic, anchor: { x: number; y: number }) => void
}

const QuadrantDot = ({ cx, cy, payload, onDotClick }: DotProps) => {
  if (cx == null || cy == null || !payload) return null
  const color = COLORS[payload.state] ?? '#8896A7'

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        fillOpacity={0.85}
        stroke="#fff"
        strokeWidth={1.5}
        className="cursor-pointer"
        onClick={() => onDotClick(payload, { x: cx, y: cy })}
      />
    </g>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: MemoryStrengthTopic }>
}

const QuadrantTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const label = QUADRANT_LABELS[d.state] ?? d.state

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
      <p className="font-bold mb-1" style={{ color: '#1A2332' }}>
        {d.name}
      </p>
      <p style={{ color: '#4A5568' }}>
        SS: {d.ss.toFixed(2)} / RS: {d.rs.toFixed(2)} — {label}
      </p>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

interface Props {
  data: MemoryStrengthTopic[]
}

export const MemoryStrengthQuadrant = ({ data }: Props) => {
  const [selectedTopic, setSelectedTopic] = useState<MemoryStrengthTopic | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleDotClick = (topic: MemoryStrengthTopic) => {
    setSelectedTopic(topic)
    setPopoverOpen(true)
  }

  if (data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <p className="text-xs text-center leading-snug max-w-[200px] text-muted-foreground">
          Complete quizzes to see how your knowledge is distributed across storage and retrieval strength.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Quadrant labels */}
      <div className="absolute inset-0 pointer-events-none z-10 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-end justify-start pl-8 pb-1">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: COLORS.needs_learning }}
            >
              Needs learning
            </span>
          </div>
          <div className="flex-1" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-end justify-end pr-4 pb-1">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: COLORS.rusty }}
            >
              Rusty
            </span>
          </div>
          <div className="flex-1" />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-10 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1" />
          <div className="flex-1 flex items-start justify-start pl-8 pt-1">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: COLORS.surface_learning }}
            >
              Surface learning
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1" />
          <div className="flex-1 flex items-start justify-end pr-4 pt-1">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: COLORS.mastered }}
            >
              Mastered
            </span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D4DAE3" />
            <XAxis
              type="number"
              dataKey="ss"
              domain={[0, 1]}
              tickFormatter={(v: number) => v.toFixed(1)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4A5568', fontSize: 11 }}
              label={{
                value: 'Storage Strength',
                position: 'insideBottom',
                offset: -18,
                fontSize: 11,
                fill: '#4A5568',
              }}
            />
            <YAxis
              type="number"
              dataKey="rs"
              domain={[0, 1]}
              tickFormatter={(v: number) => v.toFixed(1)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4A5568', fontSize: 11 }}
              width={32}
              label={{
                value: 'Retrieval Strength',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fontSize: 11,
                fill: '#4A5568',
              }}
            />
            {/* Recharts Tooltip — hover only */}
            <QuadrantTooltip />

            {/* Quadrant background shading */}
            <ReferenceArea x1={0} x2={0.5} y1={0.5} y2={1} fill={COLORS.surface_learning} fillOpacity={0.04} />
            <ReferenceArea x1={0.5} x2={1} y1={0.5} y2={1} fill={COLORS.mastered} fillOpacity={0.03} />
            <ReferenceArea x1={0} x2={0.5} y1={0} y2={0.5} fill={COLORS.needs_learning} fillOpacity={0.04} />
            <ReferenceArea x1={0.5} x2={1} y1={0} y2={0.5} fill={COLORS.rusty} fillOpacity={0.03} />

            {/* Midpoint reference lines */}
            <ReferenceLine x={0.5} stroke="#D4DAE3" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={0.5} stroke="#D4DAE3" strokeDasharray="4 4" strokeWidth={1} />

            <Scatter
              data={data}
              shape={<QuadrantDot onDotClick={handleDotClick} />}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.state] ?? '#8896A7'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Click popover with recommendation CTA */}
      {selectedTopic && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <span className="sr-only">Topic details</span>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            className="w-64 p-3 rounded-md border-border shadow-md"
          >
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>
              {selectedTopic.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[selectedTopic.state] }}
              />
              <span className="text-xs" style={{ color: '#4A5568' }}>
                {QUADRANT_LABELS[selectedTopic.state]}
              </span>
            </div>
            <div className="mt-2 text-xs" style={{ color: '#4A5568' }}>
              <p>Storage: {selectedTopic.ss.toFixed(2)} / Retrieval: {selectedTopic.rs.toFixed(2)}</p>
              {selectedTopic.lastReviewed && (
                <p className="mt-0.5">
                  Last reviewed:{' '}
                  {new Date(selectedTopic.lastReviewed).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
            {selectedTopic.recommendation && (
              <button
                type="button"
                className="mt-3 w-full rounded-sm px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 ease-out"
                style={{ backgroundColor: '#1B3FC4' }}
                onClick={() => setPopoverOpen(false)}
              >
                Start {ACTIVITY_LABELS[selectedTopic.recommendation!.type]}
                {selectedTopic.recommendation!.questions
                  ? ` (${selectedTopic.recommendation!.questions}Q)`
                  : ''}
              </button>
            )}
          </PopoverContent>
        </Popover>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 mt-1">
        {Object.entries(QUADRANT_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[key] }}
            />
            <span className="text-[11px]" style={{ color: '#4A5568' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
