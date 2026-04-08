'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import type { ReadingCorrelationPoint } from '@/lib/actions/analytics/get-reading-correlation-data'

interface Props {
  data: ReadingCorrelationPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ReadingCorrelationPoint }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      className="rounded-md bg-card p-2 text-xs"
      style={{
        border: `1px solid ${CHART_COLORS.tooltipBorder}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      <p className="font-bold mb-1" style={{ color: CHART_COLORS.foreground }}>
        {d.articleTitle}
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>Topic: {d.topicName}</p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        Read time: {d.readDurationMinutes} min
      </p>
      <p style={{ color: CHART_COLORS.textSecondary }}>
        Mastery: {d.masteryChange.toFixed(0)}%
      </p>
    </div>
  )
}

export const ReadingCorrelation = ({ data }: Props) => {
  const colors = useChartColors()

  if (data.length === 0) {
    return (
      <ChartEmptyState
        title="No reading data yet"
        description="Reading correlation appears after reading wiki articles and completing related drills."
        height="h-[320px]"
      />
    )
  }

  return (
    <Card className="border-border bg-card p-2 relative">
      <RichInfoPopover
        title="Reading vs. Mastery"
        description="Each dot is a wiki article. X-axis = time spent reading (minutes). Y-axis = mastery level for the related topic. Articles with longer read times may correlate with higher mastery."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Reading Time vs. Topic Mastery
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-1 pb-2">
        <div className="h-[260px]">
          <div
            role="img"
            aria-label="Scatter plot of reading duration versus topic mastery level"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
                <XAxis
                  type="number"
                  dataKey="readDurationMinutes"
                  name="Read Time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  label={{
                    value: 'Read Time (min)',
                    position: 'insideBottom',
                    offset: -18,
                    fontSize: 11,
                    fill: colors.axisTickFill,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="masteryChange"
                  name="Mastery"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                  width={36}
                  label={{
                    value: 'Mastery',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fontSize: 11,
                    fill: colors.axisTickFill,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                  data={data}
                  fill={colors.primary}
                  fillOpacity={0.7}
                  stroke={colors.primary}
                  strokeWidth={1}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
