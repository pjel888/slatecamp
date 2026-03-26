'use server'

import { createClient } from '@/lib/supabase/server'
import { updateStorageStrength, currentRetrievalStrength } from '@/lib/quiz/memory-strength'

/**
 * Update memory strength (SS + RS) for a user-topic pair after a quiz interaction.
 *
 * Called as a post-interaction hook alongside decay rate updates.
 * Failures are logged but never propagated — must not break the quiz flow.
 */
export const updateMemoryStrength = async (
  userId: string,
  topicId: string,
  isCorrect: boolean,
  difficulty: number,
  isInterleaved: boolean,
  sessionMode: string,
  /** Generation effect multiplier — correct generation answers get 1.2x stronger memory trace */
  emaWeightMultiplier = 1.0,
): Promise<void> => {
  try {
    const supabase = await createClient()

    // 1. Fetch current mastery row
    const { data: mastery, error: fetchError } = await supabase
      .from('user_node_mastery')
      .select(
        'storage_strength, retrieval_strength, practice_count, practice_contexts, last_encountered' as any,
      )
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()

    if (fetchError || !mastery) {
      // Row doesn't exist yet — will be created by the main mastery upsert;
      // we insert a fresh row with initial SS/RS values
      const newSS = updateStorageStrength(0, { isCorrect, difficulty, isInterleaved })
      const newRS = isCorrect ? 0.8 : 0

      await supabase.from('user_node_mastery').upsert(
        {
          user_id: userId,
          topic_id: topicId,
          storage_strength: Math.round(newSS * 1000) / 1000,
          retrieval_strength: Math.round(newRS * 1000) / 1000,
          practice_count: 1,
          practice_contexts: 1,
        } as any,
        { onConflict: 'user_id,topic_id' },
      )
      return
    }

    const row = mastery as Record<string, unknown>

    // 2. Read current values
    const currentSS = (row.storage_strength as number) ?? 0
    const currentRS = (row.retrieval_strength as number) ?? 0
    const practiceCount = (row.practice_count as number) ?? 0
    const practiceContexts = (row.practice_contexts as number) ?? 0
    const lastEncountered = row.last_encountered as string | null

    // 3. Compute days since last review for RS decay
    const daysSinceReview = lastEncountered
      ? (Date.now() - new Date(lastEncountered).getTime()) / (1000 * 60 * 60 * 24)
      : 0

    // 4. Compute decayed RS before applying the new interaction
    const decayedRS = currentRetrievalStrength(currentRS, currentSS, daysSinceReview)

    // 5. Update storage strength (monotonically increasing)
    //    Generation effect: correct generation answers get emaWeightMultiplier (1.2x)
    //    applied to the SS increment for stronger memory trace.
    const baseSS = updateStorageStrength(currentSS, {
      isCorrect,
      difficulty,
      isInterleaved,
    })
    const ssIncrement = baseSS - currentSS
    const newSS = Math.min(currentSS + ssIncrement * emaWeightMultiplier, 1.0)

    // 6. Update retrieval strength based on correctness
    //    Correct answer: RS jumps to at least 0.8 (successful retrieval)
    //    Incorrect: RS stays at decayed value (failed retrieval attempt)
    const newRS = isCorrect ? Math.max(decayedRS, 0.8) : decayedRS

    // 7. Detect context diversity: if the session mode differs from
    //    what we've seen before, increment practice_contexts.
    //    We use a simple heuristic — if practice_contexts < practice_count,
    //    a new mode means a new context.
    const isNewContext = practiceContexts < Math.min(practiceCount + 1, 10)
      ? sessionMode !== ''  // only count if we have a mode
      : false

    // 8. Persist
    await supabase
      .from('user_node_mastery')
      .update({
        storage_strength: Math.round(newSS * 1000) / 1000,
        retrieval_strength: Math.round(newRS * 1000) / 1000,
        practice_count: practiceCount + 1,
        practice_contexts: isNewContext
          ? Math.min(practiceContexts + 1, 10)
          : practiceContexts,
      } as any)
      .eq('user_id', userId)
      .eq('topic_id', topicId)
  } catch (err) {
    // Memory strength update must not break the quiz flow
    console.error('[MEMORY-STRENGTH] updateMemoryStrength failed:', {
      error: err instanceof Error ? err.message : String(err),
      userId,
      topicId,
      timestamp: new Date().toISOString(),
    })
  }
}
