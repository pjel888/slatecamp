'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import {
  currentRetrievalStrength,
  classifyQuadrant,
  recommendActivity,
  type MemoryQuadrant,
  type ActivityRecommendation,
} from '@/lib/quiz/memory-strength'
import { wrapResult, wrapError, type AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

// ── Types ────────────────────────────────────────────────────────────────────

export interface MemoryStrengthTopic {
  topicId: string
  name: string
  ss: number
  rs: number
  state: MemoryQuadrant
  lastReviewed: string | null
  recommendation: ActivityRecommendation | null
}

export interface MemoryStrengthOverview {
  topics: MemoryStrengthTopic[]
  mastered: number
  rusty: number
  needsLearning: number
  surfaceLearning: number
}

// ── Query ────────────────────────────────────────────────────────────────────

/**
 * Fetch memory strength overview for a user's analytics dashboard.
 * Returns all topics with SS/RS values, quadrant classification,
 * and activity recommendations.
 */
export const getMemoryStrengthData = async (
  userId?: string,
): Promise<AnalyticsResult<MemoryStrengthOverview | null>> => {
  try {
  const supabase = await createClient()

  const effectiveUserId = userId ?? (await getUser()).data.user?.id
  if (!effectiveUserId) return wrapResult(null)

  // Fetch all mastery rows that have any practice (storage_strength > 0 OR total_attempts > 0)
  const { data: rows, error } = await supabase
    .from('user_node_mastery')
    .select(
      'topic_id, storage_strength, retrieval_strength, last_encountered, practice_count, taxonomy_tree(name)' as any,
    )
    .eq('user_id', effectiveUserId)
    .gt('total_attempts', 0)
    .order('last_encountered', { ascending: false })

  if (error || !rows) return wrapResult(null)

  const now = Date.now()

  const topics: MemoryStrengthTopic[] = (rows as any[]).map((row) => {
    const ss = (row.storage_strength as number) ?? 0
    const lastEncountered = row.last_encountered as string | null

    // Compute current RS with time-based decay
    const daysSinceReview = lastEncountered
      ? (now - new Date(lastEncountered).getTime()) / (1000 * 60 * 60 * 24)
      : 0
    const rawRS = (row.retrieval_strength as number) ?? 0
    const rs = currentRetrievalStrength(rawRS, ss, daysSinceReview)

    const state = classifyQuadrant(ss, rs)
    const recommendation = recommendActivity(ss, rs, row.topic_id)

    const taxonomyTree = row.taxonomy_tree as { name: string } | null

    return {
      topicId: row.topic_id as string,
      name: taxonomyTree?.name ?? 'Unknown Topic',
      ss: Math.round(ss * 1000) / 1000,
      rs: Math.round(rs * 1000) / 1000,
      state,
      lastReviewed: lastEncountered,
      recommendation,
    }
  })

  // Count by quadrant
  let mastered = 0
  let rusty = 0
  let needsLearning = 0
  let surfaceLearning = 0

  for (const t of topics) {
    switch (t.state) {
      case 'mastered':
        mastered++
        break
      case 'rusty':
        rusty++
        break
      case 'needs_learning':
        needsLearning++
        break
      case 'surface_learning':
        surfaceLearning++
        break
    }
  }

  return wrapResult({
    topics,
    mastered,
    rusty,
    needsLearning,
    surfaceLearning,
  })
  } catch (err) {
    console.error('[ANALYTICS] getMemoryStrengthData failed:', err)
    return wrapError('Failed to load memory strength data', null)
  }
}

/** @deprecated Use getMemoryStrengthData */
export const getMemoryStrengthOverview = getMemoryStrengthData
