'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import type { TimeSpentDistributionData } from '@/lib/actions/analytics-data'

interface Props {
  data: TimeSpentDistributionData
}

const formatAvg = (ms: number) => {
  if (ms === 0) return null
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

const getInsight = (avgMs: number): string => {
  const s = avgMs / 1000
  if (s < 15) return 'You\'re answering quickly. Make sure you\'re reading each question fully.'
  if (s <= 90) return 'Your pacing is within a healthy range for exam conditions.'
  return 'You\'re spending extra time per question. Timed practice may help build fluency.'
}

export const TimeSpentDistribution = ({ data }: Props) => {
  const colors = useChartColors()
  const avgLabel = formatAvg(data.avgMs)

  return (
    <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
      <RichInfoPopover
        title="Response Time Distribution"
        description="How long you spend per question, bucketed by time range."
      />
      <CardHeader className="p-2 pt-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Response Time Distribution
          </CardTitle>
          {avgLabel && (
            <span className="text-[11px] text-text-secondary">
              Avg: <span className="font-mono font-semibold text-foreground">{avgLabel}</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.buckets.length === 0 ? (
          <ChartEmptyState
            title="No timing data"
            description="Response time distribution appears after completing drills."
            height="h-[280px]"
          />
        ) : (
          <>
            <div className="h-[180px]">
              <div role="img" aria-label="Response time distribution bar chart showing how long you spend per question">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.buckets}
                  margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                >
                  <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(v: any) => [v, 'Questions']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: `1px solid ${colors.tooltipBorder}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill={colors.primary} radius={[3, 3, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
            {data.avgMs > 0 && (
              <p className="text-[11px] text-text-secondary mt-1 leading-snug">
                {getInsight(data.avgMs)}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
