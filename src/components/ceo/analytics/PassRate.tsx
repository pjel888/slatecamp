'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { PassRateBucket } from '@/lib/queries/ceo/analytics/get-pass-rate'

interface Props {
  buckets: PassRateBucket[]
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
        Score {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name === 'Pass Rate' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

export const PassRate = ({ buckets }: Props) => {
  const colors = useChartColors()

  return (
    <Card className="border-border bg-card p-2 relative">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Pass Rate Prediction by Readiness Score
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="h-[320px]"
          role="img"
          aria-label="Pass rate prediction chart showing readiness score distribution and estimated pass rates"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={buckets} margin={{ top: 4, right: 40, left: 4, bottom: 4 }}>
              <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="scoreRange"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
                label={{
                  value: 'Users',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: colors.axisTickFill, fontSize: 10 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                formatter={(value: string) => (
                  <span style={{ color: colors.axisTickFill }}>{value}</span>
                )}
              />
              <Bar
                yAxisId="left"
                dataKey="userCount"
                name="Users"
                fill={colors.primary}
                fillOpacity={0.75}
                radius={[3, 3, 0, 0]}
                animationDuration={1000}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="estimatedPassRate"
                name="Pass Rate"
                stroke={colors.success}
                strokeWidth={2}
                dot={{ fill: colors.success, r: 3 }}
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
