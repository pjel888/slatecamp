import { cache } from 'react'
import { createClient } from "@/lib/supabase/server"

export type UserRole =
  | 'super_admin'
  | 'content_admin'
  | 'sme_reviewer'
  | 'developer'
  | 'admin'
  | 'ceo';

const ACCESS_ROLES: ReadonlySet<UserRole> = new Set([
  'super_admin',
  'content_admin',
  'sme_reviewer',
  'developer',
  'admin',
  'ceo',
]);

const ROLE_PRIORITY: Record<UserRole, number> = {
  super_admin: 5,
  content_admin: 4,
  developer: 3,
  admin: 3,
  ceo: 3,
  sme_reviewer: 2,
}

const normalizeRole = (value: unknown): UserRole | null =>
  typeof value === 'string' && ACCESS_ROLES.has(value as UserRole)
    ? (value as UserRole)
    : null

const pickStrongestRole = (roles: Array<UserRole | null>): UserRole | null =>
  roles.reduce<UserRole | null>((strongest, role) => {
    if (!role) return strongest
    if (!strongest) return role
    return ROLE_PRIORITY[role] > ROLE_PRIORITY[strongest] ? role : strongest
  }, null)

/**
 * Resolve the user's strongest recognized role from auth metadata, profile data,
 * legacy role rows, and the email fallback.
 * Wrapped with React cache() to deduplicate calls within a single RSC render pass.
 */
export const getUserRole = cache(async (): Promise<UserRole | null> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null;

  // Dev Mode Bypass: If impersonating via DEV_FORCE_USER_ID, grant super_admin locally 
  // so DevToolbar admin features work unconditionally for the solo founder.
  if (process.env.NODE_ENV === 'development' && !!process.env.DEV_FORCE_USER_ID) {
    return 'super_admin'
  }

  const metadataRole =
    normalizeRole(user.app_metadata?.role) ??
    normalizeRole(user.user_metadata?.role);

  const [profileResult, roleResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const profileRole = normalizeRole(profileResult.data?.role);
  const dbRole = normalizeRole(roleResult.data?.role);
  const resolvedRole = pickStrongestRole([metadataRole, profileRole, dbRole]);
  if (resolvedRole) return resolvedRole;

  // Fallback to legacy email-based admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  if (user.email && adminEmails.includes(user.email)) {
    return 'super_admin'
  }

  return null
})

/**
 * Check if user is an admin (super_admin or content_admin)
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'super_admin' || role === 'content_admin'
}

/**
 * Check if user is a super_admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'super_admin'
}

/**
 * Check if user can manage content (create/edit/delete questions, wiki, assets)
 */
export async function canManageContent(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'super_admin' || role === 'content_admin'
}

/**
 * Check if user can review content (SME reviewer)
 */
export async function canReviewContent(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'super_admin' || role === 'content_admin' || role === 'sme_reviewer'
}

/**
 * Check if user can manage users (only super_admin)
 */
export async function canManageUsers(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'super_admin'
}

/**
 * Get all roles for a user.
 * Wrapped with React cache() to deduplicate calls within a single RSC render pass.
 */
export const getUserRoles = cache(async function getUserRoles(): Promise<UserRole[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return [];

  // Dev Mode Bypass
  if (process.env.NODE_ENV === 'development' && !!process.env.DEV_FORCE_USER_ID) {
    return ['super_admin']
  }

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  return (roles?.map(r => r.role as UserRole)) || []
})
