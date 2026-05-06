import { afterEach, describe, expect, test } from 'bun:test'
import {
  assertSafeProductionEnv,
  getUnsafeProductionEnvFlags,
  isDevForceUserAllowed,
  isDevPortalBypassAllowed,
} from './production-guardrails'

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DEV_FORCE_USER_ID: process.env.DEV_FORCE_USER_ID,
  DEV_FORCE_TIER: process.env.DEV_FORCE_TIER,
  ALLOW_DEV_PORTAL_BYPASS: process.env.ALLOW_DEV_PORTAL_BYPASS,
  DISABLE_DEV_FORCE_USER_ID: process.env.DISABLE_DEV_FORCE_USER_ID,
}

const setNodeEnv = (value: string) => {
  ;(process.env as Record<string, string | undefined>).NODE_ENV = value
}

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

describe('production environment guardrails', () => {
  test('disables developer portal bypass in production even when env flag is true', () => {
    setNodeEnv('production')
    process.env.ALLOW_DEV_PORTAL_BYPASS = 'true'

    expect(isDevPortalBypassAllowed()).toBe(false)
    expect(getUnsafeProductionEnvFlags()).toContain('ALLOW_DEV_PORTAL_BYPASS')
  })

  test('disables forced user impersonation in production', () => {
    setNodeEnv('production')
    process.env.DEV_FORCE_USER_ID = '00000000-0000-0000-0000-000000000001'

    expect(isDevForceUserAllowed()).toBe(false)
    expect(getUnsafeProductionEnvFlags()).toContain('DEV_FORCE_USER_ID')
  })

  test('allows dev bypass variables outside production', () => {
    setNodeEnv('development')
    process.env.ALLOW_DEV_PORTAL_BYPASS = 'true'
    process.env.DEV_FORCE_USER_ID = '00000000-0000-0000-0000-000000000001'

    expect(isDevPortalBypassAllowed()).toBe(true)
    expect(isDevForceUserAllowed()).toBe(true)
    expect(getUnsafeProductionEnvFlags()).toEqual([])
  })

  test('throws a non-secret production configuration error for unsafe flags', () => {
    setNodeEnv('production')
    process.env.DEV_FORCE_USER_ID = '00000000-0000-0000-0000-000000000001'
    process.env.DEV_FORCE_TIER = 'prime'

    expect(() => assertSafeProductionEnv()).toThrow(
      'Unsafe production environment configuration: DEV_FORCE_USER_ID, DEV_FORCE_TIER',
    )
  })
})
