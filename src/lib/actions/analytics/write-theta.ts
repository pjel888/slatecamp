'use server'

import { createCachedClient } from '@/lib/actions/analytics/shared-helpers'
import { updateTheta } from '@/lib/srs/irt'

/**
 * Compute the user's theta estimate from session interactions and upsert to user_theta.
 *
 * Fire-and-forget: callers should `void writeUserTheta(...)` so it never blocks
 * the session-end response.
 */
export const writeUserTheta = async (
  userId: string,
  sessionId: string,
): Promise<void> => {
  try {
    const supabase = await createCachedClient()

    // Fetch interactions with their question metadata for IRT computation
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('question_id, is_correct, topic_id')
      .eq('session_id', sessionId)
      .eq('user_id', userId)

    if (!interactions || interactions.length === 0) return

    const questionIds = interactions.map((i) => i.question_id)

    const { data: questions } = await supabase
      .from('questions')
      .select('question_id, difficulty_rating, discrimination_rating, discipline_id')
      .in('question_id', questionIds)

    if (!questions || questions.length === 0) return

    const questionMap = new Map(questions.map((q) => [q.question_id, q]))

    // Determine discipline from first question
    const disciplineId = questions[0]?.discipline_id ?? null

    // Fetch current theta for this discipline (or default to 0)
    const { data: existing } = await supabase
      .from('user_theta')
      .select('theta, responses_count')
      .eq('user_id', userId)
      .eq('discipline_id', disciplineId ?? '')
      .maybeSingle()

    let theta = existing?.theta ?? 0
    let responsesCount = existing?.responses_count ?? 0

    // Walk through interactions updating theta via IRT
    for (const interaction of interactions) {
      const question = questionMap.get(interaction.question_id)
      if (!question) continue

      theta = updateTheta(theta, question as Parameters<typeof updateTheta>[1], interaction.is_correct)
      responsesCount += 1
    }

    // Compute standard error approximation
    const thetaSe = responsesCount > 0 ? 1 / Math.sqrt(responsesCount) : 1

    await supabase.from('user_theta').upsert(
      {
        user_id: userId,
        discipline_id: disciplineId,
        theta,
        theta_se: thetaSe,
        responses_count: responsesCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,discipline_id' },
    )
  } catch (err) {
    // Never block session end on theta writes
    console.error('[ANALYTICS] writeUserTheta failed:', err)
  }
}
