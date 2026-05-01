'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarBlank, Warning, Clock, ArrowRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'
// ── Types (inlined from deleted get-review-calendar.ts) ──────────────────────

export type ReviewUrgency = 'overdue' | 'due_today' | 'upcoming'

export interface ReviewCalendarTopic {
  topicId: string
  topicName: string
  urgency: ReviewUrgency
  predictedRecall: number
  optimalReviewAt: string | null
}

export interface ReviewCalendarDay {
  date: string
  label: string
  topics: ReviewCalendarTopic[]
}

export interface ReviewCalendarData {
  days: ReviewCalendarDay[]
  overdue: ReviewCalendarTopic[]
  summary: {
    overdueCount: number
    dueTodayCount: number
    upcomingCount: number
  }
}

// ── Urgency styling ──────────────────────────────────────────────────────────

const URGENCY_STYLES: Record<
  ReviewUrgency,
  { bg: string; text: string; border: string }
> = {
  overdue: {
    bg: 'bg-destructive-50',
    text: 'text-destructive',
    border: 'border-destructive/20',
  },
  due_today: {
    bg: 'bg-warning-50',
    text: 'text-warning',
    border: 'border-warning/20',
  },
  upcoming: {
    bg: 'bg-surface-focused',
    text: 'text-text-secondary',
    border: 'border-border',
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
          ? 'border-primary/30 bg-primary-50'
          : 'border-border bg-card',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[11px] font-semibold',
            isToday ? 'text-primary' : 'text-text-secondary',
          )}
        >
          {day.label}
        </span>
        {hasTopics && (
          <span className="text-[10px] text-muted-foreground tabular-nums">
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
            <span className="text-[10px] text-muted-foreground pl-0.5">
              +{overflow} more
            </span>
          )}
        </div>
      ) : (
        <span className="text-[10px] text-muted-foreground italic">Clear</span>
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
      color: 'text-destructive',
    })
  }
  if (summary.dueTodayCount > 0) {
    parts.push({
      count: summary.dueTodayCount,
      label: 'due today',
      color: 'text-warning',
    })
  }
  if (summary.upcomingCount > 0) {
    parts.push({
      count: summary.upcomingCount,
      label: 'upcoming',
      color: 'text-text-secondary',
    })
  }

  if (parts.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        All topics are in good shape. Keep it up.
      </p>
    )
  }

  return (
    <p className="text-xs text-text-secondary">
      {parts.map((part, i) => (
        <span key={part.label}>
          {i > 0 && <span className="text-muted-foreground"> &middot; </span>}
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
  const [_reviewModal, setReviewModal] = useState<{ topicId: string; topicName: string } | null>(null)
  const [hiddenTopics, setHiddenTopics] = useState<string[]>([])
  const hiddenTopicIds = new Set(hiddenTopics)

  const _handleModalClose = useCallback(() => {
    setReviewModal(null)
  }, [])

  const _handleModalComplete = useCallback(() => {
    setReviewModal(null)
    router.refresh()
  }, [router])

  const _handleModalEmpty = useCallback((topicId: string) => {
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
    <div className="rounded-md border border-border bg-card p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <SCIcon icon={CalendarBlank} size="xs" className="text-primary" />
          <h3 className="text-xs font-semibold text-foreground">
            Review Schedule
          </h3>
        </div>
        <SummaryHeader summary={data.summary} />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-50 text-success">
            <SCIcon icon={CalendarBlank} size="sm" />
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            Nothing due this week
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Complete a few sessions to build your review schedule.
          </p>
        </div>
      ) : (
        <>
          {/* Overdue alert */}
          {filteredOverdue.length > 0 && (
            <div className="flex items-start gap-1.5 rounded-md bg-destructive-50 border border-destructive/15 px-2 py-1.5 mb-1.5">
              <SCIcon
                icon={Warning}
                size="xs"
                className="text-destructive mt-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-destructive">
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
                    <span className="text-[10px] text-destructive/70 self-center">
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
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <SCIcon icon={Clock} size="xs" />
              <span>Based on your personal forgetting curves</span>
            </div>
            <button
              type="button"
              onClick={() => router.push(ROUTES.dashboard.quiz)}
              className="flex items-center gap-0.5 text-[11px] font-medium text-primary transition-colors duration-150 hover:text-primary-700"
            >
              Review all
              <SCIcon icon={ArrowRight} size="xs" />
            </button>
          </div>
        </>
      )}

      {/* Quick review modal removed (Pass 1 cleanup) */}
    </div>
  )
}
