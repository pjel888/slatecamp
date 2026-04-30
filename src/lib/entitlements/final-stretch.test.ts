import { describe, expect, test } from 'bun:test'

import { isPaidSubscription, normalizeTierValue } from './normalize-tier'

describe('entitlement finalization helpers', () => {
  test('rejects legacy tier vocabulary after launch data normalization', () => {
    expect(() => normalizeTierValue('camp', 'test')).toThrow('Unknown tier value')
    expect(() => normalizeTierValue('insurance', 'test')).toThrow('Unknown tier value')
  })

  test('checks paid subscription using canonicalized tier and active statuses', () => {
    expect(isPaidSubscription('pro', 'active')).toBe(true)
    expect(isPaidSubscription('enterprise', 'trialing')).toBe(true)
    expect(isPaidSubscription('free', 'active')).toBe(false)
    expect(isPaidSubscription('pro', 'cancelled')).toBe(false)
  })
})
