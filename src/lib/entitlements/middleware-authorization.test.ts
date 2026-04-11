import { describe, expect, test } from 'bun:test'

import { resolveRoleFromInputs } from './resolve-role'
import {
  canAccessAdminCmsForRole,
  canAccessCeoPortalForRole,
  canAccessDeveloperPortalForRole,
} from './policy'

describe('middleware authorization matrix', () => {
  test('allows admin cms only for content/admin review roles', () => {
    expect(
      canAccessAdminCmsForRole(
        resolveRoleFromInputs({ appMetadataRole: 'content_admin', email: 'a@b.com' }).normalizedRole,
      ),
    ).toBe(true)
    expect(
      canAccessAdminCmsForRole(
        resolveRoleFromInputs({ appMetadataRole: 'developer', email: 'a@b.com' }).normalizedRole,
      ),
    ).toBe(false)
  })

  test('allows developer portal only through tooling roles or explicit bypass', () => {
    expect(
      canAccessDeveloperPortalForRole(
        resolveRoleFromInputs({ appMetadataRole: 'developer', email: 'a@b.com' }).normalizedRole,
        false,
      ),
    ).toBe(true)
    expect(
      canAccessDeveloperPortalForRole(
        resolveRoleFromInputs({ email: 'member@example.com' }).normalizedRole,
        false,
      ),
    ).toBe(false)
    expect(
      canAccessDeveloperPortalForRole(
        resolveRoleFromInputs({ email: 'member@example.com' }).normalizedRole,
        true,
      ),
    ).toBe(true)
  })

  test('limits ceo portal to ceo and super admin', () => {
    expect(
      canAccessCeoPortalForRole(
        resolveRoleFromInputs({ appMetadataRole: 'ceo', email: 'ceo@example.com' }).normalizedRole,
      ),
    ).toBe(true)
    expect(
      canAccessCeoPortalForRole(
        resolveRoleFromInputs({ appMetadataRole: 'admin', email: 'admin@example.com' }).normalizedRole,
      ),
    ).toBe(false)
  })
})
