'use server'

import { createClient } from '@/lib/supabase/server'

export interface CrammingCheckResult {
  isCramming: boolean
  message: string | null
  count: number
}

/**
 * Detect cramming patterns: excessive repetition on a single topic
 * within a short window (4 hours).
 *
 * Distributed practice is empirically ~2x more effective than massed
 * practice (Cepeda et al., 2006). This detector nudges learners to
 * interleave topics instead of grinding a single one.
 */
export const checkCrammingPattern = async (
  userId: string,
  topicId: string,
): Promise<CrammingCheckResult> => {
  try {
    const supabase = await createClient()

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()

    const { count, error } = await supabase
      .from('user_interactions')
      .select('interaction_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .gte('interaction_timestamp', fourHoursAgo)

    if (error) {
      return { isCramming: false, message: null, count: 0 }
    }

    const interactionCount = count ?? 0

    if (interactionCount > 40) {
      return {
        isCramming: true,
        message:
          'Distributed practice is 2x more effective than cramming. Switch topics and return to this one tomorrow.',
        count: interactionCount,
      }
    }

    return { isCramming: false, message: null, count: interactionCount }
  } catch {
    // Never block the quiz flow
    return { isCramming: false, message: null, count: 0 }
  }
}
