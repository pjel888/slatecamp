'use server'

import { getUser } from '@/lib/supabase/server'
import { createCachedClient, wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TopicRecommendation = 'review' | 'practice' | 'read-wiki'

export interface TopicIntelligenceCard {
  topicId: string
  topicName: string
  masteryPct: number
  errorType: string | null
  lastEncountered: string | null
  recommendation: TopicRecommendation
}

// ─── Action ───────────────────────────────────────────────────────────────────

export const getTopicIntelligenceData = async (): Promise<
  AnalyticsResult<TopicIntelligenceCard[]>
> => {
  try {
    const supabase = await createCachedClient()
    const { data: { user } } = await getUser()
    if (!user) return wrapResult([])

    // Fetch user mastery for their weakest 5 topics
    const { data: masteryRows, error: masteryErr } = await supabase
      .from('user_node_mastery')
      .select('node_id, mastery_score, last_practiced_at')
      .eq('user_id', user.id)
      .order('mastery_score', { ascending: true })
      .limit(5)

    if (masteryErr || !masteryRows?.length) return wrapResult([])

    const topicIds = masteryRows.map((r) => r.node_id)

    // Parallel: resolve topic names + dominant error type per topic
    const [namesRes, errorsRes] = await Promise.all([
      supabase
        .from('taxonomy_tree')
        .select('node_id, name')
        .in('node_id', topicIds),
      supabase
        .from('user_interactions')
        .select('topic_id, error_type')
        .eq('user_id', user.id)
        .eq('is_correct', false)
        .not('error_type', 'is', null)
        .in('topic_id', topicIds)
        .limit(500),
    ])

    const nameMap = new Map<string, string>()
    for (const t of namesRes.data ?? []) {
      nameMap.set(t.node_id, t.name)
    }

    // Dominant error type per topic
    const errorCountMap = new Map<string, Map<string, number>>()
    for (const row of errorsRes.data ?? []) {
      if (!row.topic_id || !row.error_type) continue
      if (!errorCountMap.has(row.topic_id)) {
        errorCountMap.set(row.topic_id, new Map())
      }
      const inner = errorCountMap.get(row.topic_id)!
      inner.set(row.error_type, (inner.get(row.error_type) ?? 0) + 1)
    }

    const dominantError = (topicId: string): string | null => {
      const inner = errorCountMap.get(topicId)
      if (!inner?.size) return null
      let best = ''
      let max = 0
      for (const [cat, count] of inner) {
        if (count > max) { max = count; best = cat }
      }
      return best || null
    }

    const deriveRecommendation = (
      masteryPct: number,
      errType: string | null,
    ): TopicRecommendation => {
      if (masteryPct < 30) return 'read-wiki'
      if (errType === 'concept_confusion' || errType === 'knowledge_gap') return 'review'
      return 'practice'
    }

    const cards: TopicIntelligenceCard[] = masteryRows.map((row) => {
      const masteryPct = Math.round((row.mastery_score ?? 0) * 100)
      const errorType = dominantError(row.node_id)
      const recommendation = deriveRecommendation(masteryPct, errorType)
      return {
        topicId: row.node_id,
        topicName: nameMap.get(row.node_id) ?? 'Unknown topic',
        masteryPct,
        errorType,
        lastEncountered: row.last_practiced_at ?? null,
        recommendation,
      }
    })

    return wrapResult(cards)
  } catch (err) {
    console.error('[ANALYTICS] getTopicIntelligenceData failed:', err)
    return wrapError('Failed to load topic intelligence data', [])
  }
}
