'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type { UserTier } from '@/types/app'

export type FeatureKey =
  | 'readiness_score_live'
  | 'taxonomy_heatmap_full'
  | 'questions_all_difficulty'
  | 'questions_unlimited'
  | 'camp_trails_full_library'
  | 'blindspot_protocol'
  | 'endurance_cycle'
  | 'proof_simulation'
  | '3d_lab_full'
  | 'analytics_dashboard_full'
  | 'ai_assistant_unlimited'

interface AccessResult {
  allowed: boolean
  reason?: string
  userTier: UserTier
  requiredTier: string[]
}

/** Tiers that count as "paid" (non-free). */
const PAID_TIERS: UserTier[] = ['pro', 'prime', 'institutional']

/**
 * Check if the current user has access to a gated feature.
 *
 * Reads `feature_flags` (DB table) + `user_subscriptions`.
 * If the flag row doesn't exist or is disabled, access is open to all.
 *
 * Usage in Server Components:
 *   const access = await checkFeatureAccess('blindspot_protocol')
 *   if (!access.allowed) return <PaywallBlock reason={access.reason} />
 *
 * Usage in Server Actions:
 *   const access = await checkFeatureAccess('questions_unlimited')
 *   if (!access.allowed) return { error: 'Upgrade to Camp to unlock this feature' }
 */
export const checkFeatureAccess = async (featureKey: FeatureKey): Promise<AccessResult> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) {
    return { allowed: false, reason: 'Not authenticated', userTier: 'free', requiredTier: [] }
  }

  // Get user's subscription tier
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle()

  const isActive = sub?.status === 'active' || sub?.status === 'trialing'
  const userTier: UserTier = (isActive ? (sub?.tier as UserTier) : null) ?? 'free'

  // Get the feature flag from DB
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('enabled, target_tier')
    .eq('key', featureKey)
    .maybeSingle()

  // If flag doesn't exist or is disabled, feature is open to all
  if (!flag || !flag.enabled) {
    return { allowed: true, userTier, requiredTier: [] }
  }

  // Check if user's tier is in the target_tier array
  const requiredTier = (flag.target_tier as string[]) || []
  const allowed = requiredTier.includes(userTier)

  return {
    allowed,
    reason: allowed ? undefined : 'Upgrade to Pro to unlock this feature',
    userTier,
    requiredTier,
  }
}

/**
 * Quick boolean check for use in conditions.
 */
export const canAccess = async (featureKey: FeatureKey): Promise<boolean> => {
  const result = await checkFeatureAccess(featureKey)
  return result.allowed
}

/**
 * Get the user's current subscription tier. Reusable utility.
 */
export const getUserTier = async (): Promise<UserTier> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return 'free'

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle()

  const isActive = sub?.status === 'active' || sub?.status === 'trialing'
  return (isActive ? (sub?.tier as UserTier) : null) ?? 'free'
}

/**
 * Check if user is on a paid tier (pro, prime, institutional, enterprise).
 */
export const isPaidUser = async (): Promise<boolean> => {
  const tier = await getUserTier()
  return PAID_TIERS.includes(tier)
}
