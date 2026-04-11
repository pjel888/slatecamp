import { describe, expect, test } from 'bun:test'

import { normalizeFeatureFlagRecord } from './normalize-feature-flag'

describe('normalizeFeatureFlagRecord', () => {
  test('expands legacy paid tier shape to all canonical paid tiers', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: '3d_lab_full',
      enabled: true,
      target_tier: ['camp', 'insurance', 'institutional'],
      target_roles: [],
    })

    expect(normalized.allowedTiers).toEqual([
      'pro',
      'prime',
      'institutional',
      'enterprise',
    ])
  })

  test('keeps canonical tiers unchanged', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: 'questions_unlimited',
      enabled: true,
      target_tier: ['pro', 'prime'],
      target_roles: [],
    })

    expect(normalized.allowedTiers).toEqual(['pro', 'prime'])
  })

  test('drops unknown tiers but keeps normalization trace', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: 'unknown_feature',
      enabled: true,
      target_tier: ['free', 'mystery-tier'],
      target_roles: [],
    })

    expect(normalized.allowedTiers).toEqual(['free'])
    expect(normalized.normalizationTrace).toContain('unknown-tier:mystery-tier')
  })
})
