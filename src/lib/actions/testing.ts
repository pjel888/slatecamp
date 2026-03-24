import { createClient, getUser } from '@/lib/supabase/server'
import { ensureUserGlobalStats } from '@/lib/actions/user-stats'

export interface ModeStats {
  sessionCount: number
  lastPlayedAt: string | null
}

export async function getTestingPageData(params: { topicId?: string; subjectId?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const stats = await ensureUserGlobalStats()
  if (!stats) return null

  // 1. Look for existing in-progress session (any mode)
  const existingSessionPromise = supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 2. Fetch per-mode session stats (completed sessions)
  const modeStatsPromise = supabase
    .from('quiz_sessions')
    .select('test_mode, started_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })

  // 3. Fetch question IDs + subjects in parallel
  // Uses a PostgREST inner join instead of .in() to avoid URL length limits
  // (446 leaf-node UUIDs exceed PostgREST GET query-string limits)
  let questionIdsPromise: Promise<string[]> = Promise.resolve([])
  if (!params.topicId && !params.subjectId) {
    questionIdsPromise = (async () => {
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('question_id, taxonomy_tree!inner(discipline_id)')
        .eq('taxonomy_tree.discipline_id', stats.current_discipline_id)
        .eq('taxonomy_tree.is_leaf', true)
        .eq('taxonomy_tree.is_cross_ref_only', false)
        .is('taxonomy_tree.deprecated_at', null)
        .not('taxonomy_tree.ale_id', 'is', null)

      if (error) {
        console.error('[testing] Failed to fetch question IDs:', error.message)
        return []
      }

      return (allQuestions || []).map((q: { question_id: string }) => q.question_id)
    })()
  }

  const subjectsPromise = supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('discipline_id', stats.current_discipline_id)
    .eq('level', 1)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)
    .order('name')

  const [
    { data: existingSession },
    { data: completedSessions },
    questionIds,
    { data: subjects },
  ] = await Promise.all([
    existingSessionPromise,
    modeStatsPromise,
    questionIdsPromise,
    subjectsPromise,
  ])

  // Aggregate mode stats
  const modeStatsMap: Record<string, ModeStats> = {}
  for (const s of completedSessions || []) {
    const mode = s.test_mode as string
    if (!modeStatsMap[mode]) {
      modeStatsMap[mode] = { sessionCount: 0, lastPlayedAt: s.started_at }
    }
    modeStatsMap[mode].sessionCount++
  }

  const totalCompletedSessions = (completedSessions || []).length
  const disciplineName = (stats as any).disciplines?.name || 'Architecture'

  return {
    existingSession,
    disciplineId: stats.current_discipline_id!,
    disciplineName,
    subjects: subjects || [],
    questionIds,
    modeStats: modeStatsMap,
    totalCompletedSessions,
  }
}
