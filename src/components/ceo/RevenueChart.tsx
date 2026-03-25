'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { RevenueBreakdown } from '@/types/ceo'
import { CEO_CHART_COLORS, formatPeso } from '@/types/ceo'

interface RevenueChartProps {
  data: RevenueBreakdown[]
}

const BREAK_EVEN = 172_000

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null

  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0)

  return (
    <div className="bg-card border border-border rounded-md p-3 shadow-md text-[12px]">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-medium tabular-nums ml-auto pl-3">
            {formatPeso(p.value ?? 0)}
          </span>
        </div>
      ))}
      <div className="border-t border-border mt-2 pt-2 flex justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="font-mono font-medium tabular-nums">
          {formatPeso(total)}
        </span>
      </div>
    </div>
  )
}

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`
  return `₱${value}`
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const hasData = data.length >= 2 && data.some((d) => d.total > 0)

  if (!hasData) {
    return (
      <div className="bg-card border border-border rounded-md p-4 flex flex-col gap-3 min-h-[320px]">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Revenue Trend
        </p>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center max-w-[220px]">
            Revenue data will appear here once you have at least 2 months of subscription history
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-md p-4 flex flex-col gap-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        Revenue Trend
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cobaltGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CEO_CHART_COLORS.cobalt} stopOpacity={0.15} />
              <stop offset="95%" stopColor={CEO_CHART_COLORS.cobalt} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fontFamily: 'monospace', fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontFamily: 'monospace', fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontFamily: 'monospace', fontSize: 11 }}
            iconType="circle"
            iconSize={8}
          />

          {/* Break-even reference line */}
          <ReferenceLine
            y={BREAK_EVEN}
            stroke={CEO_CHART_COLORS.neutral}
            strokeDasharray="4 4"
            label={{
              value: 'Break-even',
              position: 'insideTopRight',
              fontFamily: 'monospace',
              fontSize: 10,
              fill: 'var(--muted-foreground)',
            }}
          />

          {/* Pro Monthly — filled area */}
          <Area
            type="monotone"
            dataKey="proMonthly"
            name="Pro Monthly"
            stroke={CEO_CHART_COLORS.cobalt}
            strokeWidth={2}
            fill="url(#cobaltGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />

          {/* Pro Exam Pass — line only */}
          <Area
            type="monotone"
            dataKey="proExamPass"
            name="Pro Exam Pass"
            stroke={CEO_CHART_COLORS.signalGold}
            strokeWidth={2}
            fill="none"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
