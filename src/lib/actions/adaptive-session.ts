'use server'

import { createClient } from '@/lib/supabase/server'

export const selectNextAdaptiveQuestion = async (
  userId: string,
  sessionId: string,
  disciplineId?: string,
  topicId?: string,
) => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('select_next_item', {
      p_user_id: userId,
      p_session_id: sessionId,
      p_discipline_id: disciplineId ?? null,
      p_topic_id: topicId ?? null,
      p_target_p: 0.75,
    })

    if (error || !data?.length) {
      console.error('[ADAPTIVE: selectNext] RPC failed, falling back:', error)
      return { data: null, error: 'No adaptive question available' }
    }

    return { data: data[0], error: null }
  } catch (err) {
    console.error('[ADAPTIVE: selectNext]', err)
    return { data: null, error: 'Failed to select adaptive question' }
  }
}
