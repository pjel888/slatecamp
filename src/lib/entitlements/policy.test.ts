import { describe, expect, test } from 'bun:test'

import {
  canAccessAdminCmsForRole,
  canAccessCeoPortalForRole,
  canAccessDeveloperPortalForRole,
  canSeeDevToolbarForRole,
  canWriteDevOverridesForRole,
  hasPermission,
  getPermissionsForRole,
} from './policy'

describe('entitlement policy', () => {
  test('keeps developer tooling separate from admin cms access', () => {
    expect(canSeeDevToolbarForRole('developer')).toBe(true)
    expect(canAccessAdminCmsForRole('developer')).toBe(true)
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

  test('allows admin cms access for general admin role', () => {
    expect(canAccessAdminCmsForRole('admin')).toBe(true)
  })

  test('keeps ceo portal restricted to ceo and super admin', () => {
    expect(canAccessCeoPortalForRole('ceo')).toBe(true)
    expect(canAccessCeoPortalForRole('super_admin')).toBe(true)
    expect(canAccessCeoPortalForRole('admin')).toBe(false)
  })

  test('hasPermission grants owner all admin permissions', () => {
    expect(hasPermission('owner', 'admin.audit.view')).toBe(true)
    expect(hasPermission('owner', 'admin.users.manage')).toBe(true)
    expect(hasPermission('owner', 'admin.content.create')).toBe(true)
  })

  test('hasPermission denies sme_reviewer content creation', () => {
    expect(hasPermission('sme_reviewer', 'admin.content.create')).toBe(false)
    expect(hasPermission('sme_reviewer', 'admin.content.edit')).toBe(false)
    expect(hasPermission('sme_reviewer', 'admin.content.approve')).toBe(true)
    expect(hasPermission('sme_reviewer', 'admin.reviews.view')).toBe(true)
  })

  test('hasPermission denies ceo audit log access', () => {
    expect(hasPermission('ceo', 'admin.audit.view')).toBe(false)
    expect(hasPermission('ceo', 'admin.users.manage')).toBe(true)
  })

  test('hasPermission denies member all admin permissions', () => {
    expect(hasPermission('member', 'admin.access')).toBe(false)
    expect(hasPermission('anonymous', 'admin.dashboard.view')).toBe(false)
  })

  test('getPermissionsForRole returns correct count', () => {
    expect(getPermissionsForRole('owner').length).toBe(20)
    expect(getPermissionsForRole('sme_reviewer').length).toBe(9)
    expect(getPermissionsForRole('member').length).toBe(0)
  })
})
