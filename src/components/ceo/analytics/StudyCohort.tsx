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
  Legend,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { StudyCohort as StudyCohortData } from '@/lib/queries/ceo/analytics/get-study-cohorts'

interface Props {
  cohorts: StudyCohortData[]
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
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.name === 'Avg Accuracy' ? '%' : ''}
          {entry.name === 'Sessions/Week' ? ' sessions' : ''}
        </p>
      ))}
    </div>
  )
}

export const StudyCohort = ({ cohorts }: Props) => {
  const colors = useChartColors()

  return (
    <Card className="border-border bg-card p-2 relative">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Study Cohort Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="h-[320px]"
          role="img"
          aria-label="Study cohort comparison chart grouping users by study behavior patterns"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cohorts}
              layout="vertical"
              margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
              barCategoryGap="20%"
              barGap={2}
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
              />
              <YAxis
                type="category"
                dataKey="cohortName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                formatter={(value: string) => (
                  <span style={{ color: colors.axisTickFill }}>{value}</span>
                )}
              />
              <Bar
                dataKey="userCount"
                name="Users"
                fill={colors.primary}
                fillOpacity={0.85}
                radius={[0, 3, 3, 0]}
                animationDuration={1000}
              />
              <Bar
                dataKey="avgAccuracy"
                name="Avg Accuracy"
                fill={colors.success}
                fillOpacity={0.75}
                radius={[0, 3, 3, 0]}
                animationDuration={1000}
              />
              <Bar
                dataKey="avgSessionsPerWeek"
                name="Sessions/Week"
                fill={colors.warning}
                fillOpacity={0.75}
                radius={[0, 3, 3, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
