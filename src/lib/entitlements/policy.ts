import type { CanonicalRole, ToolingPolicySnapshot } from './types'

const DEV_TOOLBAR_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'super_admin',
  'content_admin',
  'developer',
  'admin',
  'ceo',
])

const INTERNAL_TIER_BYPASS_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'super_admin',
  'content_admin',
  'developer',
  'admin',
  'ceo',
])

const ADMIN_CMS_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'super_admin',
  'content_admin',
  'sme_reviewer',
])

const OVERRIDE_WRITE_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'super_admin',
  'content_admin',
  'developer',
])

const CEO_PORTAL_ROLES: ReadonlySet<CanonicalRole> = new Set(['super_admin', 'ceo'])

const MANAGE_USERS_ROLES: ReadonlySet<CanonicalRole> = new Set(['super_admin'])

export const canSeeDevToolbarForRole = (role: CanonicalRole): boolean =>
  DEV_TOOLBAR_ROLES.has(role)

export const canUseInternalTierBypassForRole = (role: CanonicalRole): boolean =>
  INTERNAL_TIER_BYPASS_ROLES.has(role)

export const canAccessAdminCmsForRole = (role: CanonicalRole): boolean =>
  ADMIN_CMS_ROLES.has(role)

export const canWriteDevOverridesForRole = (role: CanonicalRole): boolean =>
  OVERRIDE_WRITE_ROLES.has(role)

export const canAccessDeveloperPortalForRole = (
  role: CanonicalRole,
  allowBypass: boolean,
): boolean => allowBypass || canSeeDevToolbarForRole(role)

export const canAccessCeoPortalForRole = (role: CanonicalRole): boolean =>
  CEO_PORTAL_ROLES.has(role)

export const canReviewContentForRole = (role: CanonicalRole): boolean =>
  role === 'super_admin' || role === 'content_admin' || role === 'sme_reviewer'

export const canManageUsersForRole = (role: CanonicalRole): boolean =>
  MANAGE_USERS_ROLES.has(role)

export const getPolicySnapshotForRole = (
  role: CanonicalRole,
  allowDeveloperPortalBypass: boolean,
): ToolingPolicySnapshot => ({
  developerPortal: canAccessDeveloperPortalForRole(role, allowDeveloperPortalBypass),
  devToolbar: canSeeDevToolbarForRole(role),
  devOverrideWrite: canWriteDevOverridesForRole(role),
  internalTierBypass: canUseInternalTierBypassForRole(role),
  adminCms: canAccessAdminCmsForRole(role),
  canReviewContent: canReviewContentForRole(role),
  canManageUsers: canManageUsersForRole(role),
  ceoPortal: canAccessCeoPortalForRole(role),
})
