import { describe, expect, test } from 'bun:test'

import { shouldBypassAdminShellChrome } from './AdminShell'

describe('shouldBypassAdminShellChrome', () => {
  test('bypasses chrome for admin preview routes', () => {
    expect(shouldBypassAdminShellChrome('/admin/preview/123')).toBe(true)
  })

  test('keeps chrome for normal admin routes', () => {
    expect(shouldBypassAdminShellChrome('/admin/knowledge')).toBe(false)
    expect(shouldBypassAdminShellChrome('/admin/settings')).toBe(false)
  })
})
