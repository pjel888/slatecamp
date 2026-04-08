'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { StudyVelocityData } from '@/lib/actions/analytics/chart-data'

interface Props {
  data: StudyVelocityData
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-md bg-card p-2 text-xs"
      style={{ border: `1px solid ${CHART_COLORS.tooltipBorder}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <p className="font-bold mb-0.5" style={{ color: CHART_COLORS.foreground }}>Week of {label}</p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        {payload[0]?.value ?? 0} topic{(payload[0]?.value ?? 0) === 1 ? '' : 's'} mastered
      </p>
    </div>
  )
}

const buildCoaching = (data: StudyVelocityData): { text: string; variant: 'success' | 'insight' | 'warning' } | null => {
  if (data.weeks.length === 0 || data.avgPerWeek === 0) return null

  if (data.projectedCompletionDate) {
    return {
      text: `You're mastering ${data.avgPerWeek} topics/week. At this pace, you'll cover the full syllabus by ${data.projectedCompletionDate}.`,
      variant: data.avgPerWeek >= 3 ? 'success' : 'insight',
    }
  }

  // Check for recent slowdown
  const recentWeeks = data.weeks.slice(-4)
  const recentAvg = recentWeeks.reduce((s, w) => s + w.nodesMastered, 0) / recentWeeks.length
  if (recentAvg < data.avgPerWeek * 0.5 && data.avgPerWeek > 0) {
    return {
      text: `Your mastery pace has slowed recently. Try focusing on 2-3 topics at a time for steady progress.`,
      variant: 'warning',
    }
  }

  return {
    text: `Averaging ${data.avgPerWeek} new topics mastered per week. Consistent effort builds strong foundations.`,
    variant: 'success',
  }
}

export const StudyVelocity = ({ data }: Props) => {
  const colors = useChartColors()
  const coaching = buildCoaching(data)

  // Calculate trend line data
  const trendData = data.weeks.map((w, i) => {
    if (data.weeks.length < 2) return { ...w, trend: w.nodesMastered }
    const windowSize = Math.min(3, i + 1)
    const start = Math.max(0, i - windowSize + 1)
    const slice = data.weeks.slice(start, i + 1)
    const avg = slice.reduce((s, wk) => s + wk.nodesMastered, 0) / slice.length
    return { ...w, trend: parseFloat(avg.toFixed(1)) }
  })

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <RichInfoPopover
        title="Study Velocity"
        description="Topics mastered per week (crossed 70% mastery threshold). The trend line shows your 3-week rolling average."
      />
      <CardHeader className="p-2 pt-1">
        <div className="flex items-start justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Study Velocity
          </CardTitle>
          {data.avgPerWeek > 0 && (
            <span className="text-[11px] font-bold tabular-nums" style={{ color: colors.primary }}>
              {data.avgPerWeek}/wk avg
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.weeks.length === 0 || data.weeks.every(w => w.nodesMastered === 0) ? (
          <ChartEmptyState
            title="No velocity data"
            description="Study velocity tracks weekly mastery progress."
            height="h-[320px]"
          />
        ) : (
          <div className="h-[200px]">
            <div role="img" aria-label="Study velocity chart showing topics mastered per week with rolling average trend line">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="weekLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 10 }}
                  interval={1}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="nodesMastered"
                  fill={colors.primary}
                  fillOpacity={0.75}
                  radius={[3, 3, 0, 0]}
                  barSize={20}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#E8853A"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                  animationDuration={1200}
                />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}
        {coaching && <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />}
      </CardContent>
    </Card>
  )
}
