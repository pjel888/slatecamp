'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/components/shared/score-display'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopicBreakdownItem {
  topicName: string
  correct: number
  total: number
}

interface NextAction {
  label: string
  href: string
}

interface SessionResultsProps {
  sessionScore: number
  questionsTotal: number
  questionsCorrect: number
  timeElapsed: number
  previousScore?: number
  topicBreakdown: TopicBreakdownItem[]
  nextAction: NextAction
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const getScoreTextClass = (score: number): string => {
  if (score >= 70) return 'text-success'
  if (score >= 40) return 'text-foreground'
  return 'text-muted-foreground'
}

const getDeltaDisplay = (
  current: number,
  previous: number,
): { text: string; className: string } => {
  const diff = current - previous
  if (diff > 0) return { text: `+${diff}% vs last session`, className: 'text-success' }
  if (diff < 0) return { text: `${diff}% vs last session`, className: 'text-muted-foreground' }
  return { text: 'Same as last session', className: 'text-muted-foreground' }
}

// ─── Topic Bar ────────────────────────────────────────────────────────────────

const TopicBar = ({ topicName, correct, total }: TopicBreakdownItem) => {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const colors = getScoreColor(pct)

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-sm text-foreground truncate"
        style={{ minWidth: 0, flex: '1 1 0' }}
        title={topicName}
      >
        {topicName}
      </span>
      <div className="w-28 shrink-0 bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', colors.bg)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-xs tabular-nums font-medium shrink-0 w-10 text-right', colors.text)}>
        {correct}/{total}
      </span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const SessionResultsPanel = ({
  sessionScore,
  questionsTotal,
  questionsCorrect,
  timeElapsed,
  previousScore,
  topicBreakdown,
  nextAction,
}: SessionResultsProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(sessionScore)))
  const scoreTextClass = getScoreTextClass(clamped)
  const delta = previousScore != null ? getDeltaDisplay(clamped, previousScore) : null
  const questionsIncorrect = questionsTotal - questionsCorrect

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      {/* ── Score section ─────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 text-center border-b border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-[1.5px] mb-2">
          Session Score
        </p>
        <span className={cn('text-4xl font-bold tabular-nums', scoreTextClass)}>
          {clamped}%
        </span>

        {/* Delta */}
        {delta && (
          <p className={cn('text-xs mt-1', delta.className)}>
            {delta.text}
          </p>
        )}

        {/* Stats row */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {questionsCorrect}
            </span>
            <span className="text-[11px] text-muted-foreground">Correct</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {questionsIncorrect}
            </span>
            <span className="text-[11px] text-muted-foreground">To review</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {formatTime(timeElapsed)}
            </span>
            <span className="text-[11px] text-muted-foreground">Time</span>
          </div>
        </div>
      </div>

      {/* ── Topic breakdown ───────────────────────────────────────────────── */}
      {topicBreakdown.length > 0 && (
        <div className="px-6 py-4 border-b border-border">
          <p className="text-[11px] text-muted-foreground uppercase tracking-[1.5px] mb-3">
            By Topic
          </p>
          <div className="space-y-2.5">
            {topicBreakdown.map((item) => (
              <TopicBar
                key={item.topicName}
                topicName={item.topicName}
                correct={item.correct}
                total={item.total}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Primary CTA ───────────────────────────────────────────────────── */}
      <div className="px-6 py-4">
        <Link
          href={nextAction.href}
          className="inline-flex w-full items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700"
        >
          {nextAction.label}
        </Link>
      </div>
    </div>
  )
}

export { SessionResultsPanel }
export type { SessionResultsProps }
