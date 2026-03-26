'use server'

import { createClient, getUser } from '@/lib/supabase/server'

// ── Types ────────────────────────────────────────────────────────────────────

export type ReviewUrgency = 'overdue' | 'due_today' | 'upcoming'

export interface ReviewCalendarTopic {
  topicId: string
  topicName: string
  urgency: ReviewUrgency
  predictedRecall: number
  optimalReviewAt: string | null
}

export interface ReviewCalendarDay {
  date: string // ISO date string (YYYY-MM-DD)
  label: string // Display label: "Today", "Mon", "Tue", etc.
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

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const getDayLabel = (d: Date, todayKey: string): string => {
  const key = toDateKey(d)
  if (key === todayKey) return 'Today'

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (key === toDateKey(tomorrow)) return 'Tomorrow'

  return DAY_LABELS[d.getDay()]
}

// ── Main fetcher ─────────────────────────────────────────────────────────────

export const getReviewCalendarData = async (): Promise<ReviewCalendarData> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  const empty: ReviewCalendarData = {
    days: [],
    overdue: [],
    summary: { overdueCount: 0, dueTodayCount: 0, upcomingCount: 0 },
  }

  if (!user) return empty

  // Fetch mastery rows that have decay tracking data, joined with topic names
  const { data: rows, error } = await supabase
    .from('user_node_mastery')
    .select(
      'topic_id, current_mastery_weight, last_encountered, predicted_recall, optimal_review_at, decay_rate, taxonomy_tree(name)' as any,
    )
    .eq('user_id', user.id)
    .gt('total_attempts', 0)

  if (error || !rows) return empty

  const now = new Date()
  const todayKey = toDateKey(now)

  // Build 7-day scaffold
  const days: ReviewCalendarDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    return {
      date: toDateKey(d),
      label: getDayLabel(d, todayKey),
      topics: [],
    }
  })

  const dayMap = new Map(days.map((d) => [d.date, d]))

  const overdue: ReviewCalendarTopic[] = []
  let overdueCount = 0
  let dueTodayCount = 0
  let upcomingCount = 0

  for (const row of rows) {
    const r = row as Record<string, unknown>
    const topicName =
      ((r.taxonomy_tree as Record<string, unknown> | null)?.name as string) ??
      'Unknown Topic'
    const predictedRecall = (r.predicted_recall as number | null) ?? 1.0
    const optimalReviewAt = r.optimal_review_at as string | null
    const topicId = r.topic_id as string

    // Categorize by predicted recall
    let urgency: ReviewUrgency

    if (predictedRecall < 0.5) {
      urgency = 'overdue'
      overdueCount++
    } else if (predictedRecall <= 0.7) {
      urgency = 'due_today'
      dueTodayCount++
    } else if (predictedRecall > 0.85) {
      // Safe topics: skip to avoid clutter
      continue
    } else {
      // Between 0.7 and 0.85: upcoming
      urgency = 'upcoming'
      upcomingCount++
    }

    const topic: ReviewCalendarTopic = {
      topicId,
      topicName,
      urgency,
      predictedRecall,
      optimalReviewAt,
    }

    // Overdue items always shown in the overdue bucket and on "Today"
    if (urgency === 'overdue') {
      overdue.push(topic)
      const todayBucket = dayMap.get(todayKey)
      if (todayBucket) todayBucket.topics.push(topic)
      continue
    }

    // Due today: goes in today's bucket
    if (urgency === 'due_today') {
      const todayBucket = dayMap.get(todayKey)
      if (todayBucket) todayBucket.topics.push(topic)
      continue
    }

    // Upcoming: place on the optimal_review_at day if within 7 days
    if (optimalReviewAt) {
      const reviewDate = new Date(optimalReviewAt)
      const reviewKey = toDateKey(reviewDate)
      const bucket = dayMap.get(reviewKey)
      if (bucket) {
        bucket.topics.push(topic)
      }
    }
  }

  // Sort overdue by recall (lowest first — most urgent)
  overdue.sort((a, b) => a.predictedRecall - b.predictedRecall)

  // Sort each day's topics by urgency priority
  const urgencyOrder: Record<ReviewUrgency, number> = {
    overdue: 0,
    due_today: 1,
    upcoming: 2,
  }
  for (const day of days) {
    day.topics.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
  }

  return {
    days,
    overdue,
    summary: {
      overdueCount,
      dueTodayCount,
      upcomingCount,
    },
  }
}
