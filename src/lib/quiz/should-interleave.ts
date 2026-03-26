// ─── Hybrid Block-then-Interleave Decision (Hwang 2025) ──────────────────────
// Novices (mastery < 0.60) benefit from blocked practice (same-topic repetition).
// Intermediates (mastery >= 0.60) benefit from interleaving (mixed sibling topics).
// This function checks user_node_mastery to make the decision per topic.

import { createClient } from '@/lib/supabase/server'

/**
 * Determines whether a user should receive interleaved questions for a topic.
 * Returns true if the user's mastery for the topic >= 0.60 (intermediate+).
 * Returns false for novice learners who benefit from blocked practice.
 */
export const shouldAutoInterleave = async (
  userId: string,
  topicId: string,
): Promise<boolean> => {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_node_mastery')
    .select('mastery_level')
    .eq('user_id', userId)
    .eq('node_id', topicId)
    .single()

  const mastery = data?.mastery_level ?? 0
  return mastery >= 0.60
}

/**
 * Batch version: checks mastery for multiple topics and returns
 * true if the average mastery across selected topics >= 0.60.
 * Falls back to false (blocked practice) when no mastery data exists.
 */
export const shouldAutoInterleaveForTopics = async (
  userId: string,
  topicIds: string[],
): Promise<boolean> => {
  if (topicIds.length === 0) return false

  const supabase = await createClient()

  const { data } = await supabase
    .from('user_node_mastery')
    .select('mastery_level')
    .eq('user_id', userId)
    .in('node_id', topicIds)

  if (!data || data.length === 0) return false

  const avgMastery =
    data.reduce((sum: number, row: { mastery_level: number }) => sum + row.mastery_level, 0) /
    data.length

  return avgMastery >= 0.60
}
