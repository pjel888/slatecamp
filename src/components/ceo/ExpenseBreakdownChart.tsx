'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { CEO_CHART_COLORS, formatPeso } from '@/types/ceo'

interface ExpenseBreakdownChartProps {
  data: Array<{
    category: string
    amount: number
    label: string
  }>
}

const SLICE_COLORS = [
  CEO_CHART_COLORS.cobalt,
  CEO_CHART_COLORS.signalGold,
  CEO_CHART_COLORS.success,
  CEO_CHART_COLORS.accent,
  CEO_CHART_COLORS.warning,
  CEO_CHART_COLORS.neutral,
  '#7C3AED',
  '#0EA5E9',
]

const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  if ((percent ?? 0) < 0.05) return null
  const RADIAN = Math.PI / 180
  const cxNum = typeof cx === 'number' ? cx : 0
  const cyNum = typeof cy === 'number' ? cy : 0
  const midAngleNum = typeof midAngle === 'number' ? midAngle : 0
  const innerR = typeof innerRadius === 'number' ? innerRadius : 0
  const outerR = typeof outerRadius === 'number' ? outerRadius : 0
  const radius = innerR + (outerR - innerR) * 0.5
  const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN)
  const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { label: string } }>
}) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]

  return (
    <div className="bg-card border border-border rounded-md p-3 shadow-md">
      <p className="text-sm font-medium text-foreground">{entry.payload.label}</p>
      <p className="font-mono tabular-nums text-sm text-muted-foreground mt-0.5">
        {formatPeso(entry.value)}
      </p>
    </div>
  )
}

export const ExpenseBreakdownChart = ({ data }: ExpenseBreakdownChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No expense data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="label"
          cx="50%"
          cy="45%"
          outerRadius={100}
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={SLICE_COLORS[index % SLICE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: '#4A5568', fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
