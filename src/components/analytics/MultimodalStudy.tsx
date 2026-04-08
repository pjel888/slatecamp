'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { MultimodalWeekRow } from '@/lib/actions/analytics/get-multimodal-study-data'

interface Props {
  data: MultimodalWeekRow[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-md bg-card p-2 text-xs"
      style={{
        border: `1px solid ${CHART_COLORS.tooltipBorder}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <p className="font-bold mb-1" style={{ color: CHART_COLORS.foreground }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export const MultimodalStudy = ({ data }: Props) => {
  const colors = useChartColors()

  return (
    <Card className="border-border bg-card p-2 relative">
      <CardHeader className="p-2 pt-1">
        <div className="flex items-start justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Multimodal Study Score
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">Last 12 weeks</span>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="h-[320px]"
          role="img"
          aria-label="Stacked area chart showing drill score, reading score, and combined multimodal study score over the last 12 weeks"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 4 }}>
              <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
              <XAxis
                dataKey="weekLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="drillScore"
                name="Drill"
                stackId="1"
                fill={colors.primary}
                stroke={colors.primary}
                fillOpacity={0.3}
                strokeWidth={1.5}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="readingScore"
                name="Reading"
                stackId="1"
                fill={colors.success}
                stroke={colors.success}
                fillOpacity={0.3}
                strokeWidth={1.5}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="combinedScore"
                name="Combined"
                stroke={colors.warning}
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
