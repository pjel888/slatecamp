import { describe, expect, test } from 'bun:test'

import { normalizeFeatureFlagRecord } from './normalize-feature-flag'

describe('normalizeFeatureFlagRecord', () => {
  test('drops legacy paid tier values after launch data normalization', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: '3d_lab_full',
      enabled: true,
      target_tier: ['camp', 'insurance', 'institutional'],
    })

    expect(normalized.allowedTiers).toEqual(['institutional'])
    expect(normalized.normalizationTrace).toContain('unknown-tier:camp')
    expect(normalized.normalizationTrace).toContain('unknown-tier:insurance')
  })

  test('keeps canonical tiers unchanged', () => {
    const normalized = normalizeFeatureFlagRecord({
      key: 'questions_unlimited',
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
