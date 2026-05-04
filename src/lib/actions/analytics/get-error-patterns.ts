'use server'

import { getUser } from '@/lib/supabase/server'
import type { ErrorCategory } from '@/lib/quiz/error-classifier'
import { createCachedClient, wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ErrorCategoryCount {
  category: ErrorCategory
  count: number
}

export interface ConfusedTopic {
  topicId: string
  topicName: string
  errorCount: number
}

export interface ErrorPatternData {
  /** Count per error category in the last 30 days */
  categoryCounts: ErrorCategoryCount[]
  /** Total classified errors in the window */
  totalClassified: number
  /** Top topics with 'concept_confusion' errors */
  conceptConfusionTopics: ConfusedTopic[]
  /** Top topics with 'knowledge_gap' errors */
  knowledgeGapTopics: ConfusedTopic[]
}

/**
 * Fetch error pattern analytics for the current user.
 * Returns category distribution and top struggling topics.
 */
export const getErrorPatterns = async (): Promise<AnalyticsResult<ErrorPatternData | null>> => {
  const supabase = await createCachedClient()
  const { data: { user } } = await getUser()
  if (!user) return wrapResult(null)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff = thirtyDaysAgo.toISOString()

  try {
    // 1. Fetch all classified errors in the last 30 days
    const { data: interactions, error } = await supabase
      .from('user_interactions')
      .select('error_type, topic_id')
      .eq('user_id', user.id)
      .eq('is_correct', false)
      .not('error_type', 'is', null)
      .gte('interaction_timestamp', cutoff)

    if (error || !interactions) {
      console.error('[get-error-patterns] Query failed:', error?.message)
      return wrapError('Failed to load error patterns', null)
    }

    // 2. Count by category
    const countMap = new Map<string, number>()
    for (const row of interactions) {
      const cat = row.error_type as string
      countMap.set(cat, (countMap.get(cat) ?? 0) + 1)
    }

    const categoryCounts: ErrorCategoryCount[] = Array.from(countMap.entries())
      .map(([category, count]) => ({ category: category as ErrorCategory, count }))
      .sort((a, b) => b.count - a.count)

    const totalClassified = interactions.length

    // 3. Top topics with concept_confusion
    const conceptConfusionByTopic = new Map<string, number>()
    const knowledgeGapByTopic = new Map<string, number>()

    for (const row of interactions) {
      if (!row.topic_id) continue
      if (row.error_type === 'concept_confusion') {
        conceptConfusionByTopic.set(row.topic_id, (conceptConfusionByTopic.get(row.topic_id) ?? 0) + 1)
      }
      if (row.error_type === 'knowledge_gap') {
        knowledgeGapByTopic.set(row.topic_id, (knowledgeGapByTopic.get(row.topic_id) ?? 0) + 1)
      }
    }

    // 4. Resolve topic names for the top 5 of each
    const topConceptIds = Array.from(conceptConfusionByTopic.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)

    const topGapIds = Array.from(knowledgeGapByTopic.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)

    const allTopicIds = [...new Set([...topConceptIds, ...topGapIds])]
    const topicNameMap = new Map<string, string>()

    if (allTopicIds.length > 0) {
      const { data: topics } = await supabase
        .from('taxonomy_tree')
        .select('node_id, name')
        .in('node_id', allTopicIds)

      if (topics) {
        for (const t of topics) {
          topicNameMap.set(t.node_id, t.name)
        }
      }
    }

    const conceptConfusionTopics: ConfusedTopic[] = topConceptIds.map((id) => ({
      topicId: id,
      topicName: topicNameMap.get(id) ?? 'Unknown topic',
      errorCount: conceptConfusionByTopic.get(id) ?? 0,
    }))

    const knowledgeGapTopics: ConfusedTopic[] = topGapIds.map((id) => ({
      topicId: id,
      topicName: topicNameMap.get(id) ?? 'Unknown topic',
      errorCount: knowledgeGapByTopic.get(id) ?? 0,
    }))

    return wrapResult({
      categoryCounts,
      totalClassified,
      conceptConfusionTopics,
      knowledgeGapTopics,
    })
  } catch (err) {
    console.error('[get-error-patterns] Unexpected error:', err)
    return wrapError('Failed to load error patterns', null)
  }
}
