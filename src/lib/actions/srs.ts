'use server'

import { createServiceClient, getUser } from '@/lib/supabase/server'

export const startReviewSession = async (userId: string, limit = 10) => {
  try {
    const { data: { user } } = await getUser()
    if (!user || user.id !== userId) throw new Error('Unauthorized')

    const supabase = await createServiceClient()
    const { data, error } = await supabase.rpc('get_review_deck', {
      p_user_id: userId,
      p_limit: limit,
    })
    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (err) {
    console.error('[SRS: startReviewSession]', err)
    return { data: [], error: 'Failed to load review deck.' }
  }
}
