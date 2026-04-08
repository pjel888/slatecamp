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
import type { EngagementDepthData } from '@/lib/queries/ceo/analytics/get-engagement-depth'

interface Props {
  data: EngagementDepthData
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
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
      <p className="font-bold mb-0.5" style={{ color: CHART_COLORS.foreground }}>
        Score {label}
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        {payload[0]?.value ?? 0} user{(payload[0]?.value ?? 0) === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export const EngagementDepth = ({ data }: Props) => {
  const colors = useChartColors()

  return (
    <Card className="border-border bg-card p-2 relative">
      <CardHeader className="p-2 pt-1">
        <div className="flex items-start justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Engagement Depth Distribution
          </CardTitle>
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
            avg {data.avgScore} · {data.totalUsers.toLocaleString()} users
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="h-[320px]"
          role="img"
          aria-label="Engagement depth histogram showing distribution of user engagement scores"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.buckets}
              margin={{ top: 4, right: 16, left: -20, bottom: 4 }}
            >
              <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
              <XAxis
                dataKey="scoreRange"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="userCount"
                fill={colors.primary}
                fillOpacity={0.8}
                radius={[3, 3, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
