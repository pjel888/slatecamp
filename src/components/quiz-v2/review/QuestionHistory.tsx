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
    return <span className="text-[#4A5568]">First encounter</span>
  }

  if (timesSeen >= 3 && timesCorrect === timesSeen) {
    return (
      <span className="text-[#4A5568]">
        Consistent ✓ —{' '}
        <span className="font-medium text-[#2D9F6F]">solid</span>
      </span>
    )
  }

  if (timesSeen >= 3 && timesWrong / timesSeen >= 0.7) {
    return (
      <span className="text-[#4A5568]">
        Seen {timesSeen}×:{' '}
        <span className="text-[#2D9F6F]">✓{timesCorrect}</span>{' '}
        <span className="text-[#D4951A]">✗{timesWrong}</span> —{' '}
        <span className="font-medium text-[#D4951A]">blindspot</span>
      </span>
    )
  }

  return (
    <span className="text-[#4A5568]">
      Seen {timesSeen}×:{' '}
      <span className="text-[#2D9F6F]">✓{timesCorrect}</span>{' '}
      <span className="text-[#D4951A]">✗{timesWrong}</span>
    </span>
  )
}

export const QuestionHistory = ({ stats }: QuestionHistoryProps) => {
  return (
    <div className="mt-3 pt-3 border-t border-[#D4DAE3]">
      <p className="text-[10px] uppercase tracking-wide text-[#8896A7] mb-1">
        Your history
      </p>
      <p className="text-[12px]">{getStatsLabel(stats)}</p>
      {stats.lastSeenAt && (
        <p className="text-[11px] text-[#8896A7] mt-0.5">
          Last seen: {getRelativeTime(stats.lastSeenAt)}
        </p>
      )}
    </div>
  )
}
