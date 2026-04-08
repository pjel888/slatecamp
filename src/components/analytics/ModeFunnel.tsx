'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { getModeColor } from '@/lib/constants/chart-colors'
import type { ModeFunnelWeek } from '@/lib/actions/analytics/get-mode-funnel'

interface Props {
  data: ModeFunnelWeek[]
}

export const ModeFunnel = ({ data }: Props) => {
  const colors = useChartColors()

  const modes = useMemo(() => {
    const modeSet = new Set<string>()
    for (const week of data) {
      for (const key of Object.keys(week)) {
        if (key !== 'week') modeSet.add(key)
      }
    }
    return Array.from(modeSet)
  }, [data])

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Study Mode Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-[270px]">
          <div role="img" aria-label="Stacked area chart showing weekly session counts by quiz mode">
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.axisTickFill, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${colors.tooltipBorder}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                {modes.map(mode => (
                  <Area
                    key={mode}
                    type="monotone"
                    dataKey={mode}
                    stackId="1"
                    stroke={getModeColor(mode)}
                    fill={getModeColor(mode)}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
