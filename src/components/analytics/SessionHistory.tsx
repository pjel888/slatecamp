'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import type { SessionHistoryData } from '@/lib/actions/analytics-data'

interface Props {
  data: SessionHistoryData
}

const trendLabel = (trend: SessionHistoryData['trend']) => {
  if (trend === 'improving') return { text: 'Improving', color: '#2D9F6F', bg: '#EDFAF4' }
  if (trend === 'declining') return { text: 'Needs attention', color: '#D64545', bg: '#FDF0F0' }
  return { text: 'Stable', color: '#4A5568', bg: '#F5F7FA' }
}

export const SessionHistory = ({ data }: Props) => {
  const colors = useChartColors()
  const trend = trendLabel(data.trend)

  return (
    <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
      <RichInfoPopover
        title="Session Performance Over Time"
        description="Your accuracy score for each completed session, in chronological order."
      />
      <CardHeader className="p-2 pt-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Session Performance Over Time
          </CardTitle>
          {data.points.length >= 2 && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: trend.color, background: trend.bg }}
            >
              {trend.text}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.points.length < 2 ? (
          <ChartEmptyState
            title="No session history"
            description="Session accuracy trends appear after completing drills."
            height="h-[260px]"
          />
        ) : (
          <div className="h-[220px]">
            <div role="img" aria-label="Session accuracy history chart showing performance trends over time">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.points} margin={{ top: 5, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip
                  formatter={(v: any, _: any, props: any) => [
                    `${v}% (${props.payload.questionCount}Q)`,
                    'Accuracy',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${colors.tooltipBorder}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={75} stroke={colors.referenceLine} strokeDasharray="4 4" strokeWidth={1} />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke={colors.primary}
                  strokeWidth={1.5}
                  fillOpacity={0.08}
                  fill={colors.primary}
                  dot={{ r: 3, fill: colors.primary, stroke: '#fff', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke={colors.primary}
                  strokeWidth={0}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
