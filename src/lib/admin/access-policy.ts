import type { UserRole } from './roles'

const DEV_TOOLBAR_ROLES: ReadonlySet<UserRole> = new Set([
  'super_admin',
  'content_admin',
  'developer',
  'admin',
  'ceo',
])

const INTERNAL_TIER_BYPASS_ROLES: ReadonlySet<UserRole> = new Set([
  'super_admin',
  'content_admin',
  'developer',
  'admin',
  'ceo',
])

export const canSeeDevToolbar = (role: UserRole | null): boolean =>
  role !== null && DEV_TOOLBAR_ROLES.has(role)

export const canUseInternalTierBypass = (role: UserRole | null): boolean =>
  role !== null && INTERNAL_TIER_BYPASS_ROLES.has(role)
