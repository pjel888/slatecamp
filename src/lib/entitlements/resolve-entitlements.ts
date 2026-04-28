import {
  checkTierAccess,
  getConnectionState,
  resolveCapabilities,
  resolveEffectiveTier,
} from '@/lib/dev/dev-mode'
import {
  ENTITLEMENT_FEATURE_KEYS,
  PAID_ENTITLEMENT_FEATURE_KEYS,
  type EntitlementFeatureKey,
} from './feature-keys'
import { getPolicySnapshotForRole, getPermissionsForRole } from './policy'
import type {
  CanonicalSubscriptionStatus,
  FeatureAccessDecision,
  NormalizedFeatureFlag,
  ViewerEntitlements,
} from './types'
import type { UserTier } from '@/types/app'

interface ResolveEntitlementsInput {
  traceId: string
  userId: string | null
  email: string | null
  rawTier: UserTier
  subscriptionStatus: CanonicalSubscriptionStatus
  roleResolution: ViewerEntitlements['roleResolution']
  overrides: ViewerEntitlements['overrides']
  featureFlags: Partial<Record<EntitlementFeatureKey, NormalizedFeatureFlag>>
}

export const buildViewerEntitlements = ({
  traceId,
  userId,
  email,
  rawTier,
  subscriptionStatus,
  roleResolution,
  overrides,
  featureFlags,
}: ResolveEntitlementsInput): ViewerEntitlements => {
  const connectionState = overrides.localDevBypassActive
    ? 'local'
    : getConnectionState()
  const tooling = getPolicySnapshotForRole(
    roleResolution.normalizedRole,
    overrides.allowDevPortalBypass,
  )

  const effectiveTier = resolveEffectiveTier(
    rawTier,
    tooling.internalTierBypass,
    connectionState,
    {
      simulatedTier: overrides.forcedTier ?? overrides.simulatedTier,
      bypass3dGate:
        overrides.featureOverrides[ENTITLEMENT_FEATURE_KEYS.threeDLabFull] === true,
      bypassAiGate:
        overrides.featureOverrides[
          ENTITLEMENT_FEATURE_KEYS.aiAssistantUnlimited
        ] === true,
      bypassSrsGate:
        overrides.featureOverrides[ENTITLEMENT_FEATURE_KEYS.srsReview] === true,
    },
  )

  return {
    traceId,
    userId,
    email,
    normalizedRole: roleResolution.normalizedRole,
    compatibilityRole: roleResolution.compatibilityRole,
    roleResolution,
    rawTier,
    subscriptionStatus,
    effectiveTier,
    capabilities: resolveCapabilities(effectiveTier, {
      simulatedTier: overrides.forcedTier ?? overrides.simulatedTier,
      bypass3dGate:
        overrides.featureOverrides[ENTITLEMENT_FEATURE_KEYS.threeDLabFull] === true,
      bypassAiGate:
        overrides.featureOverrides[
          ENTITLEMENT_FEATURE_KEYS.aiAssistantUnlimited
        ] === true,
      bypassSrsGate:
        overrides.featureOverrides[ENTITLEMENT_FEATURE_KEYS.srsReview] === true,
    }),
    tooling,
    overrides,
    featureFlags,
    decisions: {},
    permissions: getPermissionsForRole(roleResolution.normalizedRole),
  }
}

