import { describe, expect, test } from 'bun:test'

import {
  canAccessAdminCmsForRole,
  canAccessCeoPortalForRole,
  canAccessDeveloperPortalForRole,
  canSeeDevToolbarForRole,
  canWriteDevOverridesForRole,
} from './policy'

describe('entitlement policy', () => {
  test('keeps developer tooling separate from admin cms access', () => {
    expect(canSeeDevToolbarForRole('developer')).toBe(true)
    expect(canAccessAdminCmsForRole('developer')).toBe(false)
  })

  test('allows reviewer content access without developer tooling', () => {
    expect(canAccessAdminCmsForRole('sme_reviewer')).toBe(true)
    expect(canSeeDevToolbarForRole('sme_reviewer')).toBe(false)
  })

  test('supports explicit developer portal bypass only through policy', () => {
    expect(canAccessDeveloperPortalForRole('member', false)).toBe(false)
    expect(canAccessDeveloperPortalForRole('member', true)).toBe(true)
  })

  test('limits override writes to internal engineering roles', () => {
    expect(canWriteDevOverridesForRole('developer')).toBe(true)
    expect(canWriteDevOverridesForRole('ceo')).toBe(false)
  })

  test('keeps ceo portal restricted to ceo and super admin', () => {
    expect(canAccessCeoPortalForRole('ceo')).toBe(true)
    expect(canAccessCeoPortalForRole('super_admin')).toBe(true)
    expect(canAccessCeoPortalForRole('admin')).toBe(false)
  })
})
