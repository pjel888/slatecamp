/// <reference types="bun-types" />
import { describe, test, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

let ceoAccessAllowed = true

mock.module('@/lib/entitlements/get-viewer-entitlements', () => ({
  getViewerEntitlements: () =>
    Promise.resolve({
      decisions: {
        ceo_portal: { allowed: ceoAccessAllowed },
      },
    }),
}))

const { assertCeoAccess } = await import('./access')

describe('assertCeoAccess', () => {
  test('resolves for allowed entitlements', async () => {
    ceoAccessAllowed = true
    await expect(assertCeoAccess()).resolves.toBeUndefined()
  })

  test('throws when CEO portal access is denied', async () => {
    ceoAccessAllowed = false
    await expect(assertCeoAccess()).rejects.toThrow(
      'Not authorized: CEO portal access required',
    )
    ceoAccessAllowed = true
  })
})
