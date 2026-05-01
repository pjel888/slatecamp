import { unstable_cache } from 'next/cache'
import { getUser, createServiceClient } from '@/lib/supabase/server'
import { getDashboardTag, getUserSessionsTag } from './cache-tags'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ActivityFeedItem,
  InProgressSession,
  RecommendedAction,
  FocusAreaItem,
} from '@/types/dashboard'
import { formatModeName, MODE_BADGES, MODE_TOOLTIPS } from './dashboard-helpers'
import { ROUTES } from '@/lib/routes'

// ── In-progress session ─────────────────────────────────────────────────────

export const buildInProgressSession = (inProgressData: any | null): InProgressSession | null => {
  const ipRaw = inProgressData
  return ipRaw
    ? {
        sessionId: ipRaw.session_id,
        testMode: ipRaw.test_mode,
        currentIndex: ipRaw.current_question_index ?? 0,
        totalQuestions: ipRaw.question_ids?.length ?? 0,
        startedAt: ipRaw.started_at,
        updatedAt: ipRaw.updated_at,
      }
    : null
}

// ── Recent sessions with subject lookup ─────────────────────────────────────

export const transformRecentSessions = (
  recentSessionsData: any[] | null,
  subjectNamesData: any[] | null,
  interactionStatsData: any[] | null,
): ActivityFeedItem[] => {
  const recentRaw = (recentSessionsData ?? []) as Array<{
    session_id: string
    test_mode: string
    status: string
    question_ids: string[]
    subject_ids: string[]
    updated_at: string
  }>

  const subjectNameMap = new Map((subjectNamesData ?? []).map((s: any) => [s.node_id, s.name]))

  const sessionScoreMap = new Map<string, number>()
  if (interactionStatsData) {
    const grouped = new Map<string, { correct: number; total: number }>()
    for (const i of interactionStatsData as Array<{ session_id: string; is_correct: boolean }>) {
      const g = grouped.get(i.session_id) ?? { correct: 0, total: 0 }
      g.total++
      if (i.is_correct) g.correct++
      grouped.set(i.session_id, g)
    }
    for (const [sid, g] of grouped) {
      sessionScoreMap.set(sid, g.total > 0 ? Math.round((g.correct / g.total) * 100) : 0)
    }
  }

  return recentRaw.map(row => {
    const mode = row.test_mode
    const firstSubjectId = row.subject_ids?.[0]
    return {
      sessionId: row.session_id,
      testMode: formatModeName(mode),
      modeBadge: MODE_BADGES[mode] ?? 'QUIZ',
      modeTooltip: MODE_TOOLTIPS[mode] ?? '',
      subjectName: firstSubjectId ? (subjectNameMap.get(firstSubjectId) ?? null) : null,
      scorePercent: sessionScoreMap.get(row.session_id) ?? null,
      questionCount: row.question_ids?.length ?? 0,
      status: row.status as 'completed' | 'abandoned',
      updatedAt: row.updated_at,
    }
  })
}

interface SubjectNameRow {
  node_id: string
  name: string
}

interface InteractionStatRow {
  session_id: string
  is_correct: boolean
}

// ── Action builder ──────────────────────────────────────────────────────────

export const buildAction = (
  inProgress: InProgressSession | null,
  focusAreas: FocusAreaItem[],
): RecommendedAction => {
  if (inProgress) {
    const remaining = inProgress.totalQuestions - inProgress.currentIndex
    const mode = inProgress.testMode
    return {
      type: 'resume',
      title: `Continue ${formatModeName(mode)}`,
      subtitle: `Question ${inProgress.currentIndex + 1} of ${inProgress.totalQuestions} — pick up where you left off`,
      ctaLabel: 'Continue',
      href: ROUTES.dashboard.quiz,
      estimatedMinutes: Math.max(1, Math.ceil(remaining * 1.2)),
      modeTooltip: MODE_TOOLTIPS[mode] ?? '',
      progress: { current: inProgress.currentIndex + 1, total: inProgress.totalQuestions },
    }
  }

  if (focusAreas.length > 0) {
    const weakest = focusAreas[0]
    return {
      type: 'focus_review',
      title: `Practice: ${weakest.topicName}`,
      subtitle: `This topic needs attention — 10 focused questions to strengthen your understanding`,
      ctaLabel: 'Start session',
      href: ROUTES.quiz.setup('camp'),
      estimatedMinutes: 8,
      modeTooltip: MODE_TOOLTIPS['camp'] ?? '',
    }
  }

  return {
    type: 'warmup',
    title: 'Start a Camp session',
    subtitle: '10 questions across your core subjects — about 8 minutes',
    ctaLabel: 'Begin',
    href: ROUTES.quiz.setup('camp'),
    estimatedMinutes: 8,
    modeTooltip: MODE_TOOLTIPS['camp'] ?? '',
  }
}

/**
 * Server action to fetch recent activity feed data for the current user.
 */
export const getActivityFeedData = async () => {
  const { data: { user } } = await getUser()
  if (!user) return []

  return unstable_cache(
    async () => {
      const supabase = await createServiceClient()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: recentSessionsResult } = await supabase
        .from('quiz_sessions')
        .select('session_id, test_mode, status, question_ids, subject_ids, updated_at')
        .eq('user_id', user.id)
        .in('status', ['completed', 'abandoned'])
        .gte('updated_at', sevenDaysAgo)
        .order('updated_at', { ascending: false })
        .limit(5)

      return buildRecentSessions(supabase, recentSessionsResult)
    },
    ['activity-feed', user.id],
    {
      revalidate: false,
      tags: [getDashboardTag(user.id), getUserSessionsTag(user.id)],
    },
  )()
}

/** Async wrapper for recent sessions (used by other server actions) */
export const buildRecentSessions = async (
  supabase: SupabaseClient,
  recentSessionsData: any[] | null,
): Promise<ActivityFeedItem[]> => {
  const recentRaw = (recentSessionsData ?? []) as Array<{
    session_id: string
    test_mode: string
    status: string
    question_ids: string[]
    subject_ids: string[]
    updated_at: string
  }>

  // Get subject names for session subject_ids
  const allSubjectIds = [...new Set(recentRaw.flatMap(r => r.subject_ids ?? []))]
  const sessionIds = recentRaw.map(r => r.session_id)
  const [subjectNamesResponse, interactionStatsResponse] = await Promise.all([
    allSubjectIds.length > 0
      ? supabase
          .from('taxonomy_tree')
          .select('node_id, name')
          .in('node_id', allSubjectIds)
      : Promise.resolve({ data: [] as SubjectNameRow[] }),
    sessionIds.length > 0
      ? supabase
          .from('user_interactions')
          .select('session_id, is_correct')
          .in('session_id', sessionIds)
      : Promise.resolve({ data: [] as InteractionStatRow[] }),
  ])

  return transformRecentSessions(
    recentSessionsData,
    subjectNamesResponse.data ?? [],
    interactionStatsResponse.data ?? [],
  )
}
