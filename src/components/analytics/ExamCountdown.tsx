'use client'

import { CalendarBlank, Target, Warning, ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/components/shared/score-display'
import type { ExamCountdownData } from '@/lib/actions/analytics/chart-data'

interface Props {
  data: ExamCountdownData
}

export const ExamCountdown = ({ data }: Props) => {
  const hasExamDate = data.daysUntilExam !== null && data.daysUntilExam > 0
  const urgency = hasExamDate
    ? data.daysUntilExam! <= 14 ? 'critical'
    : data.daysUntilExam! <= 30 ? 'soon'
    : 'comfortable'
    : null

  const urgencyColor = urgency === 'critical' ? '#D64545'
    : urgency === 'soon' ? '#D4951A'
    : '#2D9F6F'

  return (
    <Card className="border-border bg-card p-2 relative h-full">
      <RichInfoPopover
        title="Exam Countdown"
        description="Summary of your exam readiness: days remaining, readiness score, areas needing attention, and projected outcomes."
      />
      <CardHeader className="p-2 pt-1">
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Exam Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {!hasExamDate ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 py-4">
            <SCIcon icon={CalendarBlank} size="md" className="text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Set your target exam date in Settings to unlock your countdown and projections.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Days remaining */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl font-extrabold tabular-nums"
                  style={{ color: urgencyColor }}
                >
                  {data.daysUntilExam}
                </span>
                <span className="text-xs font-medium" style={{ color: '#4A5568' }}>
                  days until exam
                </span>
              </div>
              {data.targetExamDate && (
                <span className="text-[11px] tabular-nums" style={{ color: '#8896A7' }}>
                  {new Date(data.targetExamDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Readiness Score */}
            <div className="flex items-center justify-between rounded-md px-3 py-2" style={{ backgroundColor: '#F8F7F5' }}>
              <div className="flex items-center gap-2">
                <SCIcon icon={Target} size="xs" className="text-muted-foreground" />
                <span className="text-xs font-medium" style={{ color: '#4A5568' }}>Readiness</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn('text-lg font-extrabold tabular-nums', getScoreColor(data.readinessScore).text)}>
                  {data.readinessScore}%
                </span>
                <div
                  className={cn(
                    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    data.readinessTrend === 'up' && 'bg-success/10 text-success',
                    data.readinessTrend === 'down' && 'bg-destructive/10 text-destructive',
                    data.readinessTrend === 'flat' && 'bg-muted text-muted-foreground',
                  )}
                >
                  {data.readinessTrend === 'up' && <SCIcon icon={ArrowUp} size="xs" />}
                  {data.readinessTrend === 'down' && <SCIcon icon={ArrowDown} size="xs" />}
                  {data.readinessTrend === 'flat' && <SCIcon icon={Minus} size="xs" />}
                  {data.readinessTrend === 'flat' ? 'Stable' : `${data.readinessTrend === 'up' ? '+' : '-'}${data.readinessDelta}%`}
                </div>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md px-3 py-2" style={{ backgroundColor: data.redNodeCount > 0 ? '#FDF0F0' : '#EDFAF4' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8896A7' }}>
                  Needs work
                </p>
                <p className="text-sm font-bold tabular-nums" style={{ color: data.redNodeCount > 0 ? '#D64545' : '#2D9F6F' }}>
                  {data.redNodeCount} {data.redNodeCount === 1 ? 'topic' : 'topics'}
                </p>
              </div>
              <div className="rounded-md px-3 py-2" style={{ backgroundColor: data.unexploredCount > 0 ? '#FEF8ED' : '#EDFAF4' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8896A7' }}>
                  Unexplored
                </p>
                <p className="text-sm font-bold tabular-nums" style={{ color: data.unexploredCount > 0 ? '#D4951A' : '#2D9F6F' }}>
                  {data.unexploredCount} {data.unexploredCount === 1 ? 'topic' : 'topics'}
                </p>
              </div>
            </div>

            {/* Daily dose + pass probability */}
            <div className="flex items-center justify-between rounded-md px-3 py-2 border" style={{ borderColor: '#D4DAE3' }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8896A7' }}>
                  Daily dose
                </p>
                <p className="text-sm font-bold tabular-nums" style={{ color: '#1A2332' }}>
                  {data.dailyDoseNeeded} questions/day
                </p>
              </div>
              {data.projectedPassProbability !== null && (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8896A7' }}>
                    Pass probability
                  </p>
                  <p
                    className="text-sm font-bold tabular-nums"
                    style={{ color: data.projectedPassProbability >= 70 ? '#2D9F6F' : data.projectedPassProbability >= 50 ? '#D4951A' : '#D64545' }}
                  >
                    {data.projectedPassProbability}%
                  </p>
                </div>
              )}
            </div>

            {/* Urgency note */}
            {urgency === 'critical' && (
              <div className="flex items-start gap-1.5 rounded-md px-2 py-1.5 bg-destructive-50 text-destructive">
                <SCIcon icon={Warning} size="xs" className="mt-0.5 shrink-0" />
                <p className="text-xs leading-snug">
                  Less than 2 weeks remaining. Focus on red and unexplored topics for maximum impact.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
