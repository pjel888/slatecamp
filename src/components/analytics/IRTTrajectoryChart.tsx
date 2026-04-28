'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  AreaChart as _AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import type { IRTDataPoint } from '@/lib/actions/analytics/get-irt-data'

interface Props {
  data: IRTDataPoint[]
}

export const IRTTrajectoryChart = ({ data }: Props) => {
  const colors = useChartColors()

  const chartData = data.map(d => ({
    date: new Date(d.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    theta: Math.round(d.theta * 100) / 100,
    upper: Math.round((d.theta + d.theta_se) * 100) / 100,
    lower: Math.round((d.theta - d.theta_se) * 100) / 100,
    responses: d.responses_count,
  }))

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          IRT Ability Trajectory
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-[270px]">
          <div role="img" aria-label="IRT ability trajectory chart showing theta estimate with standard error band over time">
            <ResponsiveContainer width="100%" height={270}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
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
                  formatter={(v: number, name: string) => {
                    const labels: Record<string, string> = { theta: 'Ability (θ)', upper: 'Upper SE', lower: 'Lower SE' }
                    return [v.toFixed(2), labels[name] ?? name]
                  }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${colors.tooltipBorder}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  dataKey="upper"
                  stroke="none"
                  fill={colors.primary}
                  fillOpacity={0.1}
                  isAnimationActive={false}
                />
                <Area
                  dataKey="lower"
                  stroke="none"
                  fill={colors.background}
                  fillOpacity={1}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="theta"
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colors.primary }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
