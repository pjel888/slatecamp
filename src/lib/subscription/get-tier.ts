'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { UserTier } from '@/types/app'

/**
 * Get the current user's subscription tier from the database.
 * Wrapped with React cache() to deduplicate calls within a single RSC render pass.
 *
 * Returns 'free' if no user or no subscription record found.
 *
 * Usage:
 *   const tier = await getUserTier()
 *   if (tier === 'camp') { ... }
 */
export const getUserTier = cache(async (): Promise<UserTier> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 'free'

  // Dev Mode Bypass: grant highest tier locally for testing
  if (process.env.NODE_ENV === 'development' && !!process.env.DEV_FORCE_USER_ID) {
    return 'institutional'
  }

  const { data } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  return (data?.tier as UserTier) ?? 'free'
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
  camp: 1,
  insurance: 2,
  institutional: 3,
}

export const hasMinTier = async (requiredTier: UserTier): Promise<boolean> => {
  const tier = await getUserTier()
  return TIER_RANK[tier] >= TIER_RANK[requiredTier]
}
