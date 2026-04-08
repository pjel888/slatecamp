'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { ForgettingCurveData } from '@/lib/actions/analytics/chart-data'

interface Props {
  data: ForgettingCurveData
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; payload: { daysSince: number } }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const day = payload[0]?.payload?.daysSince
  return (
    <div
      className="rounded-md bg-card p-2 text-xs"
      style={{ border: `1px solid ${CHART_COLORS.tooltipBorder}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
    >
      <p className="font-bold mb-1" style={{ color: CHART_COLORS.foreground }}>Day {day}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  )
}

const buildCoaching = (data: ForgettingCurveData): { text: string; variant: 'warning' | 'success' | 'insight' } | null => {
  if (data.topics.length === 0) return null

  const fastDecaying = data.topics.filter(t => t.optimalReviewDay <= 7)
  if (fastDecaying.length > 0) {
    const names = fastDecaying.map(t => t.topicName.split(' ').slice(-2).join(' ')).join(', ')
    return {
      text: `${names} ${fastDecaying.length === 1 ? 'needs' : 'need'} review within ${fastDecaying[0].optimalReviewDay} days to stay above ${data.reviewThreshold}% recall.`,
      variant: 'warning',
    }
  }

  const stableTopics = data.topics.filter(t => t.optimalReviewDay >= 20)
  if (stableTopics.length >= 3) {
    return {
      text: `Strong retention — ${stableTopics.length} topics hold above ${data.reviewThreshold}% recall for 20+ days.`,
      variant: 'success',
    }
  }

  return null
}

export const ForgettingCurves = ({ data }: Props) => {
  const colors = useChartColors()
  const coaching = buildCoaching(data)

  // Build merged dataset for multi-line chart
  const mergedData = Array.from({ length: 31 }, (_, day) => {
    const point: Record<string, number> = { daysSince: day }
    for (const topic of data.topics) {
      const curvePoint = topic.curve.find(c => c.daysSince === day)
      point[topic.topicId] = curvePoint?.recall ?? 0
    }
    return point
  })

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <RichInfoPopover
        title="Memory Decay Curves"
        description="Estimated recall percentage over time per topic. The dashed line at 70% marks the optimal review threshold. Topics crossing it sooner need earlier review."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Memory Decay Curves
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.topics.length === 0 ? (
          <ChartEmptyState
            title="No retention data"
            description="Forgetting curves appear after revisiting topics over time."
            height="h-[320px]"
          />
        ) : (
          <>
            <div className="h-[220px]">
              <div role="img" aria-label="Memory retention curves chart showing estimated recall decay over time per topic">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="daysSince"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                    label={{ value: 'Days Since Review', position: 'insideBottom', offset: -5, fontSize: 11, fill: colors.axisTickFill }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                    ticks={[0, 25, 50, 70, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={data.reviewThreshold}
                    stroke={colors.border}
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    label={{ value: `${data.reviewThreshold}% threshold`, position: 'right', fontSize: 10, fill: colors.mutedForeground }}
                  />
                  {data.topics.map(topic => (
                    <Line
                      key={topic.topicId}
                      type="monotone"
                      dataKey={topic.topicId}
                      name={topic.topicName}
                      stroke={topic.color}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3, stroke: '#fff', strokeWidth: 1.5 }}
                      animationDuration={1200}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 mt-1">
              {data.topics.map(t => (
                <div key={t.topicId} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-[11px] truncate max-w-[120px]" style={{ color: colors.textSecondary }}>
                    {t.topicName}
                  </span>
                  <span className="text-[10px]" style={{ color: colors.mutedForeground }}>
                    ({t.optimalReviewDay}d)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        {coaching && <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />}
      </CardContent>
    </Card>
  )
}
