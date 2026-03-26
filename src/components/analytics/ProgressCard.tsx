'use client'

import { useCallback } from 'react'
import { ArrowUp, ArrowDown, Minus, DownloadSimple, ShareNetwork } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card, CardContent } from '@/components/ui/card'
import type { ProgressReport } from '@/lib/actions/progress-report/generate'

interface Props {
  report: ProgressReport
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
    <Card className="border-border bg-white p-0 relative overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8896A7]">
              Monthly Progress
            </p>
            <p className="text-xs text-[#4A5568] mt-0.5">
              {formatPeriod(report.period.start, report.period.end)}
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#8896A7] tracking-wider uppercase">
            SlateCamp
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Questions Answered */}
          <div className="rounded-md bg-[#F8F7F5] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8896A7]">
              Questions
            </p>
            <p className="text-lg font-extrabold text-[#1A2332] tabular-nums mt-0.5">
              {report.questionsAnswered.toLocaleString()}
            </p>
          </div>

          {/* Readiness Score Change */}
          <div className="rounded-md bg-[#F8F7F5] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8896A7]">
              Readiness
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-lg font-extrabold tabular-nums ${
                  rsDirection === 'up'
                    ? 'text-[#2D9F6F]'
                    : rsDirection === 'down'
                      ? 'text-[#D64545]'
                      : 'text-[#1A2332]'
                }`}
              >
                {rsChange > 0 ? '+' : ''}{rsChange}%
              </span>
              <SCIcon
                icon={rsDirection === 'up' ? ArrowUp : rsDirection === 'down' ? ArrowDown : Minus}
                size="xs"
                className={
                  rsDirection === 'up'
                    ? 'text-[#2D9F6F]'
                    : rsDirection === 'down'
                      ? 'text-[#D64545]'
                      : 'text-[#8896A7]'
                }
              />
            </div>
          </div>

          {/* Topics Improved */}
          <div className="rounded-md bg-[#F8F7F5] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8896A7]">
              Topics Improved
            </p>
            <p className="text-lg font-extrabold text-[#1A2332] tabular-nums mt-0.5">
              {report.nodesImproved}
            </p>
          </div>

          {/* Study Time */}
          <div className="rounded-md bg-[#F8F7F5] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8896A7]">
              Study Time
            </p>
            <p className="text-lg font-extrabold text-[#1A2332] tabular-nums mt-0.5">
              {formatMinutes(report.studyMinutes)}
            </p>
          </div>
        </div>

        {/* Sessions */}
        <div className="mt-3 rounded-md bg-[#EEF2FC] px-3 py-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1B3FC4]">
            Sessions Completed
          </p>
          <p className="text-sm font-extrabold text-[#1B3FC4] tabular-nums">
            {report.sessionsCompleted}
          </p>
        </div>
      </div>

      {/* Actions */}
      <CardContent className="px-4 pb-3 pt-0 flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-sm border border-[#D4DAE3] bg-white px-3 py-1.5 text-xs font-semibold text-[#4A5568] transition-colors duration-150 hover:bg-[#F8F7F5]"
        >
          <SCIcon icon={DownloadSimple} size="xs" />
          Copy Summary
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-sm border border-[#1B3FC4] bg-[#1B3FC4] px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#1535A8]"
          >
            <SCIcon icon={ShareNetwork} size="xs" />
            Share
          </button>
        )}
      </CardContent>
    </Card>
  )
}
