'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { AccuracyBySubjectItem } from '@/lib/actions/analytics-data'

interface Props {
  data: AccuracyBySubjectItem[]
}

const getBarColor = (accuracy: number) => {
  if (accuracy >= 70) return CHART_COLORS.success
  if (accuracy >= 50) return CHART_COLORS.warning
  return CHART_COLORS.destructive
}

export const AccuracyBySubject = ({ data }: Props) => {
  const colors = useChartColors()
  return (
  <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
    <RichInfoPopover
      title="Accuracy by Subject"
      description="Your correct-answer rate grouped by subject area. Green ≥ 70%, amber 50–70%, red < 50%."
    />
    <CardHeader className="p-2 pt-1">
      <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
        Accuracy by Subject
      </CardTitle>
    </CardHeader>
    <CardContent className="p-2 pt-0">
      {data.length === 0 ? (
        <ChartEmptyState
          title="No accuracy data"
          description="Subject accuracy appears after answering quiz questions."
          height="h-[280px]"
        />
      ) : (
        <div className="h-[220px]">
          <div role="img" aria-label="Accuracy by subject bar chart showing correct-answer rate per subject area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 32, left: 4, bottom: 4 }}
            >
              <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                ticks={[0, 25, 50, 75, 100]}
              />
              <YAxis
                type="category"
                dataKey="subject"
                width={90}
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.foreground, fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: any) => [`${v}%`, 'Accuracy']}
                contentStyle={{
                  borderRadius: '8px',
                  border: `1px solid ${colors.tooltipBorder}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="accuracy" radius={[0, 3, 3, 0]} maxBarSize={18}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
  )
}
