import { beforeEach, describe, expect, mock, test } from 'bun:test'

let cookieValue: string | undefined

mock.module('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'cerebro_dev_flags' && cookieValue
        ? { value: cookieValue }
        : undefined,
  }),
}))

const { readDevOverrideCookie, resolveDevOverrides } = await import('./dev-overrides')

describe('dev overrides', () => {
  beforeEach(() => {
    cookieValue = undefined
    delete process.env.DEV_FORCE_TIER
    delete process.env.DEV_FORCE_USER_ID
    delete process.env.ALLOW_DEV_PORTAL_BYPASS
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'test'
  })

  test('reads cookie payload as-is', async () => {
    cookieValue = JSON.stringify({
      simulatedTier: 'prime',
      bypass3dGate: true,
    })

    const payload = await readDevOverrideCookie()

    expect(payload.simulatedTier).toBe('prime')
    expect(payload.bypass3dGate).toBe(true)
  })

  test('migrates legacy spoofed tier into simulated tier', async () => {
    cookieValue = JSON.stringify({
      spoofedTier: 'pro',
    })

    const overrides = await resolveDevOverrides()

    expect(overrides.simulatedTier).toBe('pro')
    expect(overrides.legacySpoofedTier).toBe('pro')
  })

  test('captures env-backed override state', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'development'
    process.env.DEV_FORCE_TIER = 'institutional'
    process.env.DEV_FORCE_USER_ID = '00000000-0000-0000-0000-000000000001'
    process.env.ALLOW_DEV_PORTAL_BYPASS = 'true'

    const overrides = await resolveDevOverrides()

    expect(overrides.forcedTier).toBe('institutional')
    expect(overrides.forcedUserIdActive).toBe(true)
    expect(overrides.allowDevPortalBypass).toBe(true)
  })
})
