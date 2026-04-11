import { describe, expect, test } from 'bun:test'

import { resolveRoleFromInputs } from './resolve-role'

describe('resolveRoleFromInputs', () => {
  test('prefers forced dev user bypass over all other sources', () => {
    const resolution = resolveRoleFromInputs({
      email: 'user@example.com',
      appMetadataRole: 'developer',
      profileRole: 'content_admin',
      forcedUserIdActive: true,
    })

    expect(resolution.normalizedRole).toBe('super_admin')
    expect(resolution.resolvedFrom).toBe('dev_force_user')
  })

  test('chooses the strongest recognized role across sources', () => {
    const resolution = resolveRoleFromInputs({
      email: 'user@example.com',
      appMetadataRole: 'sme_reviewer',
      profileRole: 'developer',
      userRoleRows: [{ role: 'content_admin' }],
    })

    expect(resolution.normalizedRole).toBe('content_admin')
    expect(resolution.compatibilityRole).toBe('content_admin')
  })

  test('falls back to admin email when no structured role exists', () => {
    process.env.ADMIN_EMAILS = 'admin@example.com'

    const resolution = resolveRoleFromInputs({
      email: 'admin@example.com',
    })

    expect(resolution.normalizedRole).toBe('super_admin')
    expect(resolution.resolvedFrom).toBe('admin_email')
  })

  test('returns member for authenticated users without an internal role', () => {
    const resolution = resolveRoleFromInputs({
      email: 'member@example.com',
    })

    expect(resolution.normalizedRole).toBe('member')
    expect(resolution.compatibilityRole).toBeNull()
  })

  test('returns anonymous for missing identity', () => {
    const resolution = resolveRoleFromInputs({})

    expect(resolution.normalizedRole).toBe('anonymous')
    expect(resolution.compatibilityRole).toBeNull()
  })
})
