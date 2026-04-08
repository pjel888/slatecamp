'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import type { ConfidenceCalibrationItem } from '@/lib/actions/analytics-data'

interface Props {
  data: ConfidenceCalibrationItem[]
}

const getInsight = (data: ConfidenceCalibrationItem[]): string | null => {
  if (data.length === 0) return null
  const high = data.find(d => d.level === 'High')
  if (!high) return null
  const gap = high.confidence - high.accuracy
  if (gap >= 20) return `When you feel confident, you're still missing ${gap}% of questions. Slow down and double-check your reasoning.`
  if (gap <= -5) return 'You tend to underestimate yourself — your actual accuracy exceeds your confidence level.'
  return 'Your confidence closely matches your actual accuracy. You\'re well-calibrated.'
}

export const ConfidenceCalibration = ({ data }: Props) => {
  const colors = useChartColors()
  const insight = getInsight(data)

  return (
    <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
      <RichInfoPopover
        title="Confidence Calibration"
        description="How well your self-rated confidence matches your actual accuracy. Taller blue bar vs orange bar means overconfidence."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Confidence Calibration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length === 0 ? (
          <ChartEmptyState
            title="No confidence data"
            description="Confidence calibration appears after rating your confidence on answers."
            height="h-[280px]"
          />
        ) : (
          <>
            <div className="h-[180px]">
              <div role="img" aria-label="Confidence calibration bar chart comparing expected confidence versus actual accuracy by confidence level">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                >
                  <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="level"
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
                    formatter={(v: any, name: string) => [`${v}%`, name]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: `1px solid ${colors.tooltipBorder}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                  />
                  <Bar
                    dataKey="confidence"
                    name="Expected"
                    fill={colors.primary}
                    fillOpacity={0.3}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="accuracy"
                    name="Actual"
                    fill={colors.primary}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
            {insight && (
              <p className="text-[11px] text-text-secondary mt-1 leading-snug">
                {insight}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