export const evaluateFeatureAccess = (
  entitlements: ViewerEntitlements,
  featureKey: EntitlementFeatureKey,
): FeatureAccessDecision => {
  const trace: string[] = [`feature:${featureKey}`]
  const featureFlag = entitlements.featureFlags[featureKey]

  if (featureFlag && !featureFlag.enabled) {
    return {
      featureKey,
      allowed: false,
      reason: 'feature_disabled',
      source: 'flag',
      trace: [...trace, ...featureFlag.normalizationTrace, 'flag:disabled'],
    }
  }

  if (entitlements.overrides.featureOverrides[featureKey] === true) {
    return {
      featureKey,
      allowed: true,
      reason: 'allowed',
      source: 'override',
      trace: [...trace, 'override:true'],
    }
  }

  if (featureKey === ENTITLEMENT_FEATURE_KEYS.developerPortal) {
    return {
      featureKey,
      allowed: entitlements.tooling.developerPortal,
      reason: entitlements.tooling.developerPortal
        ? 'allowed'
        : 'tooling_policy_denied',
      source: 'policy',
      trace: [...trace, `policy:developerPortal=${entitlements.tooling.developerPortal}`],
    }
  }

  if (featureKey === ENTITLEMENT_FEATURE_KEYS.devToolbar) {
    return {
      featureKey,
      allowed: entitlements.tooling.devToolbar,
      reason: entitlements.tooling.devToolbar
        ? 'allowed'
        : 'tooling_policy_denied',
      source: 'policy',
      trace: [...trace, `policy:devToolbar=${entitlements.tooling.devToolbar}`],
    }
  }

  if (featureKey === ENTITLEMENT_FEATURE_KEYS.devOverrideWrite) {
    return {
      featureKey,
      allowed: entitlements.tooling.devOverrideWrite,
      reason: entitlements.tooling.devOverrideWrite
        ? 'allowed'
        : 'tooling_policy_denied',
      source: 'policy',
      trace: [...trace, `policy:devOverrideWrite=${entitlements.tooling.devOverrideWrite}`],
    }
  }

  if (featureKey === ENTITLEMENT_FEATURE_KEYS.adminCms) {
    return {
      featureKey,
      allowed: entitlements.tooling.adminCms,
      reason: entitlements.tooling.adminCms
        ? 'allowed'
        : 'admin_policy_denied',
      source: 'policy',
      trace: [...trace, `policy:adminCms=${entitlements.tooling.adminCms}`],
    }
  }

  if (featureKey === ENTITLEMENT_FEATURE_KEYS.srsReview) {
    return {
      featureKey,
      allowed: entitlements.capabilities.srsAccess,
      reason: entitlements.capabilities.srsAccess
        ? 'allowed'
        : 'insufficient_tier',
      source: 'tier',
      trace: [...trace, `capability:srsAccess=${entitlements.capabilities.srsAccess}`],
    }
  }

  if (featureKey === ENTITLEMENT_FEATURE_KEYS.threeDLabFull) {
    return {
      featureKey,
      allowed: entitlements.capabilities.threeDLabAccess,
      reason: entitlements.capabilities.threeDLabAccess
        ? 'allowed'
        : 'insufficient_tier',
      source: 'tier',
      trace: [
        ...trace,
        `capability:threeDLabAccess=${entitlements.capabilities.threeDLabAccess}`,
      ],
    }
  }

  if (featureKey === ENTITLEMENT_FEATURE_KEYS.aiAssistantUnlimited) {
    return {
      featureKey,
      allowed: entitlements.capabilities.aiTutorAccess,
      reason: entitlements.capabilities.aiTutorAccess
        ? 'allowed'
        : 'insufficient_tier',
      source: 'tier',
      trace: [...trace, `capability:aiTutorAccess=${entitlements.capabilities.aiTutorAccess}`],
    }
  }

  if (featureFlag && featureFlag.allowedTiers.length > 0) {
    const allowed = featureFlag.allowedTiers.includes(entitlements.effectiveTier)
    return {
      featureKey,
      allowed,
      reason: allowed ? 'allowed' : 'insufficient_tier',
      source: 'flag',
      trace: [
        ...trace,
        ...featureFlag.normalizationTrace,
        `allowedTiers:${featureFlag.allowedTiers.join(',')}`,
        `effectiveTier:${entitlements.effectiveTier}`,
      ],
    }
  }

  if (PAID_ENTITLEMENT_FEATURE_KEYS.has(featureKey)) {
    const allowed = checkTierAccess(
      'pro',
      entitlements.effectiveTier,
      {
        simulatedTier: entitlements.overrides.forcedTier ?? entitlements.overrides.simulatedTier,
        bypass3dGate:
          entitlements.overrides.featureOverrides[
            ENTITLEMENT_FEATURE_KEYS.threeDLabFull
          ] === true,
        bypassAiGate:
          entitlements.overrides.featureOverrides[
            ENTITLEMENT_FEATURE_KEYS.aiAssistantUnlimited
          ] === true,
        bypassSrsGate:
          entitlements.overrides.featureOverrides[
            ENTITLEMENT_FEATURE_KEYS.srsReview
          ] === true,
      },
    )

    return {
      featureKey,
      allowed,
      reason: allowed ? 'allowed' : 'insufficient_tier',
      source: 'tier',
      trace: [...trace, `paid-feature:${allowed}`],
    }
  }

  return {
    featureKey,
    allowed: true,
    reason: 'allowed',
    source: 'default',
    trace: [...trace, 'default:allow'],
  }
}
