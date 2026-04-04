'use client'

import { TrendUp, TrendDown, Minus, Target } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/components/shared/score-display'
import type { ReadinessTrajectoryPoint } from '@/lib/actions/analytics'

interface Props {
  data: ReadinessTrajectoryPoint[]
  currentScore: number
  previousScore: number | null
}

export function ReadinessTrajectory({ data, currentScore, previousScore }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(currentScore)))
  const trend = !previousScore || currentScore === previousScore ? 'flat'
    : currentScore > previousScore ? 'up' : 'down'
  const delta = previousScore ? Math.abs(Math.round(currentScore - previousScore)) : 0

  return (
    <Card className="border-border bg-white p-2 relative">
      <RichInfoPopover title="Readiness Trajectory" description="Your composite readiness score over time. The green line is the passing threshold." />
      <CardHeader className="p-2 pt-1">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Readiness Trajectory
            </CardTitle>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={cn(
                'text-xl font-extrabold tabular-nums',
                getScoreColor(clamped).text
              )}>
                {clamped}%
              </span>
              <div
                className={cn(
                  'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold uppercase',
                  trend === 'up' && 'bg-green-50 text-green-700',
                  trend === 'down' && 'bg-red-50 text-red-700',
                  trend === 'flat' && 'bg-primary/10',
                )}
                style={trend === 'flat' ? { color: 'var(--muted-foreground)' } : undefined}
              >
                {trend === 'up' && <SCIcon icon={TrendUp} size='xs' />}
                {trend === 'down' && <SCIcon icon={TrendDown} size='xs' />}
                {trend === 'flat' && <SCIcon icon={Minus} size='xs' />}
                <span>{trend === 'flat' ? 'Stable' : `${trend === 'up' ? '+' : '-'}${delta}%`}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 uppercase tracking-wider">
            <SCIcon icon={Target} size='xs' /> Target: 75%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length < 2 ? (
          <div className="h-[120px] flex items-center justify-center">
            <p className="text-xs text-center leading-snug max-w-[200px] text-muted-foreground">
              Complete more quizzes to see your readiness trajectory here.
            </p>
          </div>
        ) : (
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#D4DAE3" strokeDasharray="3 3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4A5568', fontSize: 11 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #D4DAE3', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '12px' }} />
                <ReferenceLine y={75} stroke="#2D9F6F" strokeDasharray="4 4" strokeWidth={1} />
                <Area name="Readiness" type="monotone" dataKey="score" stroke="#1B3FC4" strokeWidth={1.5}
                  fillOpacity={0.08} fill="#1B3FC4"
                  dot={{ r: 2, fill: '#1B3FC4', stroke: '#fff', strokeWidth: 1 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
