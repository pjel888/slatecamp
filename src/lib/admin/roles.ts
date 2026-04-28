import { redirect } from 'next/navigation'
import {
  resolveCurrentUserRole,
  type RoleResolution,
} from '@/lib/entitlements/resolve-role'
import { ROUTES } from '@/lib/routes'
import {
  canAccessAdminCmsForRole,
  canManageContentForRole,
  canManageUsersForRole,
  canReviewContentForRole,
  hasPermission,
} from '@/lib/entitlements/policy'
import type { AdminPermission } from '@/lib/entitlements/types'

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
export async function getUserRole(): Promise<UserRole | null> {
  const resolution = await getResolution()
  return resolution.compatibilityRole
}

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
export async function getUserRoles(): Promise<UserRole[]> {
  const role = await getUserRole()
  return role ? [role] : []
}

/**
 * Assert that the current user has a specific admin permission.
 * Throws a 403-style error if the permission is missing.
 */
export async function assertPermission(permission: AdminPermission): Promise<void> {
  const resolution = await getResolution()
  if (!hasPermission(resolution.normalizedRole, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`)
  }
}

/**
 * Route-page variant of assertPermission.
 *
 * Server actions should keep using assertPermission so callers receive a
 * structured failure. Admin pages should redirect instead of rendering a Next
 * error page when a staff role reaches a URL outside its permission scope.
 */
export async function requirePermissionOrRedirect(
  permission: AdminPermission,
  redirectTo = ROUTES.dashboard.root,
): Promise<void> {
  const resolution = await getResolution()
  if (!hasPermission(resolution.normalizedRole, permission)) {
    redirect(redirectTo)
  }
}
