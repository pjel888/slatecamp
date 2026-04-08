'use client'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import type { ErrorCategoryCount } from '@/lib/actions/analytics/get-error-patterns'

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  categoryCounts: ErrorCategoryCount[]
  totalClassified: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { label: string; count: number } }>
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  concept_confusion: 'Concept Confusion',
  knowledge_gap: 'Knowledge Gap',
  careless: 'Careless',
  recall_failure: 'Recall Failure',
}

const formatLabel = (category: string): string =>
  CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ')

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md bg-card border border-border px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-semibold text-foreground">{d.label}</p>
      <p className="text-muted-foreground">{d.count} errors</p>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export const ErrorPatterns = ({ categoryCounts, totalClassified }: Props) => {
  const colors = useChartColors()

  const data = categoryCounts.map((c) => ({
    label: formatLabel(c.category),
    count: c.count,
    category: c.category,
  }))

  const barColors = [
    colors.destructive,
    colors.warning,
    colors.primary,
    colors.mutedForeground,
  ]

  return (
    <Card className="border-border bg-card rounded-md shadow-none p-2 relative">
      <RichInfoPopover
        title="Error Patterns"
        description="Distribution of your error types in the last 30 days. Helps identify whether you're struggling with concept understanding, recall, or careless mistakes."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Error Patterns
        </CardTitle>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
          {totalClassified} classified errors · last 30 days
        </p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
            >
              <CartesianGrid
                stroke={colors.gridStroke}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.gridStroke, fillOpacity: 0.5 }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={48} animationDuration={800}>
                {data.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
