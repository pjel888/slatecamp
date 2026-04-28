/// <reference types="bun-types" />
import { describe, test, expect, mock } from 'bun:test'

const originalGetViewerEntitlements = { ...(await import('@/lib/entitlements/get-viewer-entitlements')) }

mock.module('@/lib/entitlements/get-viewer-entitlements', () => ({
  ...originalGetViewerEntitlements,
  getViewerEntitlements: async (featureKeys: string[]) => {
    // Simulate based on a global test variable
    const role = (globalThis as any).__test_role__ ?? 'member'
    const allowed = role === 'developer' || role === 'admin' || role === 'super_admin' || role === 'owner' || role === 'ceo' || role === 'content_admin'
    return {
      decisions: {
        developer_portal: { allowed },
      },
    }
  },
}))

const { assertDeveloperAccess } = await import('./access')

describe('assertDeveloperAccess', () => {
  test('throws for member role', async () => {
    ;(globalThis as any).__test_role__ = 'member'
    await expect(assertDeveloperAccess()).rejects.toThrow('Not authorized to access developer tools')
  })

  test('throws for anonymous role', async () => {
    ;(globalThis as any).__test_role__ = 'anonymous'
    await expect(assertDeveloperAccess()).rejects.toThrow('Not authorized to access developer tools')
  })

  test('throws for sme_reviewer role', async () => {
    ;(globalThis as any).__test_role__ = 'sme_reviewer'
    await expect(assertDeveloperAccess()).rejects.toThrow('Not authorized to access developer tools')
  })

  test('resolves for developer role', async () => {
    ;(globalThis as any).__test_role__ = 'developer'
    await expect(assertDeveloperAccess()).resolves.toBeUndefined()
  })

  test('resolves for admin role', async () => {
    ;(globalThis as any).__test_role__ = 'admin'
    await expect(assertDeveloperAccess()).resolves.toBeUndefined()
  })

  test('resolves for super_admin role', async () => {
    ;(globalThis as any).__test_role__ = 'super_admin'
    await expect(assertDeveloperAccess()).resolves.toBeUndefined()
  })

  test('resolves for owner role', async () => {
    ;(globalThis as any).__test_role__ = 'owner'
    await expect(assertDeveloperAccess()).resolves.toBeUndefined()
  })

  test('resolves for ceo role', async () => {
    ;(globalThis as any).__test_role__ = 'ceo'
    await expect(assertDeveloperAccess()).resolves.toBeUndefined()
  })
})
