import { describe, expect, test } from 'bun:test'

import { ENTITLEMENT_FEATURE_KEYS } from './feature-keys'
import { isKnownFeatureKey, normalizeFeatureFlagRecord } from './normalize-feature-flag'

describe('feature flag normalization', () => {
  test('recognizes only canonical database-backed entitlement keys', () => {
    expect(isKnownFeatureKey(ENTITLEMENT_FEATURE_KEYS.readinessScoreLive)).toBe(true)
    expect(isKnownFeatureKey(ENTITLEMENT_FEATURE_KEYS.taxonomyHeatmapFull)).toBe(true)
    expect(isKnownFeatureKey(ENTITLEMENT_FEATURE_KEYS.questionsUnlimited)).toBe(true)
    expect(isKnownFeatureKey(ENTITLEMENT_FEATURE_KEYS.focusReviewProtocol)).toBe(true)
    expect(isKnownFeatureKey(ENTITLEMENT_FEATURE_KEYS.fullExam)).toBe(true)

    expect(isKnownFeatureKey('live_readiness_score')).toBe(false)
    expect(isKnownFeatureKey('full_heatmap')).toBe(false)
    expect(isKnownFeatureKey('unlimited_questions')).toBe(false)
    expect(isKnownFeatureKey('blindspot_protocol')).toBe(false)
    expect(isKnownFeatureKey('proof_simulation')).toBe(false)
  })

  test('keeps unknown target tiers out of entitlement decisions and traces them', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
      enabled: true,
      target_tier: ['pro', 'camp', 'enterprise'],
    })

    expect(normalized.allowedTiers).toEqual(['pro', 'enterprise'])
    expect(normalized.normalizationTrace).toContain('unknown-tier:camp')
  })

  test('drops legacy paid tier values after launch data normalization', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: ENTITLEMENT_FEATURE_KEYS.threeDLabFull,
      enabled: true,
      target_tier: ['camp', 'insurance', 'institutional'],
    })

    expect(normalized.allowedTiers).toEqual(['institutional'])
    expect(normalized.normalizationTrace).toContain('unknown-tier:camp')
    expect(normalized.normalizationTrace).toContain('unknown-tier:insurance')
  })

  test('keeps canonical tiers unchanged', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
      enabled: true,
      target_tier: ['pro', 'prime'],
    })

    expect(normalized.allowedTiers).toEqual(['pro', 'prime'])
  })

  test('drops unknown tiers but keeps normalization trace', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: 'unknown_feature',
      enabled: true,
      target_tier: ['free', 'mystery-tier'],
    })

    expect(normalized.allowedTiers).toEqual(['free'])
    expect(normalized.normalizationTrace).toContain('unknown-tier:mystery-tier')
  })
})
