'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { ROUTES } from '@/lib/routes'

const SUBJECT_AREAS = [
  'Architectural Design and Site Planning',
  'Architectural Practice',
  'Building Materials and Construction',
  'Building Utilities',
  'History of Architecture',
  'Structural Design',
  'Theory and Principles of Planning',
  'Theory of Architecture',
] as const

export type CatalystType = 'resume' | 'practice' | 'warmup'

export interface DailyCatalyst {
  type: CatalystType
  title: string
  subtitle: string
  progress?: { current: number; total: number }
  estimatedMinutes: number
  href: string
}

export interface RecentActivity {
  id: string
  type: 'quiz' | 'note'
  title: string
  subtitle: string
  href: string
}

export interface DashboardData {
  userName: string
  readinessScore: number
  readinessMomentum: 'building' | 'steady' | 'strong'
  catalyst: DailyCatalyst
  recentActivities: RecentActivity[]
  totalAnswered: number
  topicsMastered: number
  subjectMastery: { name: string; mastery: number }[]
  studyDaysCount: number
  previousReadinessScore: number | null
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  const userName =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  if (!user) {
    return emptyDashboard(userName)
  }

  try {

  const [
    incompleteResult,
    lastDoneResult,
    masteryResult,
    interactionResult,
    notesResult,
    weakTopicResult,
    globalStatsResult,
    subjectMasteryResult,
    studyDaysResult,
    readinessSnapshotsResult,
  ] = await Promise.allSettled([
    supabase
      .from('quiz_sessions')
      .select('session_id, test_mode, current_question_index, question_ids, updated_at')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('quiz_sessions')
      .select('session_id, test_mode, question_ids, updated_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('user_node_mastery')
      .select('current_mastery_weight')
      .eq('user_id', user.id),

    supabase
      .from('user_interactions')
      .select('interaction_id', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabase
      .from('notes')
      .select('note_id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1),

    supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, taxonomy_tree(name)')
      .eq('user_id', user.id)
      .gt('total_attempts', 2)
      .lt('current_mastery_weight', 0.6)
      .order('current_mastery_weight', { ascending: true })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .maybeSingle(),

    supabase
      .from('user_node_mastery')
      .select('current_mastery_weight, taxonomy_tree(subject_area)')
      .eq('user_id', user.id),

    supabase
      .from('user_interactions')
      .select('interaction_timestamp')
      .eq('user_id', user.id),

    supabase
      .from('readiness_score_snapshots')
      .select('score')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: false })
      .limit(2),
  ])

  const incomplete =
    incompleteResult.status === 'fulfilled' ? incompleteResult.value.data : null
  const lastDone =
    lastDoneResult.status === 'fulfilled' ? lastDoneResult.value.data : null
  const mastery =
    masteryResult.status === 'fulfilled' ? masteryResult.value.data : null
  const totalAnswered =
    interactionResult.status === 'fulfilled'
      ? (interactionResult.value.count ?? 0)
      : 0
  const notes =
    notesResult.status === 'fulfilled' ? notesResult.value.data : null
  const weak =
    weakTopicResult.status === 'fulfilled' ? weakTopicResult.value.data : null
  const globalStats =
    globalStatsResult.status === 'fulfilled'
      ? globalStatsResult.value.data
      : null

  const masteryData =
    subjectMasteryResult.status === 'fulfilled' ? subjectMasteryResult.value.data : null
  const studyDaysData =
    studyDaysResult.status === 'fulfilled' ? studyDaysResult.value.data : null
  const snapshotsData =
    readinessSnapshotsResult.status === 'fulfilled'
      ? readinessSnapshotsResult.value.data
      : null

  // Aggregate mastery weights by subject area
  const masteryBySubject = new Map<string, number[]>()
  SUBJECT_AREAS.forEach(s => masteryBySubject.set(s, []))

  if (masteryData) {
    for (const entry of masteryData) {
      const area = (entry.taxonomy_tree as { subject_area: string } | null)?.subject_area
      if (area && masteryBySubject.has(area)) {
        masteryBySubject.get(area)!.push(entry.current_mastery_weight)
      }
    }
  }

  const subjectMastery = SUBJECT_AREAS.map(name => {
    const weights = masteryBySubject.get(name) ?? []
    const mastery =
      weights.length > 0
        ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 100)
        : 0
    return { name, mastery }
  })

  // Count distinct calendar days from interaction timestamps
  const studyDaysCount = studyDaysData
    ? new Set(
        studyDaysData.map((row: { interaction_timestamp: string }) =>
          new Date(row.interaction_timestamp).toISOString().slice(0, 10),
        ),
      ).size
    : 0

  // Second-most-recent snapshot is the "previous" score
  const previousReadinessScore: number | null =
    snapshotsData && snapshotsData.length >= 2 ? (snapshotsData[1].score as number) : null

  const topicsMastered = mastery
    ? mastery.filter((m: { current_mastery_weight: number }) => m.current_mastery_weight >= 0.6).length
    : 0
  const readinessScore = Math.round(globalStats?.global_readiness_score ?? 0)

  let readinessMomentum: 'building' | 'steady' | 'strong' = 'building'
  if (readinessScore >= 75) readinessMomentum = 'strong'
  else if (readinessScore >= 40) readinessMomentum = 'steady'

  // Catalyst decision algorithm
  let catalyst: DailyCatalyst

  if (incomplete) {
    const total = incomplete.question_ids?.length ?? 20
    const current = incomplete.current_question_index ?? 0
    const modeName = formatModeName(incomplete.test_mode)
    catalyst = {
      type: 'resume',
      title: `Resume ${modeName}`,
      subtitle: `You were on question ${current + 1} of ${total} — pick up right where you left off`,
      progress: { current: current + 1, total },
      estimatedMinutes: Math.max(1, Math.ceil((total - current) * 1.2)),
      href: ROUTES.dashboard.drills,
    }
  } else if (weak) {
    const topicName =
      (weak as { taxonomy_tree?: { name: string } })?.taxonomy_tree?.name ??
      'a challenging topic'
    catalyst = {
      type: 'practice',
      title: `Practice: ${topicName}`,
      subtitle: `This topic needs a little attention — 5 focused questions to sharpen your understanding`,
      estimatedMinutes: 4,
      href: ROUTES.quiz.setup('camp'),
    }
  } else {
    catalyst = {
      type: 'warmup',
      title: 'Daily Warmup',
      subtitle: 'A quick 5-question session from your core subjects — the perfect way to start',
      estimatedMinutes: 3,
      href: ROUTES.quiz.setup('camp'),
    }
  }

  // Recent activities
  const activities: RecentActivity[] = []

  if (lastDone) {
    const total = lastDone.question_ids?.length ?? 0
    const modeName = formatModeName(lastDone.test_mode)
    activities.push({
      id: lastDone.session_id,
      type: 'quiz',
      title: `${modeName}`,
      subtitle: total > 0 ? `${total} questions · ${formatRelativeTime(lastDone.updated_at)}` : formatRelativeTime(lastDone.updated_at),
      href: `/dashboard/drills`,
    })
  }

  if (notes && notes.length > 0) {
    const note = notes[0]
    activities.push({
      id: note.note_id,
      type: 'note',
      title: note.title || 'Untitled Note',
      subtitle: formatRelativeTime(note.updated_at),
      href: `/dashboard/notes`,
    })
  }

    return {
      userName,
      readinessScore,
      readinessMomentum,
      catalyst,
      recentActivities: activities,
      totalAnswered,
      topicsMastered,
      subjectMastery,
      studyDaysCount,
      previousReadinessScore,
    }
  } catch (err) {
    console.error('[DASHBOARD: getDashboardData]', err)
    return emptyDashboard(userName)
  }
}

function emptyDashboard(userName: string): DashboardData {
  return {
    userName,
    readinessScore: 0,
    readinessMomentum: 'building',
    catalyst: {
      type: 'warmup',
      title: 'Start Your First Session',
      subtitle: 'Jump in with a 5-question warmup — no setup needed',
      estimatedMinutes: 3,
      href: ROUTES.quiz.setup('camp'),
    },
    recentActivities: [],
    totalAnswered: 0,
    topicsMastered: 0,
    subjectMastery: SUBJECT_AREAS.map(name => ({ name, mastery: 0 })),
    studyDaysCount: 0,
    previousReadinessScore: null,
  }
}

function formatModeName(mode: string): string {
  const map: Record<string, string> = {
    camp: 'Camp Mode Quiz',
    storm: 'Storm Mode Quiz',
    chill: 'Chill Mode Quiz',
    timed: 'Timed Quiz',
    practice: 'Practice Quiz',
    custom: 'Custom Quiz',
    focus_review: 'Focus Review',
    full_exam: 'Full Exam Simulation',
    endurance: 'Endurance Quiz',
  }
  return map[mode] ?? 'Quiz'
}
