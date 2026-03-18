import { createClient, getUser } from '@/lib/supabase/server'
import { ensureUserGlobalStats } from '@/lib/actions/user-stats'

export async function getTestingPageData(params: { topicId?: string; subjectId?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const stats = await ensureUserGlobalStats()
  if (!stats) return null

  // 1. Look for existing in-progress session
  const { data: existingSession } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .eq('test_mode', 'camp')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 2. Fetch question IDs scoped to this discipline's leaf nodes only
  let questionIds: string[] = []
  if (!params.topicId && !params.subjectId) {
    const { data: leafNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', stats.current_discipline_id)
      .eq('is_leaf', true)

    const leafIds = (leafNodes || []).map((n: { node_id: string }) => n.node_id)

    if (leafIds.length > 0) {
      const { data: allQuestions } = await supabase
        .from('questions')
        .select('question_id')
        .in('topic_id', leafIds)
      questionIds = (allQuestions || []).map((q: { question_id: string }) => q.question_id)
    }
  }

  // 3. Fetch top-level subjects for custom session builder
  const { data: subjects } = await supabase
    .from('taxonomy_tree')
    .select('*')
    .eq('discipline_id', stats.current_discipline_id)
    .eq('level', 1)
    .order('name')

  const disciplineName = (stats as any).disciplines?.name || 'Architecture'

  return {
    existingSession,
    disciplineId: stats.current_discipline_id!,
    disciplineName,
    subjects: subjects || [],
    questionIds,
  }
}
