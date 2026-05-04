'use server'

import { getUser } from '@/lib/supabase/server'
import {
  createCachedClient,
  wrapResult,
  wrapError,
  fetchUserGlobalStats,
  fetchTaxonomyNodeMap,
  type AnalyticsResult,
} from '@/lib/actions/analytics/shared-helpers'

export interface MasterySparklineItem {
  topicId: string
  topicName: string
  points: { mastery: number; date: string }[]
}

export const getMasteryHistoryData = async (): Promise<AnalyticsResult<MasterySparklineItem[]>> => {
  try {
    const supabase = await createCachedClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const stats = await fetchUserGlobalStats(supabase, user.id)
    if (!stats?.current_discipline_id) return wrapResult([])

    const nodeMap = await fetchTaxonomyNodeMap(supabase, stats.current_discipline_id)

    const { data } = await supabase
      .from('user_node_mastery')
      .select('node_id, mastery_score, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: true })
      .limit(500)

    if (!data || data.length === 0) return wrapResult([])

    const byTopic = new Map<string, { mastery: number; date: string }[]>()

    for (const row of data) {
      const node = nodeMap.get(row.node_id)
      if (!node) continue
      const key = row.node_id
      if (!byTopic.has(key)) byTopic.set(key, [])
      byTopic.get(key)!.push({
        mastery: Math.round((row.mastery_score ?? 0) * 100),
        date: row.updated_at,
      })
    }

    const items: MasterySparklineItem[] = []
    for (const [topicId, points] of byTopic.entries()) {
      if (points.length < 2) continue
      const node = nodeMap.get(topicId)
      items.push({
        topicId,
        topicName: node?.name ?? topicId,
        points,
      })
    }

    return wrapResult(items.slice(0, 12))
  } catch (err) {
    console.error('[ANALYTICS] getMasteryHistoryData failed:', err)
    return wrapError('Failed to load mastery history', [])
  }
}
