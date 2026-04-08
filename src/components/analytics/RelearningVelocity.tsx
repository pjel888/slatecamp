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
  Cell,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import type { RelearningItem } from '@/lib/actions/analytics/get-relearning-data'

interface Props {
  data: RelearningItem[]
}

const getMasteryColor = (mastery: number, colors: { success: string; warning: string; destructive: string }) => {
  if (mastery >= 70) return colors.success
  if (mastery >= 40) return colors.warning
  return colors.destructive
}

export const RelearningVelocity = ({ data }: Props) => {
  const colors = useChartColors()

  const chartData = data.map(d => ({
    name: d.topicName.length > 20 ? d.topicName.slice(0, 18) + '...' : d.topicName,
    fullName: d.topicName,
    cycles: d.cycles,
    mastery: d.currentMastery,
  }))

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Relearning Velocity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-[270px]">
          <div role="img" aria-label="Horizontal bar chart showing review cycles per topic colored by current mastery level">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
              >
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, _name: string, entry: { payload?: { fullName?: string; mastery?: number } }) => [
                    `${v} cycles (${entry.payload?.mastery ?? 0}% mastery)`,
                    entry.payload?.fullName ?? '',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${colors.tooltipBorder}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="cycles" radius={[0, 3, 3, 0]} maxBarSize={24}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={getMasteryColor(entry.mastery, colors)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
