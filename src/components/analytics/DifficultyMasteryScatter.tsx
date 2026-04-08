'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceArea, ReferenceLine, Cell,
} from 'recharts'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { QuadrantOverlay } from './QuadrantOverlay'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { DifficultyMasteryPoint } from '@/lib/actions/analytics/chart-data'

interface Props {
  data: DifficultyMasteryPoint[]
}

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: DifficultyMasteryPoint
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: DifficultyMasteryPoint }>
}

const DIFFICULTY_MID = 0.5
const MASTERY_MID = 50

const getQuadrantColor = (point: DifficultyMasteryPoint): string => {
  const hard = point.avgDifficulty >= DIFFICULTY_MID
  const mastered = point.masteryPct >= MASTERY_MID
  if (hard && mastered) return CHART_COLORS.success        // Strengths
  if (!hard && mastered) return CHART_COLORS.mutedForeground // Move on
  if (hard && !mastered) return CHART_COLORS.destructive   // Priority targets
  return CHART_COLORS.warning                              // Quick fixes
}

const CustomDot = ({ cx, cy, payload }: CustomDotProps) => {
  if (cx == null || cy == null || !payload) return null
  const color = getQuadrantColor(payload)
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        fillOpacity={0.85}
        stroke="#fff"
        strokeWidth={1.5}
        style={{ cursor: 'pointer' }}
      />
    </g>
  )
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      className="rounded-md bg-card p-2 text-xs"
      style={{ border: `1px solid ${CHART_COLORS.tooltipBorder}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <p className="font-bold mb-1" style={{ color: CHART_COLORS.foreground }}>{d.topicName}</p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        Difficulty: {(d.avgDifficulty * 100).toFixed(0)}% | Mastery: {d.masteryPct}%
      </p>
      <p style={{ color: CHART_COLORS.mutedForeground }}>{d.questionCount} attempts</p>
    </div>
  )
}

const buildCoaching = (data: DifficultyMasteryPoint[]): { text: string; variant: 'warning' | 'success' | 'insight' } | null => {
  if (data.length < 3) return null

  const priorityTargets = data.filter(d => d.avgDifficulty >= DIFFICULTY_MID && d.masteryPct < MASTERY_MID)
  const quickFixes = data.filter(d => d.avgDifficulty < DIFFICULTY_MID && d.masteryPct < MASTERY_MID)

  if (priorityTargets.length > 0) {
    const names = priorityTargets.slice(0, 2).map(d => d.topicName.split(' ').slice(-2).join(' ')).join(', ')
    return {
      text: `${names} ${priorityTargets.length === 1 ? 'is a' : 'are'} priority target${priorityTargets.length === 1 ? '' : 's'} â€” hard content with low mastery. Focus here for the biggest score gain.`,
      variant: 'warning',
    }
  }

  if (quickFixes.length > 0) {
    return {
      text: `${quickFixes.length} topic${quickFixes.length === 1 ? '' : 's'} with easy questions but low mastery â€” quick sessions could raise your score.`,
      variant: 'insight',
    }
  }

  const strengths = data.filter(d => d.avgDifficulty >= DIFFICULTY_MID && d.masteryPct >= MASTERY_MID)
  if (strengths.length >= data.length * 0.5) {
    return {
      text: `Strong performance on hard content â€” over half your topics are in the "strengths" zone.`,
      variant: 'success',
    }
  }

  return null
}

export const DifficultyMasteryScatter = ({ data }: Props) => {
  const colors = useChartColors()
  const coaching = buildCoaching(data)

  if (data.length === 0) {
    return (
      <ChartEmptyState
        title="No mastery data"
        description="Difficulty vs mastery analysis appears after multiple sessions."
        height="h-[340px]"
      />
    )
  }

  const maxDifficulty = Math.min(1, Math.max(...data.map(d => d.avgDifficulty), 0.6) + 0.1)

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <RichInfoPopover
        title="Difficulty vs. Mastery"
        description="Each dot is a topic. Top-right = hard + mastered (strengths). Bottom-right = hard + weak (priority targets). Bottom-left = easy + weak (quick fixes)."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Difficulty vs. Mastery
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-1 pb-2">
        <div className="relative">
          <QuadrantOverlay
            labels={{
              topLeft: 'Move on',
              topRight: 'Your strengths',
              bottomLeft: 'Quick fixes',
              bottomRight: 'Priority targets',
            }}
            colors={{
              topLeft: colors.mutedForeground,
              topRight: colors.success,
              bottomLeft: colors.warning,
              bottomRight: colors.destructive,
            }}
            className="[&_span]:text-[10px]"
          />

          <div className="h-[280px]">
            <div role="img" aria-label="Difficulty versus mastery scatter plot showing topics by question difficulty and mastery level">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                <XAxis
                  type="number"
                  dataKey="avgDifficulty"
                  domain={[0, maxDifficulty]}
                  tickFormatter={v => `${Math.round(v * 100)}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  label={{ value: 'Avg Question Difficulty', position: 'insideBottom', offset: -18, fontSize: 11, fill: colors.axisTickFill }}
                />
                <YAxis
                  type="number"
                  dataKey="masteryPct"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Quadrant backgrounds */}
                <ReferenceArea x1={DIFFICULTY_MID} x2={maxDifficulty} y1={MASTERY_MID} y2={100} fill={colors.success} fillOpacity={0.04} />
                <ReferenceArea x1={0} x2={DIFFICULTY_MID} y1={MASTERY_MID} y2={100} fill={colors.border} fillOpacity={0.15} />
                <ReferenceArea x1={DIFFICULTY_MID} x2={maxDifficulty} y1={0} y2={MASTERY_MID} fill={colors.destructive} fillOpacity={0.04} />
                <ReferenceArea x1={0} x2={DIFFICULTY_MID} y1={0} y2={MASTERY_MID} fill={colors.warning} fillOpacity={0.04} />

                {/* Reference lines */}
                <ReferenceLine x={DIFFICULTY_MID} stroke={colors.border} strokeDasharray="4 4" strokeWidth={1} />
                <ReferenceLine y={MASTERY_MID} stroke={colors.border} strokeDasharray="4 4" strokeWidth={1} />

                <Scatter data={data} shape={<CustomDot />}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={getQuadrantColor(entry)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
        {coaching && <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />}
      </CardContent>
    </Card>
  )
}
