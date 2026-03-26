'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarBlank, Warning, Clock, ArrowRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { QuickReviewModal } from './QuickReviewModal'
import type {
  ReviewCalendarData,
  ReviewCalendarDay,
  ReviewCalendarTopic,
  ReviewUrgency,
} from '@/lib/actions/analytics/get-review-calendar'

// ── Urgency styling ──────────────────────────────────────────────────────────

const URGENCY_STYLES: Record<
  ReviewUrgency,
  { bg: string; text: string; border: string }
> = {
  overdue: {
    bg: 'bg-[#FDF0F0]',
    text: 'text-[#D64545]',
    border: 'border-[#D64545]/20',
  },
  due_today: {
    bg: 'bg-[#FEF8ED]',
    text: 'text-[#D4951A]',
    border: 'border-[#D4951A]/20',
  },
  upcoming: {
    bg: 'bg-[#F5F7FA]',
    text: 'text-[#4A5568]',
    border: 'border-[#D4DAE3]',
  },
}

// ── Topic pill ───────────────────────────────────────────────────────────────

const TopicPill = ({
  topic,
  onClick,
}: {
  topic: ReviewCalendarTopic
  onClick: () => void
}) => {
  const style = URGENCY_STYLES[topic.urgency]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5',
        'text-[11px] font-medium leading-tight truncate max-w-full',
        'transition-all duration-150 ease-out hover:shadow-sm cursor-pointer',
        style.bg,
        style.text,
        style.border,
      )}
      title={`${topic.topicName} — recall ${Math.round(topic.predictedRecall * 100)}%`}
    >
      <span className="truncate">{topic.topicName}</span>
    </button>
  )
}

// ── Day column ───────────────────────────────────────────────────────────────

const DayColumn = ({
  day,
  isToday,
  onTopicClick,
}: {
  day: ReviewCalendarDay
  isToday: boolean
  onTopicClick: (topicId: string) => void
}) => {
  const hasTopics = day.topics.length > 0
  const MAX_VISIBLE = 3
  const visibleTopics = day.topics.slice(0, MAX_VISIBLE)
  const overflow = day.topics.length - MAX_VISIBLE

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-md border p-1.5 min-w-0',
        isToday
          ? 'border-[#1B3FC4]/30 bg-[#EEF2FC]'
          : 'border-[#D4DAE3] bg-white',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[11px] font-semibold',
            isToday ? 'text-[#1B3FC4]' : 'text-[#4A5568]',
          )}
        >
          {day.label}
        </span>
        {hasTopics && (
          <span className="text-[10px] text-[#8896A7] tabular-nums">
            {day.topics.length}
          </span>
        )}
      </div>

      {hasTopics ? (
        <div className="flex flex-col gap-0.5">
          {visibleTopics.map((topic) => (
            <TopicPill
              key={topic.topicId}
              topic={topic}
              onClick={() => onTopicClick(topic.topicId)}
            />
          ))}
          {overflow > 0 && (
            <span className="text-[10px] text-[#8896A7] pl-0.5">
              +{overflow} more
            </span>
          )}
        </div>
      ) : (
        <span className="text-[10px] text-[#8896A7] italic">Clear</span>
      )}
    </div>
  )
}

// ── Summary header ───────────────────────────────────────────────────────────

