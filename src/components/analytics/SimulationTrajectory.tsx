'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import type { SimulationPoint } from '@/lib/actions/progress-report/actions'

interface Props {
  data: SimulationPoint[]
}

const buildCoaching = (data: SimulationPoint[]): { text: string; variant: 'success' | 'insight' } | null => {
  if (data.length < 2) return null
  const first = data[0].score
  const last = data[data.length - 1].score
  const delta = last - first

  if (delta > 0) {
    return {
      text: `You've improved from ${first}% to ${last}% across ${data.length} simulations.`,
      variant: 'success',
    }
  }

  return {
    text: `${data.length} simulations completed. Keep reviewing areas to revisit to build upward momentum.`,
    variant: 'insight',
  }
}

export const SimulationTrajectory = ({ data }: Props) => {
  const colors = useChartColors()
  const coaching = buildCoaching(data)

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <RichInfoPopover
        title="Simulation Trajectory"
        description="Your score trend across full-length simulations (50+ questions). The green dashed line marks the estimated passing threshold."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Simulation Trajectory
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length < 2 ? (
          <ChartEmptyState
            title="No simulation data"
            description="Take a full simulation exam to see your trajectory."
            height="h-[280px]"
          />
        ) : (
          <div className="h-[200px]">
            <div role="img" aria-label="Simulation score trajectory chart showing score trend across full-length simulations">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip
                  formatter={(v: any, _: any, props: any) => [
                    `${v}% (${props.payload?.questionCount ?? ''}Q)`,
                    'Score',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${colors.tooltipBorder}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={75}
                  stroke={colors.referenceLine}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: '75% target',
                    position: 'right',
                    fill: colors.referenceLine,
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={{ r: 4, fill: colors.primary, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}
        {coaching && <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />}
      </CardContent>
    </Card>
  )
}
