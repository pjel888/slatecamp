'use client'

import { TrendUp, TrendDown, Minus, Target } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import {
  ResponsiveContainer, ComposedChart, Area, Line as _Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useChartColors } from '@/hooks/useChartColors'
import { getScoreColor } from '@/components/shared/score-display'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import type { ReadinessTrajectoryPoint } from '@/lib/actions/analytics'

interface Props {
  data: ReadinessTrajectoryPoint[]
  currentScore: number
  previousScore: number | null
}

export function ReadinessTrajectory({ data, currentScore, previousScore }: Props) {
  const colors = useChartColors()
  const clamped = Math.max(0, Math.min(100, Math.round(currentScore)))
  const trend = !previousScore || currentScore === previousScore ? 'flat'
    : currentScore > previousScore ? 'up' : 'down'
  const delta = previousScore ? Math.abs(Math.round(currentScore - previousScore)) : 0

  return (
    <Card className="border-border bg-card p-2 relative">
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
                  trend === 'up' && 'bg-success/10 text-success',
                  trend === 'down' && 'bg-destructive/10 text-destructive',
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
          <div className="flex items-center gap-1 text-[11px] font-bold text-success uppercase tracking-wider">
            <SCIcon icon={Target} size='xs' /> Target: 75%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {data.length < 2 ? (
          <ChartEmptyState
            title="No readiness data yet"
            description="Complete a few quizzes to see your readiness trajectory."
            height="h-[220px]"
          />
        ) : (
          <div className="h-[120px]">
            <div role="img" aria-label="Readiness score trajectory chart showing progress over time">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke={colors.gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: colors.axisTickFill, fontSize: 11 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: `1px solid ${colors.tooltipBorder}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '12px' }} />
                <ReferenceLine y={75} stroke={colors.referenceLine} strokeDasharray="4 4" strokeWidth={1} />
                <Area name="Readiness" type="monotone" dataKey="score" stroke={colors.primary} strokeWidth={1.5}
                  fillOpacity={0.08} fill={colors.primary}
                  dot={{ r: 2, fill: colors.primary, stroke: '#fff', strokeWidth: 1 }} />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
