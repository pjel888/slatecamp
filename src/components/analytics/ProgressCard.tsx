'use client'

import { useCallback } from 'react'
import { ArrowUp, ArrowDown, Minus, DownloadSimple, ShareNetwork } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card, CardContent } from '@/components/ui/card'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import type { ProgressReport } from '@/lib/actions/progress-report/generate'

interface Props {
  report: ProgressReport | null
}

const formatMinutes = (mins: number): string => {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const formatPeriod = (start: string, end: string): string => {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export const ProgressCard = ({ report }: Props) => {
  if (!report) {
    return (
      <ChartEmptyState
        title="No progress data"
        description="Your monthly progress report generates after a week of studying."
        height="h-[280px]"
      />
    )
  }
  const handleDownload = useCallback(async () => {
    try {
      // Use the clipboard API to copy as a screenshot prompt,
      // or fall back to copying the text summary
      const text = [
        `SlateCamp Monthly Progress`,
        `${formatPeriod(report.period.start, report.period.end)}`,
        `Questions: ${report.questionsAnswered}`,
        `Readiness: ${report.readinessScoreChange > 0 ? '+' : ''}${report.readinessScoreChange}%`,
        `Topics Improved: ${report.nodesImproved}`,
        `Study Time: ${formatMinutes(report.studyMinutes)}`,
        `Sessions: ${report.sessionsCompleted}`,
      ].join('\n')
      await navigator.clipboard.writeText(text)
      // Brief visual feedback could be added via state if needed
    } catch {
      // Clipboard not available — silent fallback
    }
  }, [report])

  const handleShare = useCallback(async () => {
    if (!navigator.share) return
    try {
      await navigator.share({
        title: 'My SlateCamp Progress',
        text: `This month: ${report.questionsAnswered} questions answered, ${report.nodesImproved} topics improved, ${formatMinutes(report.studyMinutes)} studied.`,
        url: window.location.href,
      })
    } catch {
      // Share cancelled or unavailable
    }
  }, [report])

  const rsChange = report.readinessScoreChange
  const rsDirection = rsChange > 0 ? 'up' : rsChange < 0 ? 'down' : 'flat'

  return (
    <Card className="border-border bg-card p-0 relative overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Monthly Progress
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {formatPeriod(report.period.start, report.period.end)}
            </p>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            SlateCamp
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Questions Answered */}
          <div className="rounded-md bg-surface-light px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Questions
            </p>
            <p className="text-lg font-extrabold text-foreground tabular-nums mt-0.5">
              {report.questionsAnswered.toLocaleString()}
            </p>
          </div>

          {/* Readiness Score Change */}
          <div className="rounded-md bg-surface-light px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Readiness
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-lg font-extrabold tabular-nums ${
                  rsDirection === 'up'
                    ? 'text-success'
                    : rsDirection === 'down'
                      ? 'text-destructive'
                      : 'text-foreground'
                }`}
              >
                {rsChange > 0 ? '+' : ''}{rsChange}%
              </span>
              <SCIcon
                icon={rsDirection === 'up' ? ArrowUp : rsDirection === 'down' ? ArrowDown : Minus}
                size="xs"
                className={
                  rsDirection === 'up'
                    ? 'text-success'
                    : rsDirection === 'down'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                }
              />
            </div>
          </div>

          {/* Topics Improved */}
          <div className="rounded-md bg-surface-light px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Topics Improved
            </p>
            <p className="text-lg font-extrabold text-foreground tabular-nums mt-0.5">
              {report.nodesImproved}
            </p>
          </div>

          {/* Study Time */}
          <div className="rounded-md bg-surface-light px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Study Time
            </p>
            <p className="text-lg font-extrabold text-foreground tabular-nums mt-0.5">
              {formatMinutes(report.studyMinutes)}
            </p>
          </div>
        </div>

        {/* Sessions */}
        <div className="mt-3 rounded-md bg-primary-50 px-3 py-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Sessions Completed
          </p>
          <p className="text-sm font-extrabold text-primary tabular-nums">
            {report.sessionsCompleted}
          </p>
        </div>
      </div>

      {/* Actions */}
      <CardContent className="px-4 pb-3 pt-0 flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors duration-150 hover:bg-surface-light"
        >
          <SCIcon icon={DownloadSimple} size="xs" />
          Copy Summary
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-sm border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-primary-700"
          >
            <SCIcon icon={ShareNetwork} size="xs" />
            Share
          </button>
        )}
      </CardContent>
    </Card>
  )
}
