'use server'

import { createClient } from '@/lib/supabase/server'

// ── Types ────────────────────────────────────────────────────────────────────

export interface DoseActivity {
  type: 'quiz' | 'wiki' | 'srs_review'
  config: Record<string, unknown>
  minutes: number
  reason: string
}

export interface DailyDose {
  activities: DoseActivity[]
  estimatedMinutes: number
  rationale: string
}

interface WeakNode {
  topic_id: string
  current_mastery_weight: number
  taxonomy_tree: { name: string; subject_area: string | null } | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

const clampMinutes = (total: number, budget: number): number =>
  Math.min(total, budget)

/** Get the topic name from a weak node, falling back gracefully */
const topicName = (node: WeakNode): string =>
  node.taxonomy_tree?.name ?? 'a topic area'

// ── Generator ────────────────────────────────────────────────────────────────

export const generateDailyDose = async (
  userId: string,
  timeBudgetMinutes?: number,
): Promise<DailyDose> => {
  const supabase = await createClient()
  const budget = timeBudgetMinutes ?? 45

  // Parallel fetch all signals
  const [
    weakNodesResult,
    overdueSrsResult,
    decayingNodesResult,
    examDateResult,
    recentTopicsResult,
    avgSessionResult,
  ] = await Promise.all([
    // 1. Weakest nodes
    supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, taxonomy_tree(name, subject_area)')
      .eq('user_id', userId)
      .gt('total_attempts', 0)
      .order('current_mastery_weight', { ascending: true })
      .limit(5),

    // 2. Overdue SRS cards
    supabase
      .from('user_srs_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lt('next_review_at', new Date().toISOString()),

    // 3. Decaying nodes (next_review_at overdue as proxy for predicted_recall < 0.7)
    supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, next_review_at, taxonomy_tree(name, subject_area)')
      .eq('user_id', userId)
      .lt('next_review_at', new Date().toISOString())
      .order('current_mastery_weight', { ascending: true })
      .limit(5),

    // 4. Exam date
    supabase
      .from('user_global_stats')
      .select('target_exam_date')
      .eq('user_id', userId)
      .maybeSingle(),

    // 5. Recent topics (last 3 days)
    supabase
      .from('user_interactions')
      .select('topic_id')
      .eq('user_id', userId)
      .gte('interaction_timestamp', new Date(Date.now() - THREE_DAYS_MS).toISOString())
      .limit(100),

    // 6. Average session length (completed sessions, last 2 weeks)
    supabase
      .from('quiz_sessions')
      .select('started_at, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', new Date(Date.now() - TWO_WEEKS_MS).toISOString())
      .not('completed_at', 'is', null)
      .limit(20),
  ])

  // Extract data
  const weakNodes = (weakNodesResult.data ?? []) as WeakNode[]
  const overdueSrsCount = overdueSrsResult.count ?? 0
  const decayingNodes = (decayingNodesResult.data ?? []) as WeakNode[]
  const targetExamDate = examDateResult.data?.target_exam_date ?? null

  // Recent topic IDs set (to avoid recommending topics just studied)
  const recentTopicIds = new Set(
    (recentTopicsResult.data ?? [])
      .map((r: { topic_id: string | null }) => r.topic_id)
      .filter(Boolean) as string[],
  )

  // Compute days until exam
  let daysUntilExam: number | null = null
  if (targetExamDate) {
    const diff = new Date(targetExamDate).getTime() - Date.now()
    if (diff > 0) daysUntilExam = Math.ceil(diff / (24 * 60 * 60 * 1000))
  }

  // Compute average session minutes from recent completions. This is retained as
  // an explicit ignored signal until dose sizing starts consuming it.
  const recentSessions = avgSessionResult.data ?? []
  let _avgSessionMinutes = 30
  if (recentSessions.length > 0) {
    const durations = recentSessions
      .filter((s: { started_at: string; completed_at: string | null }) => s.completed_at)
      .map((s: { started_at: string; completed_at: string | null }) => {
        const start = new Date(s.started_at).getTime()
        const end = new Date(s.completed_at!).getTime()
        return (end - start) / (1000 * 60)
      })
      .filter((d: number) => d > 0 && d < 180) // filter outliers
    if (durations.length > 0) {
      _avgSessionMinutes = Math.round(
        durations.reduce((a: number, b: number) => a + b, 0) / durations.length,
      )
    }
  }

  // ── Build activities by priority ──────────────────────────────────────────

  const activities: DoseActivity[] = []
  let totalMinutes = 0
  const rationaleSegments: string[] = []

  // Priority 1: Overdue SRS review
  if (overdueSrsCount > 0 && totalMinutes < budget) {
    const cardCount = Math.min(overdueSrsCount, 20)
    const srsMinutes = clampMinutes(Math.ceil(cardCount * 0.5), budget - totalMinutes)
    activities.push({
      type: 'srs_review',
      config: { cardCount, source: 'overdue_srs' },
      minutes: srsMinutes,
      reason: `${cardCount} review ${cardCount === 1 ? 'card is' : 'cards are'} overdue`,
    })
    totalMinutes += srsMinutes
    rationaleSegments.push(`${cardCount} overdue review cards`)
  }

  // Priority 2: Decaying nodes not recently studied
  const decayingNotRecent = decayingNodes.filter((n) => !recentTopicIds.has(n.topic_id))
  if (decayingNotRecent.length > 0 && totalMinutes < budget) {
    const topicIds = decayingNotRecent.slice(0, 3).map((n) => n.topic_id)
    const topicNames = decayingNotRecent.slice(0, 3).map(topicName)
    const quizMinutes = clampMinutes(15, budget - totalMinutes)
    activities.push({
      type: 'quiz',
      config: {
        questionCount: 10,
        topicIds,
        source: 'camp_mode',
        mode: 'camp',
      },
      minutes: quizMinutes,
      reason: `${topicNames.join(', ')} ${topicNames.length === 1 ? 'is' : 'are'} fading from memory`,
    })
    totalMinutes += quizMinutes
    rationaleSegments.push(`decaying topics: ${topicNames.join(', ')}`)
  }

  // Priority 3: Weak nodes not already covered
  const coveredTopicIds = new Set(
    activities
      .filter((a) => a.type === 'quiz')
      .flatMap((a) => (a.config.topicIds as string[]) ?? []),
  )
  const weakNotCovered = weakNodes.filter(
    (n) => !coveredTopicIds.has(n.topic_id) && !recentTopicIds.has(n.topic_id),
  )
  if (weakNotCovered.length > 0 && totalMinutes < budget) {
    const topicIds = weakNotCovered.slice(0, 3).map((n) => n.topic_id)
    const topicNames = weakNotCovered.slice(0, 3).map(topicName)
    const quizMinutes = clampMinutes(15, budget - totalMinutes)
    activities.push({
      type: 'quiz',
      config: {
        questionCount: 10,
        topicIds,
        source: 'camp_mode',
        mode: 'camp',
      },
      minutes: quizMinutes,
      reason: `${topicNames.join(', ')} ${topicNames.length === 1 ? 'needs' : 'need'} strengthening`,
    })
    totalMinutes += quizMinutes
    rationaleSegments.push(`weak areas: ${topicNames.join(', ')}`)
  }

  // Priority 4: Exam countdown pressure — add a Storm session
  if (
    daysUntilExam !== null &&
    daysUntilExam <= 30 &&
    totalMinutes < budget &&
    budget - totalMinutes >= 15
  ) {
    const stormMinutes = clampMinutes(25, budget - totalMinutes)
    activities.push({
      type: 'quiz',
      config: {
        questionCount: 20,
        source: 'storm_mode',
        mode: 'storm',
        timed: true,
      },
      minutes: stormMinutes,
      reason: `${daysUntilExam} days until your exam — timed practice builds readiness`,
    })
    totalMinutes += stormMinutes
    rationaleSegments.push(`${daysUntilExam} days to exam`)
  }

  // Fallback: if nothing was generated, recommend a general Camp session
  if (activities.length === 0) {
    const fallbackMinutes = clampMinutes(15, budget)
    activities.push({
      type: 'quiz',
      config: {
        questionCount: 10,
        source: 'camp_mode',
        mode: 'camp',
      },
      minutes: fallbackMinutes,
      reason: 'A general practice session to keep your momentum',
    })
    totalMinutes += fallbackMinutes
    rationaleSegments.push('general practice')
  }

  // Build final rationale
  const rationale =
    rationaleSegments.length > 0
      ? `Today's focus: ${rationaleSegments.join('; ')}.`
      : 'A balanced session to maintain your progress.'

  return {
    activities,
    estimatedMinutes: totalMinutes,
    rationale,
  }
}

// ── Adjust dose to time budget ───────────────────────────────────────────────

export const adjustDoseToTimeBudget = async (
  dose: DailyDose,
  budgetMinutes: number,
): Promise<DailyDose> => {
  const fitted: DoseActivity[] = []
  let remaining = budgetMinutes

  for (const activity of dose.activities) {
    if (remaining <= 0) break
    if (activity.minutes <= remaining) {
      fitted.push(activity)
      remaining -= activity.minutes
    } else if (remaining >= 5) {
      // Shrink the activity to fit remaining time
      fitted.push({
        ...activity,
        minutes: remaining,
        config: {
          ...activity.config,
          questionCount:
            activity.type === 'quiz'
              ? Math.max(5, Math.floor(((activity.config.questionCount as number) ?? 10) * (remaining / activity.minutes)))
              : activity.config.questionCount,
        },
      })
      remaining = 0
    }
  }

  return {
    activities: fitted,
    estimatedMinutes: budgetMinutes - remaining,
    rationale: dose.rationale,
  }
}
