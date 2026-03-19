'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export interface DebriefData {
  interactions: DebriefInteraction[]
  topicNames: Record<string, string>
  readinessBefore: number
  readinessAfter: number
  avgTimeMs: number
  answerChangeCount: number
  answerChangesCorrect: number
  userHistoricalAvgTimeMs: number | null
}

export interface DebriefInteraction {
  question_id: string
  selected_option_id: string | null
  is_correct: boolean
  time_spent_ms: number
  is_flagged: boolean
  answer_changes: number
  topic_id: string | null
  error_type: string | null
}

export const getDebriefData = async (sessionId: string): Promise<DebriefData | null> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  // Fetch interactions, readiness snapshots, and historical avg in parallel
  const [
    { data: interactions },
    { data: snapshots },
    { data: globalStats },
    { data: historicalInteractions },
  ] = await Promise.all([
    supabase
      .from('user_interactions')
      .select('question_id, selected_option_id, is_correct, time_spent_ms, is_flagged, answer_changes, topic_id, error_type')
      .eq('session_id', sessionId)
      .eq('user_id', user.id),
    supabase
      .from('readiness_score_snapshots')
      .select('score, computed_at')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: false })
      .limit(2),
    supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_interactions')
      .select('time_spent_ms')
      .eq('user_id', user.id)
      .gt('time_spent_ms', 0)
      .limit(500),
  ])

  if (!interactions) return null

  // Get topic names for all topics in this session
  const topicIds = [...new Set(interactions.map((i) => i.topic_id).filter(Boolean))] as string[]
  let topicNames: Record<string, string> = {}
  if (topicIds.length > 0) {
    const { data: nodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', topicIds)
    if (nodes) {
      topicNames = Object.fromEntries(nodes.map((n: { node_id: string; name: string }) => [n.node_id, n.name]))
    }
  }

  // Readiness before/after
  const readinessAfter = globalStats?.global_readiness_score ?? 0
  const readinessBefore = snapshots && snapshots.length >= 2
    ? snapshots[1].score
    : snapshots && snapshots.length === 1
      ? snapshots[0].score
      : readinessAfter

  // Behavioral stats
  const timesWithData = interactions.filter((i) => i.time_spent_ms > 0)
  const avgTimeMs = timesWithData.length > 0
    ? timesWithData.reduce((sum, i) => sum + i.time_spent_ms, 0) / timesWithData.length
    : 0

  const answerChangeCount = interactions.filter((i) => i.answer_changes > 0).length
  const answerChangesCorrect = interactions.filter((i) => i.answer_changes > 0 && i.is_correct).length

  // Historical average
  const allTimes = (historicalInteractions || []).filter((i) => i.time_spent_ms > 0)
  const userHistoricalAvgTimeMs = allTimes.length > 10
    ? allTimes.reduce((sum, i) => sum + i.time_spent_ms, 0) / allTimes.length
    : null

  return {
    interactions: interactions as DebriefInteraction[],
    topicNames,
    readinessBefore,
    readinessAfter,
    avgTimeMs,
    answerChangeCount,
    answerChangesCorrect,
    userHistoricalAvgTimeMs,
  }
}
