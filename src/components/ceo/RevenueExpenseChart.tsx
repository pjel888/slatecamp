'use client'

import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { CEO_CHART_COLORS, formatPeso } from '@/types/ceo'

interface RevenueExpenseChartProps {
  data: Array<{
    month: string
    revenue: number
    expenses: number
    net: number
  }>
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border rounded-md p-3 shadow-md">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono tabular-nums text-foreground">{formatPeso(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export const RevenueExpenseChart = ({ data }: RevenueExpenseChartProps) => {
  const BREAK_EVEN = 172_000

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D4DAE3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontFamily: 'monospace', fontSize: 11, fill: '#8896A7' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => {
            if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(1)}M`
            if (v >= 1_000) return `₱${(v / 1_000).toFixed(0)}K`
            return `₱${v}`
          }}
          tick={{ fontFamily: 'monospace', fontSize: 11, fill: '#8896A7' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: 'monospace', fontSize: 11, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <ReferenceLine
          y={BREAK_EVEN}
          stroke={CEO_CHART_COLORS.warning}
          strokeDasharray="4 4"
          label={{
            value: 'Break-even',
            position: 'insideTopRight',
            fontFamily: 'monospace',
            fontSize: 10,
            fill: CEO_CHART_COLORS.warning,
          }}
        />
        <Area
          type="monotone"
          dataKey="net"
          name="Net"
          fill={CEO_CHART_COLORS.success}
          stroke={CEO_CHART_COLORS.success}
          fillOpacity={0.15}
          strokeWidth={0}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill={CEO_CHART_COLORS.cobalt}
          radius={[2, 2, 0, 0]}
          maxBarSize={48}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={CEO_CHART_COLORS.signalGold}
          strokeWidth={2}
          dot={{ r: 3, fill: CEO_CHART_COLORS.signalGold, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
