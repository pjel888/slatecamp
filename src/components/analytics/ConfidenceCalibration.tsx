'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
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
          <div className="h-[220px] flex items-center justify-center">
            <p className="text-xs text-center leading-snug max-w-[200px] text-muted-foreground">
              Complete a few study sessions to see your analytics here.
            </p>
          </div>
        ) : (
          <>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                >
                  <CartesianGrid stroke="#D4DAE3" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="level"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4A5568', fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4A5568', fontSize: 11 }}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    formatter={(v: any, name: string) => [`${v}%`, name]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #D4DAE3',
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
                    fill="#1B3FC4"
                    fillOpacity={0.3}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="accuracy"
                    name="Actual"
                    fill="#1B3FC4"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
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
