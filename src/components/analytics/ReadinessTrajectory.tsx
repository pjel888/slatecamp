'use client'
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
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
            <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
              Readiness Trajectory
            </CardTitle>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={cn(
                'text-4xl font-bold tracking-tighter',
                clamped < 50 ? 'text-red-600' : clamped < 75 ? 'text-amber-600' : 'text-green-600'
              )}>
                {clamped}%
              </span>
              <div className={cn(
                'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold uppercase',
                trend === 'up' && 'bg-green-50 text-green-700',
                trend === 'down' && 'bg-red-50 text-red-700',
                trend === 'flat' && 'bg-zinc-50 text-zinc-500',
              )}>
                {trend === 'up' && <TrendingUp className="h-2.5 w-2.5" />}
                {trend === 'down' && <TrendingDown className="h-2.5 w-2.5" />}
                {trend === 'flat' && <Minus className="h-2.5 w-2.5" />}
                <span>{trend === 'flat' ? 'Stable' : `${trend === 'up' ? '+' : '-'}${delta}%`}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 uppercase tracking-wider">
            <Target className="h-2.5 w-2.5" /> Target: 75%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length < 2 ? (
          <div className="h-[120px] flex items-center justify-center">
            <p className="text-xs text-zinc-400 text-center leading-snug max-w-[200px]">
              Complete more quizzes to see your readiness trajectory here.
            </p>
          </div>
        ) : (
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#656d76' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '11px' }} />
                <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} />
                <Area name="Readiness" type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={1.5}
                  fillOpacity={1} fill="url(#trajGrad)"
                  dot={{ r: 2, fill: '#2563eb', stroke: '#fff', strokeWidth: 1 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
