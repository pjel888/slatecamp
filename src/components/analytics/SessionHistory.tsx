'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import type { SessionHistoryData } from '@/lib/actions/analytics-data'

interface Props {
  data: SessionHistoryData
}

const trendLabel = (trend: SessionHistoryData['trend']) => {
  if (trend === 'improving') return { text: 'Improving', color: '#2D9F6F', bg: '#EDFAF4' }
  if (trend === 'declining') return { text: 'Needs attention', color: '#D64545', bg: '#FDF0F0' }
  return { text: 'Stable', color: '#4A5568', bg: '#F5F7FA' }
}

export const SessionHistory = ({ data }: Props) => {
  const trend = trendLabel(data.trend)

  return (
    <Card className="border-[#D4DAE3] bg-white rounded-md shadow-none p-2 relative">
      <RichInfoPopover
        title="Session Performance Over Time"
        description="Your accuracy score for each completed session, in chronological order."
      />
      <CardHeader className="p-2 pt-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Session Performance Over Time
          </CardTitle>
          {data.points.length >= 2 && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: trend.color, background: trend.bg }}
            >
              {trend.text}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.points.length < 2 ? (
          <div className="h-[220px] flex items-center justify-center">
            <p className="text-xs text-center leading-snug max-w-[200px] text-muted-foreground">
              Complete a few study sessions to see your analytics here.
            </p>
          </div>
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.points} margin={{ top: 5, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#D4DAE3" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4A5568', fontSize: 11 }}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip
                  formatter={(v: any, _: any, props: any) => [
                    `${v}% (${props.payload.questionCount}Q)`,
                    'Accuracy',
                  ]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #D4DAE3',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={75} stroke="#2D9F6F" strokeDasharray="4 4" strokeWidth={1} />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#1B3FC4"
                  strokeWidth={1.5}
                  fillOpacity={0.08}
                  fill="#1B3FC4"
                  dot={{ r: 3, fill: '#1B3FC4', stroke: '#fff', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#1B3FC4"
                  strokeWidth={0}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