const SummaryHeader = ({
  summary,
}: {
  summary: ReviewCalendarData['summary']
}) => {
  const parts: { count: number; label: string; color: string }[] = []

  if (summary.overdueCount > 0) {
    parts.push({
      count: summary.overdueCount,
      label: 'overdue',
      color: 'text-[#D64545]',
    })
  }
  if (summary.dueTodayCount > 0) {
    parts.push({
      count: summary.dueTodayCount,
      label: 'due today',
      color: 'text-[#D4951A]',
    })
  }
  if (summary.upcomingCount > 0) {
    parts.push({
      count: summary.upcomingCount,
      label: 'upcoming',
      color: 'text-[#4A5568]',
    })
  }

  if (parts.length === 0) {
    return (
      <p className="text-xs text-[#8896A7]">
        All topics are in good shape. Keep it up.
      </p>
    )
  }

  return (
    <p className="text-xs text-[#4A5568]">
      {parts.map((part, i) => (
        <span key={part.label}>
          {i > 0 && <span className="text-[#8896A7]"> &middot; </span>}
          <span className={cn('font-semibold tabular-nums', part.color)}>
            {part.count}
          </span>{' '}
          {part.label}
        </span>
      ))}
    </p>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

interface ReviewCalendarProps {
  data: ReviewCalendarData
}

export const ReviewCalendar = ({ data }: ReviewCalendarProps) => {
  const router = useRouter()
  const [reviewModal, setReviewModal] = useState<{ topicId: string; topicName: string } | null>(null)
  const [hiddenTopics, setHiddenTopics] = useState<string[]>([])
  const hiddenTopicIds = new Set(hiddenTopics)

  const handleModalClose = useCallback(() => {
    setReviewModal(null)
  }, [])

  const handleModalComplete = useCallback(() => {
    setReviewModal(null)
    router.refresh()
  }, [router])

  const handleModalEmpty = useCallback((topicId: string) => {
    setHiddenTopics((prev) => (
      prev.includes(topicId) ? prev : [...prev, topicId]
    ))
    setReviewModal(null)
    router.refresh()
  }, [router])

  const handleTopicClick = (topicId: string) => {
    // Find topic name from the data
    const allTopics = [
      ...data.overdue,
      ...data.days.flatMap((d) => d.topics),
    ]
    const topic = allTopics.find((t) => t.topicId === topicId)
    setReviewModal({
      topicId,
      topicName: topic?.topicName ?? 'Review',
    })
  }

  // Filter out topics the user dismissed (no questions available)
  const filteredOverdue = data.overdue.filter((t) => !hiddenTopicIds.has(t.topicId))
  const filteredDays = data.days.map((day) => ({
    ...day,
    topics: day.topics.filter((t) => !hiddenTopicIds.has(t.topicId)),
  }))

  const isEmpty =
    filteredOverdue.length === 0 &&
    filteredDays.every((d) => d.topics.length === 0)

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-white p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <SCIcon icon={CalendarBlank} size="xs" className="text-[#1B3FC4]" />
          <h3 className="text-xs font-semibold text-[#1A2332]">
            Review Schedule
          </h3>
        </div>
        <SummaryHeader summary={data.summary} />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDFAF4] text-[#2D9F6F]">
            <SCIcon icon={CalendarBlank} size="sm" />
          </div>
          <p className="mt-2 text-sm font-medium text-[#1A2332]">
            Nothing due this week
          </p>
          <p className="mt-0.5 text-xs text-[#8896A7]">
            Complete a few sessions to build your review schedule.
          </p>
        </div>
      ) : (
        <>
          {/* Overdue alert */}
          {filteredOverdue.length > 0 && (
            <div className="flex items-start gap-1.5 rounded-md bg-[#FDF0F0] border border-[#D64545]/15 px-2 py-1.5 mb-1.5">
              <SCIcon
                icon={Warning}
                size="xs"
                className="text-[#D64545] mt-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#D64545]">
                  {filteredOverdue.length} topic{filteredOverdue.length !== 1 ? 's' : ''} need
                  review — recall has dropped below 50%
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {filteredOverdue.slice(0, 5).map((t) => (
                    <TopicPill
                      key={t.topicId}
                      topic={t}
                      onClick={() => handleTopicClick(t.topicId)}
                    />
                  ))}
                  {filteredOverdue.length > 5 && (
                    <span className="text-[10px] text-[#D64545]/70 self-center">
                      +{filteredOverdue.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7-day grid */}
          <div className="grid grid-cols-7 gap-1">
            {filteredDays.map((day, i) => (
              <DayColumn
                key={day.date}
                day={day}
                isToday={i === 0}
                onTopicClick={handleTopicClick}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#D4DAE3]">
            <div className="flex items-center gap-1 text-[10px] text-[#8896A7]">
              <SCIcon icon={Clock} size="xs" />
              <span>Based on your personal forgetting curves</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/testing')}
              className="flex items-center gap-0.5 text-[11px] font-medium text-[#1B3FC4] transition-colors duration-150 hover:text-[#1535A8]"
            >
              Review all
              <SCIcon icon={ArrowRight} size="xs" />
            </button>
          </div>
        </>
      )}

      {/* Quick review modal — inline quiz without leaving the dashboard */}
      {reviewModal && (
        <QuickReviewModal
          topicId={reviewModal.topicId}
          topicName={reviewModal.topicName}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
          onEmpty={handleModalEmpty}
        />
      )}
    </div>
  )
}
