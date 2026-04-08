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
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { AdoptionFunnelStage } from '@/lib/queries/ceo/analytics/get-adoption-funnel'

interface Props {
  stages: AdoptionFunnelStage[]
  totalRegistered: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: AdoptionFunnelStage }>
  label?: string
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const stage = payload[0]?.payload
  return (
    <div
      className="rounded-md bg-card p-2 text-xs"
      style={{
        border: `1px solid ${CHART_COLORS.tooltipBorder}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <p className="font-bold mb-0.5" style={{ color: CHART_COLORS.foreground }}>
        {stage?.stage}
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        {stage?.count.toLocaleString()} users
      </p>
      {stage?.dropOffRate !== null && stage?.dropOffRate !== undefined && (
        <p style={{ color: CHART_COLORS.destructive }}>
          {stage.dropOffRate}% drop-off from previous
        </p>
      )}
    </div>
  )
}

export const AdoptionFunnel = ({ stages, totalRegistered }: Props) => {
  const colors = useChartColors()

  // Opacity decreases with each stage to emphasise funnel shape
  const opacities = [1, 0.82, 0.64, 0.46, 0.30]

  return (
    <Card className="border-border bg-card p-2 relative">
      <CardHeader className="p-2 pt-1">
        <div className="flex items-start justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Adoption Funnel
          </CardTitle>
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
            {totalRegistered.toLocaleString()} registered
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="h-[320px]"
          role="img"
          aria-label="Adoption funnel chart showing user progression through platform milestones"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stages}
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
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                width={110}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} animationDuration={1000}>
                {stages.map((_, i) => (
                  <Cell
                    key={i}
                    fill={colors.primary}
                    fillOpacity={opacities[i] ?? 0.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
