'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import type { DepartmentCost } from '@/types/ceo'
import { formatPeso } from '@/types/ceo'

interface DepartmentCostChartProps {
  data: DepartmentCost[]
}

const DEPT_CHART_COLORS: Record<string, string> = {
  engineering: '#1B3FC4',
  content:     '#D4951A',
  design:      '#7C3AED',
  marketing:   '#2D9F6F',
  operations:  '#94A3B8',
  consulting:  '#E8853A',
}

const FALLBACK_COLOR = '#CBD5E1'

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: DepartmentCost }>
}) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-md text-sm">
      <p className="font-medium capitalize text-foreground">{entry.name}</p>
      <p className="font-mono tabular-nums text-muted-foreground">{formatPeso(entry.value)}</p>
      <p className="text-[11px] text-muted-foreground">
        {entry.payload.percentOfBurn.toFixed(1)}% of burn
      </p>
    </div>
  )
}

const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props
  if ((percent ?? 0) < 0.08) return null
  const RADIAN = Math.PI / 180
  const ri = typeof innerRadius === 'number' ? innerRadius : 0
  const ro = typeof outerRadius === 'number' ? outerRadius : 0
  const cxNum = typeof cx === 'number' ? cx : 0
  const cyNum = typeof cy === 'number' ? cy : 0
  const angle = typeof midAngle === 'number' ? midAngle : 0
  const radius = ri + (ro - ri) * 0.5
  const x = cxNum + radius * Math.cos(-angle * RADIAN)
  const y = cyNum + radius * Math.sin(-angle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
    >
      {name}
    </text>
  )
}

export const DepartmentCostChart = ({ data }: DepartmentCostChartProps) => {
  const hasData = data.some((d) => d.totalMonthlyCost > 0)

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No cost data available.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.department,
    value: d.totalMonthlyCost,
    percentOfBurn: d.percentOfBurn,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          outerRadius={100}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={DEPT_CHART_COLORS[entry.name] ?? FALLBACK_COLOR}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-[11px] capitalize text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
