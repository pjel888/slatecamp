'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export type CatalystType = 'resume' | 'drill' | 'warmup'

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

  const [
    incompleteResult,
    lastDoneResult,
    masteryResult,
    interactionResult,
    notesResult,
    weakTopicResult,
    globalStatsResult,
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
      href: `/dashboard/testing?session=${incomplete.session_id}`,
    }
  } else if (weak) {
    const topicName =
      (weak as { taxonomy_tree?: { name: string } })?.taxonomy_tree?.name ??
      'a challenging topic'
    catalyst = {
      type: 'drill',
      title: `Practice: ${topicName}`,
      subtitle: `This topic needs a little attention — 5 focused questions to sharpen your understanding`,
      estimatedMinutes: 4,
      href: `/dashboard/testing?mode=camp`,
    }
  } else {
    catalyst = {
      type: 'warmup',
      title: 'Daily Warmup',
      subtitle: 'A quick 5-question session from your core subjects — the perfect way to start',
      estimatedMinutes: 3,
      href: '/dashboard/testing?mode=camp',
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
      href: `/dashboard/testing`,
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
      href: '/dashboard/testing?mode=camp',
    },
    recentActivities: [],
    totalAnswered: 0,
    topicsMastered: 0,
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
    blindspot: 'Blindspot Quiz',
    proof_sim: 'Full Exam Simulation',
    endurance: 'Endurance Quiz',
  }
  return map[mode] ?? 'Quiz'
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
