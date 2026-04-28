import type { CanonicalRole, ToolingPolicySnapshot, AdminPermission } from './types'

const DEV_TOOLBAR_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'owner',
  'super_admin',
  'content_admin',
  'developer',
  'admin',
  'ceo',
])

const INTERNAL_TIER_BYPASS_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'owner',
  'super_admin',
  'content_admin',
  'developer',
  'admin',
  'ceo',
])

const ADMIN_CMS_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'owner',
  'super_admin',
  'content_admin',
  'sme_reviewer',
  'admin',
  'developer',
  'ceo',
])

const OVERRIDE_WRITE_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'owner',
  'super_admin',
  'content_admin',
  'developer',
])

const CEO_PORTAL_ROLES: ReadonlySet<CanonicalRole> = new Set(['owner', 'super_admin', 'ceo'])

const MANAGE_CONTENT_ROLES: ReadonlySet<CanonicalRole> = new Set([
  'owner',
  'super_admin',
  'content_admin',
  'admin',
  'developer',
  'ceo',
])

const MANAGE_USERS_ROLES: ReadonlySet<CanonicalRole> = new Set(['owner', 'super_admin'])

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
  role === 'owner' ||
  role === 'super_admin' ||
  role === 'content_admin' ||
  role === 'sme_reviewer' ||
  role === 'admin' ||
  role === 'developer' ||
  role === 'ceo'

export const canManageContentForRole = (role: CanonicalRole): boolean =>
  MANAGE_CONTENT_ROLES.has(role)

export const canManageUsersForRole = (role: CanonicalRole): boolean =>
  MANAGE_USERS_ROLES.has(role)

const ADMIN_PERMISSIONS: Record<CanonicalRole, AdminPermission[]> = {
  owner: [
    'admin.access', 'admin.dashboard.view', 'admin.content.view',
    'admin.content.create', 'admin.content.edit', 'admin.content.delete',
    'admin.content.publish', 'admin.content.approve', 'admin.content.import',
    'admin.taxonomy.manage', 'admin.assets.manage', 'admin.pipeline.manage',
    'admin.reviews.view', 'admin.audit.view', 'admin.activity.view',
    'admin.search.use', 'admin.analytics.view', 'admin.settings.view',
    'admin.users.manage', 'admin.preview.view',
  ],
  super_admin: [
    'admin.access', 'admin.dashboard.view', 'admin.content.view',
    'admin.content.create', 'admin.content.edit', 'admin.content.delete',
    'admin.content.publish', 'admin.content.approve', 'admin.content.import',
    'admin.taxonomy.manage', 'admin.assets.manage', 'admin.pipeline.manage',
    'admin.reviews.view', 'admin.audit.view', 'admin.activity.view',
    'admin.search.use', 'admin.analytics.view', 'admin.settings.view',
    'admin.users.manage', 'admin.preview.view',
  ],
  ceo: [
    'admin.access', 'admin.dashboard.view', 'admin.content.view',
    'admin.content.create', 'admin.content.edit', 'admin.content.delete',
    'admin.content.publish', 'admin.content.approve', 'admin.content.import',
    'admin.taxonomy.manage', 'admin.assets.manage', 'admin.pipeline.manage',
    'admin.reviews.view', 'admin.activity.view',
    'admin.search.use', 'admin.analytics.view', 'admin.settings.view',
    'admin.users.manage', 'admin.preview.view',
  ],
  content_admin: [
    'admin.access', 'admin.dashboard.view', 'admin.content.view',
    'admin.content.create', 'admin.content.edit', 'admin.content.delete',
    'admin.content.publish', 'admin.content.approve', 'admin.content.import',
    'admin.taxonomy.manage', 'admin.assets.manage', 'admin.pipeline.manage',
    'admin.reviews.view', 'admin.activity.view',
    'admin.search.use', 'admin.analytics.view', 'admin.preview.view',
  ],
  admin: [
    'admin.access', 'admin.dashboard.view', 'admin.content.view',
    'admin.content.create', 'admin.content.edit', 'admin.content.delete',
    'admin.content.publish', 'admin.content.approve',
    'admin.taxonomy.manage', 'admin.assets.manage', 'admin.pipeline.manage',
    'admin.reviews.view', 'admin.activity.view',
    'admin.search.use', 'admin.analytics.view', 'admin.preview.view',
  ],
  developer: [
    'admin.access', 'admin.dashboard.view', 'admin.content.view',
    'admin.content.create', 'admin.content.edit',
    'admin.activity.view', 'admin.search.use', 'admin.preview.view',
  ],
  sme_reviewer: [
    'admin.access', 'admin.dashboard.view', 'admin.content.view',
    'admin.content.approve', 'admin.pipeline.manage',
    'admin.reviews.view', 'admin.activity.view',
    'admin.search.use', 'admin.preview.view',
  ],
  member: [],
  anonymous: [],
}

export function hasPermission(role: CanonicalRole, permission: AdminPermission): boolean {
  return ADMIN_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissionsForRole(role: CanonicalRole): AdminPermission[] {
  return ADMIN_PERMISSIONS[role] ?? []
}

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
