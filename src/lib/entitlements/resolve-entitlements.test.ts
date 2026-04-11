import { describe, expect, test } from 'bun:test'

import { ENTITLEMENT_FEATURE_KEYS } from './feature-keys'
import { buildViewerEntitlements, evaluateFeatureAccess } from './resolve-entitlements'

const baseRoleResolution = {
  normalizedRole: 'member' as const,
  compatibilityRole: null,
  resolvedFrom: 'none' as const,
  roleSources: ['none' as const],
  precedenceTrace: ['fallback=>member'],
}

const baseOverrides = {
  simulatedTier: null,
  legacySpoofedTier: null,
  forcedTier: null,
  forcedUserIdActive: false,
  localDevBypassActive: false,
  allowDevPortalBypass: false,
  featureOverrides: {},
  sourceTrace: [],
}

describe('resolve entitlements', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'

  test('denies paid features for free members by default', () => {
    const entitlements = buildViewerEntitlements({
      traceId: 'test-trace',
      userId: 'user-1',
      email: 'user@example.com',
      rawTier: 'free',
      subscriptionStatus: 'active',
      roleResolution: baseRoleResolution,
      overrides: baseOverrides,
      featureFlags: {},
    })

    const decision = evaluateFeatureAccess(
      entitlements,
      ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
    )

    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('insufficient_tier')
  })

  test('allows paid features for pro users', () => {
    const entitlements = buildViewerEntitlements({
      traceId: 'test-trace',
      userId: 'user-1',
      email: 'user@example.com',
      rawTier: 'pro',
      subscriptionStatus: 'active',
      roleResolution: baseRoleResolution,
      overrides: baseOverrides,
      featureFlags: {},
    })

    const decision = evaluateFeatureAccess(
      entitlements,
      ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
    )

    expect(decision.allowed).toBe(true)
  })

  test('applies tooling policy decisions independently from paid tier', () => {
    const entitlements = buildViewerEntitlements({
      traceId: 'test-trace',
      userId: 'user-1',
      email: 'dev@example.com',
      rawTier: 'free',
      subscriptionStatus: 'active',
      roleResolution: {
        ...baseRoleResolution,
        normalizedRole: 'developer',
        compatibilityRole: 'developer',
        resolvedFrom: 'app_metadata',
      },
      overrides: baseOverrides,
      featureFlags: {},
    })

    expect(
      evaluateFeatureAccess(entitlements, ENTITLEMENT_FEATURE_KEYS.developerPortal).allowed,
    ).toBe(true)
    expect(
      evaluateFeatureAccess(entitlements, ENTITLEMENT_FEATURE_KEYS.adminCms).allowed,
    ).toBe(false)
  })

  test('honors explicit feature overrides for 3d lab', () => {
    const entitlements = buildViewerEntitlements({
      traceId: 'test-trace',
      userId: 'user-1',
      email: 'user@example.com',
      rawTier: 'free',
      subscriptionStatus: 'active',
      roleResolution: baseRoleResolution,
      overrides: {
        ...baseOverrides,
        featureOverrides: {
          [ENTITLEMENT_FEATURE_KEYS.threeDLabFull]: true,
        },
      },
      featureFlags: {},
    })

    const decision = evaluateFeatureAccess(
      entitlements,
      ENTITLEMENT_FEATURE_KEYS.threeDLabFull,
    )

    expect(decision.allowed).toBe(true)
    expect(decision.source).toBe('override')
  })

  test('denies disabled feature flags even for paid users', () => {
    const entitlements = buildViewerEntitlements({
      traceId: 'test-trace',
      userId: 'user-1',
      email: 'user@example.com',
      rawTier: 'enterprise',
      subscriptionStatus: 'active',
      roleResolution: baseRoleResolution,
      overrides: baseOverrides,
      featureFlags: {
        [ENTITLEMENT_FEATURE_KEYS.proofSimulationEnabled]: {
          key: ENTITLEMENT_FEATURE_KEYS.proofSimulationEnabled,
          enabled: false,
          allowedTiers: [],
          rawTargetTier: [],
          rawTargetRoles: [],
          normalizationTrace: ['disabled'],
        },
      },
    })

    const decision = evaluateFeatureAccess(
      entitlements,
      ENTITLEMENT_FEATURE_KEYS.proofSimulationEnabled,
    )

    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBe('feature_disabled')
  })
})
