'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ActivityFeedItem,
  InProgressSession,
  RecommendedAction,
  FocusAreaItem,
} from '@/types/dashboard'
import { formatModeName, MODE_BADGES, MODE_TOOLTIPS } from './dashboard-helpers'

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
    completed_at: string | null
    updated_at: string
  }>

  // Get subject names for session subject_ids
  const allSubjectIds = [...new Set(recentRaw.flatMap(r => r.subject_ids ?? []))]
  let subjectNameMap = new Map<string, string>()
  if (allSubjectIds.length > 0) {
    const { data: subjects } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', allSubjectIds)
    if (subjects) {
      subjectNameMap = new Map(subjects.map((s: { node_id: string; name: string }) => [s.node_id, s.name]))
    }
  }

  // Get scores for recent sessions from user_interactions
  const sessionIds = recentRaw.map(r => r.session_id)
  let sessionScoreMap = new Map<string, number>()
  if (sessionIds.length > 0) {
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('session_id, is_correct')
      .in('session_id', sessionIds)

    if (interactions) {
      const grouped = new Map<string, { correct: number; total: number }>()
      for (const i of interactions as Array<{ session_id: string; is_correct: boolean }>) {
        const g = grouped.get(i.session_id) ?? { correct: 0, total: 0 }
        g.total++
        if (i.is_correct) g.correct++
        grouped.set(i.session_id, g)
      }
      for (const [sid, g] of grouped) {
        sessionScoreMap.set(sid, g.total > 0 ? Math.round((g.correct / g.total) * 100) : 0)
      }
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
      href: `/dashboard/testing`,
      estimatedMinutes: Math.max(1, Math.ceil(remaining * 1.2)),
      modeTooltip: MODE_TOOLTIPS[mode] ?? '',
      progress: { current: inProgress.currentIndex + 1, total: inProgress.totalQuestions },
    }
  }

  if (focusAreas.length > 0) {
    const weakest = focusAreas[0]
    return {
      type: 'blindspot',
      title: `Practice: ${weakest.topicName}`,
      subtitle: `This topic needs attention — 10 focused questions to strengthen your understanding`,
      ctaLabel: 'Start session',
      href: '/dashboard/testing/camp/setup',
      estimatedMinutes: 8,
      modeTooltip: MODE_TOOLTIPS['camp'] ?? '',
    }
  }

  return {
    type: 'warmup',
    title: 'Start a Camp session',
    subtitle: '10 questions across your core subjects — about 8 minutes',
    ctaLabel: 'Begin',
    href: '/dashboard/testing/camp/setup',
    estimatedMinutes: 8,
    modeTooltip: MODE_TOOLTIPS['camp'] ?? '',
  }
}
