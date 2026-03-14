'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type { HeatmapCluster, HeatmapNode, NodeState } from '@/components/dashboard/TaxonomyHeatmap'

/**
 * Returns the state label based on mastery weight (0.0 - 1.0).
 * Decision: Phase 2 Decisions Step 3.
 */
function getMasteryState(weight: number): NodeState {
  if (weight >= 0.85) return 'mastered'
  if (weight >= 0.60) return 'familiar'
  if (weight > 0) return 'danger'
  return 'unexplored'
}

export async function getTaxonomyHeatmap(disciplineId: string): Promise<HeatmapCluster[]> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  // 1. Fetch entire taxonomy tree for discipline
  const { data: nodesData, error: treeError } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, level, parent_id')
    .eq('discipline_id', disciplineId)
    .order('level', { ascending: true })

  if (treeError || !nodesData) return []
  const nodes = nodesData as Array<{ node_id: string; name: string; level: number; parent_id: string | null }>

  // 2. Fetch user's node mastery
  const { data: masteryData, error: masteryError } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight')
    .eq('user_id', user.id)

  if (masteryError) return []
  const mastery = masteryData as Array<{ topic_id: string; current_mastery_weight: number }>

  const masteryMap = new Map(mastery?.map(m => [m.topic_id, m.current_mastery_weight]) || [])

  // 3. Group by level 1 (Clusters)
  const clusters: HeatmapCluster[] = nodes
    .filter(n => n.level === 1)
    .map(parent => {
      const children = nodes.filter(n => n.parent_id === parent.node_id)
      return {
        id: parent.node_id,
        title: parent.name,
        nodes: children.map(child => {
          const weight = masteryMap.get(child.node_id) || 0
          return {
            id: child.node_id,
            label: child.name,
            state: getMasteryState(weight),
            progress: weight * 100
          }
        })
      }
    })

  return clusters
}

export async function getNodePerformance(topicId: string) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return []

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch daily averages for the node
  const { data, error } = await supabase
    .from('user_interactions')
    .select('is_correct, interaction_timestamp')
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .gte('interaction_timestamp', thirtyDaysAgo)
    .order('interaction_timestamp', { ascending: true })

  if (error || !data) return []

  // Group by date
  const grouped = (data || []).reduce((acc: Record<string, { date: string; correct: number; total: number }>, curr: { is_correct: boolean; interaction_timestamp: string }) => {
    const date = curr.interaction_timestamp.split('T')[0]
    if (!acc[date]) acc[date] = { date, correct: 0, total: 0 }
    acc[date].total++
    if (curr.is_correct) acc[date].correct++
    return acc
  }, {})

  return Object.values(grouped).map((g: any) => ({
    date: g.date,
    accuracy: (g.correct / g.total) * 100
  }))
}

export async function getAnalyticsSummary() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  // Readiness
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  // Snapshot Trend (last 30)
  const { data: snapshots } = await supabase
    .from('readiness_score_snapshots')
    .select('score, computed_at')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: true })
    .limit(30)

  // Pacing (avg of last 50 interactions)
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('time_spent_ms')
    .eq('user_id', user.id)
    .order('interaction_timestamp', { ascending: false })
    .limit(50)

  const avgMs = interactions && (interactions as any[]).length > 0
    ? (interactions as any[]).reduce((acc: number, i: any) => acc + (i.time_spent_ms || 0), 0) / (interactions as any[]).length
    : 0

  return {
    readinessScore: stats?.global_readiness_score || 0,
    readinessTrend: snapshots || [],
    averageSecondsPerItem: Math.round(avgMs / 1000),
    targetSecondsPerItem: 120, // ALE Standard
    enduranceMinutes: 240, // ALE Standard
    trend: 'stable' as const
  }
}
