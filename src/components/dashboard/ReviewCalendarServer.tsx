import { createClient, getUser } from '@/lib/supabase/server'
import { ReviewCalendar, type ReviewCalendarData, type ReviewCalendarTopic, type ReviewUrgency } from './ReviewCalendar'

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

// ── Data fetcher ─────────────────────────────────────────────────────────────

const getReviewCalendarData = async (): Promise<ReviewCalendarData> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  const empty: ReviewCalendarData = {
    days: [],
    overdue: [],
    summary: { overdueCount: 0, dueTodayCount: 0, upcomingCount: 0 },
  }

  if (!user) return empty

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

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    return { date: toDateKey(d), label: getDayLabel(d, todayKey), topics: [] as ReviewCalendarTopic[] }
  })

  const dayMap = new Map(days.map((d) => [d.date, d]))
  const overdue: ReviewCalendarTopic[] = []
  let overdueCount = 0
  let dueTodayCount = 0
  let upcomingCount = 0

  for (const row of rows) {
    const r = row as Record<string, unknown>
    const topicName = ((r.taxonomy_tree as Record<string, unknown> | null)?.name as string) ?? 'Unknown Topic'
    const predictedRecall = (r.predicted_recall as number | null) ?? 1.0
    const optimalReviewAt = r.optimal_review_at as string | null
    const topicId = r.topic_id as string

    let urgency: ReviewUrgency

    if (predictedRecall < 0.5) {
      urgency = 'overdue'
      overdueCount++
    } else if (predictedRecall <= 0.7) {
      urgency = 'due_today'
      dueTodayCount++
    } else if (predictedRecall > 0.85) {
      continue
    } else {
      urgency = 'upcoming'
      upcomingCount++
    }

    const topic: ReviewCalendarTopic = { topicId, topicName, urgency, predictedRecall, optimalReviewAt }

    if (urgency === 'overdue') {
      overdue.push(topic)
      const todayBucket = dayMap.get(todayKey)
      if (todayBucket) todayBucket.topics.push(topic)
      continue
    }

    if (urgency === 'due_today') {
      const todayBucket = dayMap.get(todayKey)
      if (todayBucket) todayBucket.topics.push(topic)
      continue
    }

    if (optimalReviewAt) {
      const reviewKey = toDateKey(new Date(optimalReviewAt))
      const bucket = dayMap.get(reviewKey)
      if (bucket) bucket.topics.push(topic)
    }
  }

  overdue.sort((a, b) => a.predictedRecall - b.predictedRecall)

  const urgencyOrder: Record<ReviewUrgency, number> = { overdue: 0, due_today: 1, upcoming: 2 }
  for (const day of days) {
    day.topics.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
  }

  return { days, overdue, summary: { overdueCount, dueTodayCount, upcomingCount } }
}

// ── Component ────────────────────────────────────────────────────────────────

export const ReviewCalendarServer = async () => {
  const data = await getReviewCalendarData()
  return <ReviewCalendar data={data} />
}
