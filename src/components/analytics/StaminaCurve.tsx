'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import type { StaminaBucket } from '@/lib/actions/analytics'

interface Props { data: StaminaBucket[] }

function buildCoaching(data: StaminaBucket[]): { text: string; variant: 'warning' | 'success' } | null {
  if (data.length < 2) return null
  const first = data[0].accuracy
  const last = data[data.length - 1].accuracy
  const drop = first - last
  if (drop >= 15) {
    return {
      text: `Your accuracy drops ${drop}% by question ${data[data.length - 1].bucket}. Try shorter sessions to build stamina gradually.`,
      variant: 'warning',
    }
  }
  if (drop <= 5 && data.length >= 3) {
    return {
      text: `Strong endurance — your accuracy stays consistent across all question positions.`,
      variant: 'success',
    }
  }
  return null
}

export function StaminaCurve({ data }: Props) {
  const coaching = buildCoaching(data)
  return (
    <Card className="border-border bg-white p-2 relative h-full">
      <RichInfoPopover title="Cognitive Stamina" description="Accuracy by question position. A declining curve indicates cognitive fatigue in longer sessions." />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#4A5568' }}>
          Cognitive Stamina
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length < 2 ? (
          <div className="h-[160px] flex items-center justify-center">
            <p className="text-xs text-center leading-snug max-w-[180px]" style={{ color: '#8896A7' }}>
              Complete sessions with 10+ questions to see your stamina curve.
            </p>
          </div>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="#D4DAE3" strokeDasharray="3 3" />
                <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fill: '#4A5568', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false}
                  tick={{ fill: '#4A5568', fontSize: 11 }} ticks={[0, 50, 75, 100]} />
                <Tooltip
                  formatter={(v: any, _: any, props: any) => [`${v}% (${props.payload.sampleSize}Q)`, 'Accuracy']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #D4DAE3', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <ReferenceLine y={75} stroke="#2D9F6F" strokeDasharray="4 4" strokeWidth={1} />
                <Line type="monotone" dataKey="accuracy" stroke="#1B3FC4" strokeWidth={1.5}
                  dot={{ r: 3, fill: '#1B3FC4', stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 4 }} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {coaching && <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />}
      </CardContent>
    </Card>
  )
}
