'use server'

import { createClient, getUser } from '@/lib/supabase/server'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProgressReport {
  period: { start: string; end: string }
  questionsAnswered: number
  sessionsCompleted: number
  studyMinutes: number
  nodesImproved: number
  readinessScoreChange: number
  weakestNodes: { topicId: string; topicName: string; mastery: number }[]
  strongestImprovement: { topicId: string; topicName: string; delta: number }[]
}

// ── Generator ────────────────────────────────────────────────────────────────

export const generateProgressReport = async (
  userId: string,
  periodStart: string,
  periodEnd: string,
): Promise<ProgressReport> => {
  const supabase = await createClient()

  // 1. Questions answered in period
  const { count: questionsAnswered } = await supabase
    .from('user_interactions')
    .select('interaction_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('interaction_timestamp', periodStart)
    .lte('interaction_timestamp', periodEnd)

  // 2. Sessions completed in period
  const { count: sessionsCompleted } = await supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', periodStart)
    .lte('completed_at', periodEnd)

  // 3. Total study time (sum time_spent_ms from interactions)
  const { data: timeData } = await supabase
    .from('user_interactions')
    .select('time_spent_ms')
    .eq('user_id', userId)
    .gte('interaction_timestamp', periodStart)
    .lte('interaction_timestamp', periodEnd)
    .gt('time_spent_ms', 0)
    .lt('time_spent_ms', 300_000)

  const totalMs = (timeData || []).reduce(
    (acc: number, row: { time_spent_ms: number | null }) => acc + (row.time_spent_ms ?? 0),
    0,
  )
  const studyMinutes = Math.round(totalMs / 60_000)

  // 4. Readiness score change — compare snapshots at period boundaries
  const [startSnapshot, endSnapshot] = await Promise.all([
    supabase
      .from('readiness_score_snapshots')
      .select('score')
      .eq('user_id', userId)
      .lte('computed_at', periodStart)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('readiness_score_snapshots')
      .select('score')
      .eq('user_id', userId)
      .lte('computed_at', periodEnd)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const scoreStart = (startSnapshot.data?.score as number) ?? 0
  const scoreEnd = (endSnapshot.data?.score as number) ?? 0
  const readinessScoreChange = Math.round(scoreEnd - scoreStart)

  // 5. Node mastery changes — get topics interacted with in period, compare mastery
  const { data: periodTopics } = await supabase
    .from('user_interactions')
    .select('topic_id')
    .eq('user_id', userId)
    .gte('interaction_timestamp', periodStart)
    .lte('interaction_timestamp', periodEnd)
    .not('topic_id', 'is', null)

  const topicIds = [...new Set((periodTopics || []).map((r: { topic_id: string | null }) => r.topic_id).filter(Boolean))] as string[]

  let nodesImproved = 0
  let weakestNodes: ProgressReport['weakestNodes'] = []
  let strongestImprovement: ProgressReport['strongestImprovement'] = []

  if (topicIds.length > 0) {
    // Current mastery for these topics
    const { data: masteryData } = await supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight')
      .eq('user_id', userId)
      .in('topic_id', topicIds)

    // Get topic names
    const { data: topicNames } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name')
      .in('node_id', topicIds)

    const nameMap = new Map<string, string>((topicNames || []).map((t: { node_id: string; name: string }) => [t.node_id, t.name]))
    const masteryMap = new Map<string, number>(
      (masteryData || []).map((m: { topic_id: string; current_mastery_weight: number }) => [m.topic_id, m.current_mastery_weight]),
    )

    // Calculate per-topic accuracy in period vs before period to estimate improvement
    const { data: periodAccuracy } = await supabase
      .from('user_interactions')
      .select('topic_id, is_correct')
      .eq('user_id', userId)
      .gte('interaction_timestamp', periodStart)
      .lte('interaction_timestamp', periodEnd)
      .not('topic_id', 'is', null)

    const { data: priorAccuracy } = await supabase
      .from('user_interactions')
      .select('topic_id, is_correct')
      .eq('user_id', userId)
      .lt('interaction_timestamp', periodStart)
      .not('topic_id', 'is', null)

    const accIn = new Map<string, { correct: number; total: number }>()
    const accBefore = new Map<string, { correct: number; total: number }>()

    for (const row of (periodAccuracy || []) as { topic_id: string; is_correct: boolean }[]) {
      const entry = accIn.get(row.topic_id) ?? { correct: 0, total: 0 }
      entry.total++
      if (row.is_correct) entry.correct++
      accIn.set(row.topic_id, entry)
    }

    for (const row of (priorAccuracy || []) as { topic_id: string; is_correct: boolean }[]) {
      const entry = accBefore.get(row.topic_id) ?? { correct: 0, total: 0 }
      entry.total++
      if (row.is_correct) entry.correct++
      accBefore.set(row.topic_id, entry)
    }

    const deltas: { topicId: string; topicName: string; delta: number; mastery: number }[] = []

    for (const topicId of topicIds) {
      const inPeriod = accIn.get(topicId)
      const before = accBefore.get(topicId)
      if (!inPeriod) continue

      const accNow = inPeriod.correct / inPeriod.total
      const accPrev = before ? before.correct / before.total : 0
      const delta = Math.round((accNow - accPrev) * 100)
      const mastery = masteryMap.get(topicId) ?? 0

      if (delta > 0) nodesImproved++

      deltas.push({
        topicId,
        topicName: nameMap.get(topicId) ?? 'Unknown',
        delta,
        mastery: Math.round(mastery * 100),
      })
    }

    // Weakest nodes: lowest current mastery
    weakestNodes = deltas
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5)
      .map(({ topicId, topicName, mastery }) => ({ topicId, topicName, mastery }))

    // Strongest improvement: biggest positive delta
    strongestImprovement = deltas
      .filter((d) => d.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5)
      .map(({ topicId, topicName, delta }) => ({ topicId, topicName, delta }))
  }

  return {
    period: { start: periodStart, end: periodEnd },
    questionsAnswered: questionsAnswered ?? 0,
    sessionsCompleted: sessionsCompleted ?? 0,
    studyMinutes,
    nodesImproved,
    readinessScoreChange,
    weakestNodes,
    strongestImprovement,
  }
}
