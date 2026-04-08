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
import type { CoverageGapItem } from '@/lib/queries/ceo/analytics/get-coverage-gap'

interface Props {
  data: CoverageGapItem[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: CoverageGapItem }>
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
        {item?.totalAttempts.toLocaleString()} total attempts
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        {item?.usersCovered} user{item?.usersCovered === 1 ? '' : 's'} covered
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        Avg mastery: {item?.avgMastery}%
      </p>
    </div>
  )
}

const truncate = (s: string, max = 24) =>
  s.length > max ? s.slice(0, max - 1) + '…' : s

export const CoverageGap = ({ data }: Props) => {
  const colors = useChartColors()

  const chartData = data.map((item) => ({
    ...item,
    label: truncate(item.topicName),
  }))

  return (
    <Card className="border-border bg-card p-2 relative">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Coverage Gap — Least Studied Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="h-[320px]"
          role="img"
          aria-label="Coverage gap bar chart showing least-covered topics across all users"
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
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
                width={140}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="totalAttempts"
                fill={colors.warning}
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
