import { cache } from 'react'
import {
  resolveCurrentUserRole,
  type RoleResolution,
} from '@/lib/entitlements/resolve-role'
import {
  canAccessAdminCmsForRole,
  canManageContentForRole,
  canManageUsersForRole,
  canReviewContentForRole,
} from '@/lib/entitlements/policy'

export type UserRole =
  | 'super_admin'
  | 'content_admin'
  | 'sme_reviewer'
  | 'developer'
  | 'admin'
  | 'ceo'
  | 'owner'

const getResolution = async (): Promise<RoleResolution> => resolveCurrentUserRole()

/**
 * Resolve the user's strongest recognized role from auth metadata, profile data,
 * legacy role rows, and the email fallback.
 * Wrapped with React cache() to deduplicate calls within a single RSC render pass.
 *
 * @deprecated Prefer `resolveCurrentUserRole()` from `@/lib/entitlements/resolve-role`.
 */
export const getUserRole = cache(async (): Promise<UserRole | null> => {
  const resolution = await getResolution()
  return resolution.compatibilityRole
})

/**
 * Check if user is an admin (super_admin or content_admin)
 *
 * @deprecated Prefer `canAccessAdminCmsForRole()` with canonical role resolution.
 */
export async function isAdmin(): Promise<boolean> {
  const resolution = await getResolution()
  return canAccessAdminCmsForRole(resolution.normalizedRole)
}

/**
 * Check if user is a super_admin or owner
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'super_admin' || role === 'owner'
}

/**
 * Check if user can manage content (create/edit/delete questions, wiki, assets)
 */
export async function canManageContent(): Promise<boolean> {
  const resolution = await getResolution()
  return canManageContentForRole(resolution.normalizedRole)
}

/**
 * Check if user can review content (SME reviewer)
 */
export async function canReviewContent(): Promise<boolean> {
  const resolution = await getResolution()
  return canReviewContentForRole(resolution.normalizedRole)
}

/**
 * Check if user can manage users (only super_admin)
 */
export async function canManageUsers(): Promise<boolean> {
  const resolution = await getResolution()
  return canManageUsersForRole(resolution.normalizedRole)
}

/**
 * Get all roles for a user.
 * Wrapped with React cache() to deduplicate calls within a single RSC render pass.
 */
export const getUserRoles = cache(async function getUserRoles(): Promise<UserRole[]> {
  const role = await getUserRole()
  return role ? [role] : []
})
