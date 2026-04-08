'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { ContentEffectivenessItem } from '@/lib/queries/ceo/analytics/get-content-effectiveness'

interface Props {
  data: ContentEffectivenessItem[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ContentEffectivenessItem }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div
      className="rounded-md bg-card p-2 text-xs max-w-[200px]"
      style={{
        border: `1px solid ${CHART_COLORS.tooltipBorder}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <p
        className="font-bold mb-1 leading-tight"
        style={{ color: CHART_COLORS.foreground }}
      >
        {item?.topicName}
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        Effectiveness: {item?.effectivenessScore}
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        Accuracy: {item?.avgAccuracy}%
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        {item?.totalAnswered.toLocaleString()} answers
      </p>
    </div>
  )
}

const truncate = (s: string, max = 22) =>
  s.length > max ? s.slice(0, max - 1) + '…' : s

export const ContentEffectiveness = ({ data }: Props) => {
  const colors = useChartColors()

  const chartData = data.map((item) => ({
    ...item,
    label: truncate(item.topicName),
  }))

  return (
    <Card className="border-border bg-card p-2 relative">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Content Effectiveness
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="h-[320px]"
          role="img"
          aria-label="Content effectiveness bar chart ranking topics by accuracy and engagement"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                horizontal={false}
                stroke={colors.gridStroke}
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="effectivenessScore"
                fill={colors.success}
                fillOpacity={0.85}
                radius={[0, 3, 3, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
