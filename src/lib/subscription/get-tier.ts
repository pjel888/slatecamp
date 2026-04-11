'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import type { UserTier } from '@/types/app'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'

/**
 * Get the current user's subscription tier from the database.
 * Wrapped with React cache() to deduplicate calls within a single RSC render pass.
 *
 * Returns 'free' if no user or no subscription record found.
 *
 * @deprecated Use `getViewerEntitlements()` for entitlement-aware access decisions.
 *
 * Usage:
 *   const tier = await getUserTier()
 *   if (tier === 'pro') { ... }
 */
export const getUserTier = cache(async (): Promise<UserTier> => {
  if (!FEATURE_PAYMENTS_ENABLED) return 'free'
  const entitlements = await getViewerEntitlements()
  return entitlements.rawTier
})

/**
 * Get the current user's full subscription record.
 * Wrapped with React cache() for dedup within a render pass.
 */
export const getUserSubscription = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('user_subscriptions')
    .select('subscription_id, tier, status, amount, free_questions_today, free_cap_reset_date, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

  return data
})

/**
 * Check if the user has at least the required tier.
 */
const TIER_RANK: Record<UserTier, number> = {
  free: 0,
  pro: 1,
  prime: 2,
  institutional: 3,
  enterprise: 4,
}

export const hasMinTier = async (requiredTier: UserTier): Promise<boolean> => {
  const entitlements = await getViewerEntitlements()
  return TIER_RANK[entitlements.effectiveTier] >= TIER_RANK[requiredTier]
}
