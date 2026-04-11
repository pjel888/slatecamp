import { describe, expect, test } from 'bun:test'

import { canSeeDevToolbar, canUseInternalTierBypass } from './access-policy'

describe('admin access policy', () => {
  test('allows internal tooling roles to see the dev toolbar', () => {
    expect(canSeeDevToolbar('developer')).toBe(true)
    expect(canSeeDevToolbar('admin')).toBe(true)
    expect(canSeeDevToolbar('ceo')).toBe(true)
    expect(canSeeDevToolbar('content_admin')).toBe(true)
    expect(canSeeDevToolbar('super_admin')).toBe(true)
  })

  test('excludes sme_reviewer from dev-toolbar access by default', () => {
    expect(canSeeDevToolbar('sme_reviewer')).toBe(false)
    expect(canSeeDevToolbar(null)).toBe(false)
  })

  test('uses the same least-privilege default for internal tier bypass', () => {
    expect(canUseInternalTierBypass('developer')).toBe(true)
    expect(canUseInternalTierBypass('content_admin')).toBe(true)
    expect(canUseInternalTierBypass('sme_reviewer')).toBe(false)
    expect(canUseInternalTierBypass(null)).toBe(false)
  })
})
