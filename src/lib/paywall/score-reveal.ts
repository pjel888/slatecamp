'use server'

import { createClient } from '@/lib/supabase/server'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'

/**
 * Check if the free user has already seen the score reveal.
 * Paid users can always view.
 * Returns: { canView, shownAt }
 */
export const checkScoreRevealAccess = async (userId: string): Promise<{
  canView: boolean
  shownAt: Date | null
}> => {
  if (!FEATURE_PAYMENTS_ENABLED) {
    return { canView: true, shownAt: null }
  }

  const supabase = await createClient()

  // Check subscription
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .maybeSingle()

  const isPaid =
    (sub?.status === 'active' || sub?.status === 'trialing') &&
    sub?.tier !== 'free'

  if (isPaid) return { canView: true, shownAt: null }

  // Check if already shown
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('score_reveal_shown_at')
    .eq('user_id', userId)
    .single()

  if (stats?.score_reveal_shown_at) {
    return { canView: false, shownAt: new Date(stats.score_reveal_shown_at) }
  }

  return { canView: true, shownAt: null }
}

/**
 * Mark the score reveal as consumed.
 * Call ONCE when the score reveal screen renders for a free user.
 */
export const markScoreRevealed = async (userId: string): Promise<void> => {
  const supabase = await createClient()
  await supabase
    .from('user_global_stats')
    .update({ score_reveal_shown_at: new Date().toISOString() })
    .eq('user_id', userId)
}
