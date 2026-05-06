'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarBlank, Warning, Clock, ArrowRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/routes'

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

const URGENCY_STYLES: Record<ReviewUrgency, { text: string }> = {
  overdue: {
    text: 'text-destructive',
  },
  due_today: {
    text: 'text-warning',
  },
  upcoming: {
    text: 'text-muted-foreground',
  },
}

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
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex max-w-full items-center gap-1 truncate rounded-full px-0 py-0.5',
        'text-[11px] font-medium leading-tight transition-colors hover:text-foreground',
        style.text,
      )}
      title={`${topic.topicName} — recall ${Math.round(topic.predictedRecall * 100)}%`}
    >
      <span className='truncate'>{topic.topicName}</span>
    </button>
  )
}

const CountPill = ({
  count,
  label,
  tone,
}: {
  count: number
  label: string
  tone: 'danger' | 'warning' | 'muted'
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-0 py-0.5 text-[11px] font-semibold tabular-nums',
      tone === 'danger' && 'text-destructive',
      tone === 'warning' && 'text-warning',
      tone === 'muted' && 'text-muted-foreground',
    )}
  >
    {count} {label}
  </span>
)

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
  const maxVisible = 2
  const visibleTopics = day.topics.slice(0, maxVisible)
  const overflow = day.topics.length - maxVisible

  return (
    <div
      className={cn(
        'flex min-h-[96px] min-w-0 flex-col gap-1.5 rounded-md p-2',
        isToday ? 'text-primary' : '',
      )}
    >
      <div className='flex items-start justify-between gap-1'>
        <div className='min-w-0'>
          <p
            className={cn(
              'truncate text-[11px] font-semibold leading-none',
              isToday ? 'text-primary' : 'text-foreground',
            )}
          >
            {day.label}
          </p>
          <p className='mt-1 text-[10px] leading-none text-muted-foreground'>
            {hasTopics ? `${day.topics.length} due` : 'Clear'}
          </p>
        </div>
      </div>

      {hasTopics ? (
        <div className='flex min-h-0 flex-col gap-1 overflow-hidden'>
          {visibleTopics.map((topic) => (
            <TopicPill
              key={topic.topicId}
              topic={topic}
              onClick={() => onTopicClick(topic.topicId)}
            />
          ))}
          {overflow > 0 && (
            <span className='px-2 text-[10px] font-medium text-muted-foreground'>
              +{overflow} more
            </span>
          )}
        </div>
      ) : null}
    </div>
  )
}

const SummaryHeader = ({ summary }: { summary: ReviewCalendarData['summary'] }) => {
  if (
    summary.overdueCount === 0 &&
    summary.dueTodayCount === 0 &&
    summary.upcomingCount === 0
  ) {
    return (
      <span className='rounded-full px-0 py-0.5 text-[11px] font-semibold text-success'>
        Clear this week
      </span>
    )
  }

  return (
    <div className='flex flex-wrap items-center justify-end gap-1.5'>
      {summary.overdueCount > 0 && (
        <CountPill count={summary.overdueCount} label='overdue' tone='danger' />
      )}
      {summary.dueTodayCount > 0 && (
        <CountPill count={summary.dueTodayCount} label='today' tone='warning' />
      )}
      {summary.upcomingCount > 0 && (
        <CountPill count={summary.upcomingCount} label='upcoming' tone='muted' />
      )}
    </div>
  )
}

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

  const filteredOverdue = data.overdue.filter((t) => !hiddenTopicIds.has(t.topicId))
  const filteredDays = data.days.map((day) => ({
    ...day,
    topics: day.topics.filter((t) => !hiddenTopicIds.has(t.topicId)),
  }))

  const isEmpty =
    filteredOverdue.length === 0 &&
    filteredDays.every((d) => d.topics.length === 0)

  return (
    <section className='flex min-h-0 flex-col rounded-md p-3'>
      <div className='flex shrink-0 items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-primary'>
            <SCIcon icon={CalendarBlank} size='xs' />
          </span>
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold leading-tight text-foreground'>
              Review Schedule
            </h3>
            <p className='text-[11px] text-muted-foreground'>
              Spaced repetition targets for the next 7 days
            </p>
          </div>
        </div>
        <SummaryHeader summary={data.summary} />
      </div>

      {isEmpty ? (
        <div className='flex flex-col items-center justify-center py-8 text-center'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full text-success'>
            <SCIcon icon={CalendarBlank} size='sm' />
          </div>
          <p className='mt-2 text-sm font-medium text-foreground'>
            Nothing due this week
          </p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Complete a few sessions to build your review schedule.
          </p>
        </div>
      ) : (
        <div className='mt-3 flex min-h-0 flex-col gap-3'>
          {filteredOverdue.length > 0 && (
            <div className='shrink-0 rounded-md px-0 py-2'>
              <div className='flex items-start gap-2'>
                <SCIcon
                  icon={Warning}
                  size='xs'
                  className='mt-0.5 shrink-0 text-destructive'
                />
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-semibold text-destructive'>
                    {filteredOverdue.length} topic{filteredOverdue.length !== 1 ? 's' : ''} need review — recall has dropped below 50%
                  </p>
                  <div className='mt-1.5 flex max-h-[50px] flex-wrap gap-1 overflow-hidden'>
                    {filteredOverdue.slice(0, 6).map((topic) => (
                      <TopicPill
                        key={topic.topicId}
                        topic={topic}
                        onClick={() => handleTopicClick(topic.topicId)}
                      />
                    ))}
                    {filteredOverdue.length > 6 && (
                      <span className='self-center px-1 text-[10px] font-medium text-destructive/80'>
                        +{filteredOverdue.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7'>
            {filteredDays.map((day, i) => (
              <DayColumn
                key={day.date}
                day={day}
                isToday={i === 0}
                onTopicClick={handleTopicClick}
              />
            ))}
          </div>

          <div className='flex shrink-0 items-center justify-between gap-3 pt-1'>
            <div className='flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground'>
              <SCIcon icon={Clock} size='xs' />
              <span className='truncate'>Based on your personal forgetting curves</span>
            </div>
            <button
              type='button'
              onClick={() => router.push(ROUTES.dashboard.quiz)}
              className='inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-primary-700'
            >
              Review all
              <SCIcon icon={ArrowRight} size='xs' />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
