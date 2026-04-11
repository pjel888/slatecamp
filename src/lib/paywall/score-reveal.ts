'use server'

import { createClient } from '@/lib/supabase/server'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

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

  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.readinessScoreLive,
  ])
  const paidAccess =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.readinessScoreLive]?.allowed ?? false

  if (paidAccess) return { canView: true, shownAt: null }

  const supabase = await createClient()

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
