'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import type { MetacognitionPoint } from '@/lib/actions/analytics/get-metacognition-data'

interface Props {
  data: MetacognitionPoint[]
}

export const MetacognitionChart = ({ data }: Props) => {
  const colors = useChartColors()

  const chartData = data.map(d => ({
    predicted: Math.round(d.predicted_score),
    actual: Math.round(d.actual_score),
  }))

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Metacognitive Accuracy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-[270px]">
          <div role="img" aria-label="Scatter chart comparing predicted scores versus actual scores with a perfect calibration diagonal line">
            <ResponsiveContainer width="100%" height={270}>
              <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  label={{ value: 'Predicted %', position: 'insideBottom', offset: -2, fontSize: 10, fill: colors.mutedForeground }}
                />
                <YAxis
                  type="number"
                  dataKey="actual"
                  name="Actual"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  label={{ value: 'Actual %', angle: -90, position: 'insideLeft', offset: 20, fontSize: 10, fill: colors.mutedForeground }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${colors.tooltipBorder}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                  stroke={colors.referenceLine}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
                <Scatter
                  data={chartData}
                  fill={colors.primary}
                  fillOpacity={0.7}
                  r={4}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Dots on the dashed line = perfect calibration. Above = underconfident. Below = overconfident.
        </p>
      </CardContent>
    </Card>
  )
}
