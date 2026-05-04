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

export interface RelearningItem {
  topicId: string
  topicName: string
  cycles: number
  currentMastery: number
}

export const getRelearningData = async (): Promise<AnalyticsResult<RelearningItem[]>> => {
  try {
    const supabase = await createCachedClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    const stats = await fetchUserGlobalStats(supabase, user.id)
    if (!stats?.current_discipline_id) return wrapResult([])

    const nodeMap = await fetchTaxonomyNodeMap(supabase, stats.current_discipline_id)

    const { data } = await supabase
      .from('user_node_mastery')
      .select('node_id, mastery_score, review_count')
      .eq('user_id', user.id)
      .gt('review_count', 1)
      .order('review_count', { ascending: false })
      .limit(20)

    if (!data || data.length === 0) return wrapResult([])

    const items: RelearningItem[] = data
      .map(row => {
        const node = nodeMap.get(row.node_id)
        if (!node) return null
        return {
          topicId: row.node_id,
          topicName: node.name,
          cycles: row.review_count ?? 0,
          currentMastery: Math.round((row.mastery_score ?? 0) * 100),
        }
      })
      .filter((item): item is RelearningItem => item !== null)

    return wrapResult(items)
  } catch (err) {
    console.error('[ANALYTICS] getRelearningData failed:', err)
    return wrapError('Failed to load relearning data', [])
  }
}
