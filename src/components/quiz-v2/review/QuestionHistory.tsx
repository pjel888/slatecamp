'use client'

import type { QuestionHistoryStats } from '@/types/quiz-config'

interface QuestionHistoryProps {
  stats: QuestionHistoryStats
}

const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

const getStatsLabel = (stats: QuestionHistoryStats): React.ReactNode => {
  const { timesSeen, timesCorrect, timesWrong } = stats

  if (timesSeen === 1) {
    return <span className="text-text-secondary">First encounter</span>
  }

  if (timesSeen >= 3 && timesCorrect === timesSeen) {
    return (
      <span className="text-text-secondary">
        Consistent ✓ —{' '}
        <span className="font-medium text-success">solid</span>
      </span>
    )
  }

  if (timesSeen >= 3 && timesWrong / timesSeen >= 0.7) {
    return (
      <span className="text-text-secondary">
        Seen {timesSeen}×:{' '}
        <span className="text-success">✓{timesCorrect}</span>{' '}
        <span className="text-warning">✗{timesWrong}</span> —{' '}
        <span className="font-medium text-warning">blindspot</span>
      </span>
    )
  }

  return (
    <span className="text-text-secondary">
      Seen {timesSeen}×:{' '}
      <span className="text-success">✓{timesCorrect}</span>{' '}
      <span className="text-warning">✗{timesWrong}</span>
    </span>
  )
}

export const QuestionHistory = ({ stats }: QuestionHistoryProps) => {
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
        Your history
      </p>
      <p className="text-[12px]">{getStatsLabel(stats)}</p>
      {stats.lastSeenAt && (
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Last seen: {getRelativeTime(stats.lastSeenAt)}
        </p>
      )}
    </div>
  )
}
