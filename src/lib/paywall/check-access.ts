'use server'

import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { evaluateFeatureAccess } from '@/lib/entitlements/resolve-entitlements'
import type { EntitlementFeatureKey } from '@/lib/entitlements/feature-keys'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
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
const PAID_TIERS: UserTier[] = ['pro', 'prime', 'institutional', 'enterprise']

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
  if (!FEATURE_PAYMENTS_ENABLED) {
    return { allowed: true, userTier: 'free', requiredTier: [] }
  }

  const entitlements = await getViewerEntitlements([
    featureKey as EntitlementFeatureKey,
  ])

  if (!entitlements.userId) {
    return { allowed: false, reason: 'Not authenticated', userTier: 'free', requiredTier: [] }
  }

  const decision = evaluateFeatureAccess(
    entitlements,
    featureKey as EntitlementFeatureKey,
  )
  const normalizedFlag = entitlements.featureFlags[featureKey as EntitlementFeatureKey]

  return {
    allowed: decision.allowed,
    reason: decision.allowed ? undefined : 'Upgrade to Pro to unlock this feature',
    userTier: entitlements.effectiveTier,
    requiredTier: normalizedFlag?.allowedTiers ?? [],
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
  if (!FEATURE_PAYMENTS_ENABLED) return 'free'
  const entitlements = await getViewerEntitlements()
  return entitlements.effectiveTier
}

/**
 * Check if user is on a paid tier (pro, prime, institutional, enterprise).
 */
export const isPaidUser = async (): Promise<boolean> => {
  if (!FEATURE_PAYMENTS_ENABLED) return false

  const tier = await getUserTier()
  return PAID_TIERS.includes(tier)
}
