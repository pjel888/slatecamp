import type { UserTier } from '@/types/app'
import type { EntitlementAuditEvent } from './types'

const CANONICAL_TIERS = new Set<UserTier>([
  'free',
  'pro',
  'prime',
  'institutional',
  'enterprise',
])

export interface TierNormalizationResult {
  tier: UserTier
  wasLegacy: boolean
  rawValue: string | null
  trace: string[]
}

export const isCanonicalTier = (value: unknown): value is UserTier =>
  typeof value === 'string' && CANONICAL_TIERS.has(value as UserTier)

export const normalizeTierValue = (
  value: unknown,
  context: string,
): TierNormalizationResult => {
  if (value == null || value === '') {
    return {
      tier: 'free',
      wasLegacy: false,
      rawValue: null,
      trace: [`${context}:missing=>free`],
    }
  }

  if (isCanonicalTier(value)) {
    return {
      tier: value,
      wasLegacy: false,
      rawValue: value,
      trace: [`${context}:${value}`],
    }
  }

  throw new Error(`Unknown tier value "${String(value)}" in ${context}`)
}

export const tierMeetsMinimum = (tier: UserTier, minimumTier: UserTier): boolean => {
  const rank: Record<UserTier, number> = {
    free: 0,
    pro: 1,
    prime: 2,
    institutional: 3,
    enterprise: 4,
  }

  return rank[tier] >= rank[minimumTier]
}

export const isActiveSubscriptionStatus = (status: string | null | undefined): boolean =>
  status === 'active' || status === 'trialing'

export const isPaidTier = (tier: UserTier): boolean => tier !== 'free'

export const isPaidSubscription = (
  tier: UserTier,
  status: string | null | undefined,
): boolean => isActiveSubscriptionStatus(status) && isPaidTier(tier)

export const toConfigMismatchEvent = (
  traceId: string,
  userId: string | null,
  value: unknown,
  context: string,
): EntitlementAuditEvent => ({
  eventName: 'entitlement.config.mismatch',
  timestamp: new Date().toISOString(),
  traceId,
  userId,
  routeOrAction: context,
  normalizedRole: userId ? 'member' : 'anonymous',
  roleSource: 'none',
  rawTier: 'free',
  subscriptionStatus: 'unknown',
  effectiveTier: 'free',
  overrideState: {
    simulatedTier: null,
    legacySpoofedTier: null,
    forcedTier: null,
    forcedUserIdActive: false,
    localDevBypassActive: false,
    allowDevPortalBypass: false,
    featureOverrides: {},
    sourceTrace: [`unknown-tier:${String(value)}`],
  },
  trace: [`unknown-tier:${String(value)}@${context}`],
})
