import { describe, expect, test } from 'bun:test'

import { isPaidSubscription, normalizeTierValue } from './normalize-tier'

describe('entitlement finalization helpers', () => {
  test('treats legacy feature tier vocabulary as canonical paid tiers', () => {
    expect(normalizeTierValue('camp', 'test').tier).toBe('pro')
    expect(normalizeTierValue('insurance', 'test').tier).toBe('institutional')
  })

  test('checks paid subscription using canonicalized tier and active statuses', () => {
    expect(isPaidSubscription('pro', 'active')).toBe(true)
    expect(isPaidSubscription('enterprise', 'trialing')).toBe(true)
    expect(isPaidSubscription('free', 'active')).toBe(false)
    expect(isPaidSubscription('pro', 'cancelled')).toBe(false)
  })
})
