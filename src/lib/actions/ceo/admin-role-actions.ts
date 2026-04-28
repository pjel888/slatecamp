'use server'

import { revalidatePath } from 'next/cache'
import { assertCeoRole } from '@/lib/queries/ceo/auth'
import { logServerError } from '@/lib/logging/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAdminAction } from '@/lib/admin/audit'

const ADMIN_ASSIGNABLE_ROLES = [
  'owner',
  'super_admin',
  'content_admin',
  'admin',
  'developer',
  'sme_reviewer',
  'ceo',
] as const

type AdminAssignableRole = typeof ADMIN_ASSIGNABLE_ROLES[number]

const isValidAdminRole = (role: string): role is AdminAssignableRole =>
  ADMIN_ASSIGNABLE_ROLES.includes(role as AdminAssignableRole)

type AdminUserRow = {
  id: string
  user_id: string
  role: string
  created_at: string
  profiles?: { full_name: string | null; email: string | null } | null
}

const normalizeProfileJoin = (
  profiles: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null,
) => Array.isArray(profiles) ? profiles[0] ?? null : profiles

/**
 * List all users with admin roles from the canonical user_roles table.
 */
export const getAdminUsers = async (): Promise<{ rows: AdminUserRow[] }> => {
  await assertCeoRole()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('user_roles')
    .select('id, user_id, role, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'ceo_get_admin_users_failed',
      message: 'Failed to load admin users from user_roles.',
      context: { routeOrAction: 'ceo:adminRoleActions.getAdminUsers' },
      error,
    })
    throw new Error(`Failed to load admin users: ${error.message}`)
  }

  return {
    rows: (data ?? []).map((row) => ({
      ...row,
      profiles: normalizeProfileJoin(row.profiles),
    })),
  }
}

/**
 * Assign an admin role to a user via the canonical user_roles table.
 */
export const assignAdminRole = async (
  userId: string,
  role: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { user } = await assertCeoRole()
    const admin = createAdminClient()

    if (!userId || !role) {
      return { success: false, error: 'Missing userId or role' }
    }

    if (!isValidAdminRole(role)) {
      return { success: false, error: `Invalid admin role: ${role}` }
    }

    // Insert into canonical user_roles
    const { error } = await admin
      .from('user_roles')
      .insert({ user_id: userId, role })

    if (error) {
      // Idempotent: if duplicate, treat as success
      if (error.message?.includes('duplicate') || error.code === '23505') {
        return { success: true }
      }

      await logServerError({
        family: 'admin',
        eventName: 'ceo_assign_role_failed',
        message: 'Failed to assign admin role via user_roles.',
        context: {
          routeOrAction: 'ceo:adminRoleActions.assignAdminRole',
          metadata: { userId, role },
        },
        error,
      })
      return { success: false, error: error.message }
    }

    await logAdminAction({
      actorId: user.id,
      action: 'role.assign',
      targetUserId: userId,
      metadata: { role },
    })

    revalidatePath('/ceo/team/admin-roles')
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}

/**
 * Revoke an admin role from a user via the canonical user_roles table.
 */
export const revokeAdminRole = async (
  userId: string,
  role: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { user } = await assertCeoRole()
    const admin = createAdminClient()

    if (!userId || !role) {
      return { success: false, error: 'Missing userId or role' }
    }

    if (!isValidAdminRole(role)) {
      return { success: false, error: `Invalid admin role: ${role}` }
    }

    // Safeguard: prevent self-demotion
    if (user.id === userId) {
      return { success: false, error: 'Cannot revoke your own role' }
    }

    // Safeguard: prevent removing the final owner/super_admin
    if (role === 'owner' || role === 'super_admin') {
      const { count, error: countError } = await admin
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['owner', 'super_admin'])

      if (countError) {
        return { success: false, error: 'Failed to verify admin count safeguard' }
      }

      if (count && count <= 1) {
        return { success: false, error: 'Cannot revoke the final owner/super-admin role' }
      }
    }

    // Delete from canonical user_roles
    const { error } = await admin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role)

    if (error) {
      await logServerError({
        family: 'admin',
        eventName: 'ceo_revoke_role_failed',
        message: 'Failed to revoke admin role from user_roles.',
        context: {
          routeOrAction: 'ceo:adminRoleActions.revokeAdminRole',
          metadata: { userId, role },
        },
        error,
      })
      return { success: false, error: error.message }
    }

    await logAdminAction({
      actorId: user.id,
      action: 'role.revoke',
      targetUserId: userId,
      metadata: { role },
    })

    revalidatePath('/ceo/team/admin-roles')
    revalidatePath('/admin/settings')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}

/**
 * Fetch permission audit log entries (role assignments/revocations).
 */
export const getPermissionAuditLog = async (limit = 50, offset = 0) => {
  await assertCeoRole()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('audit_logs')
    .select('id, actor_id, event_type, table_name, record_id, metadata, created_at')
    .eq('table_name', 'user_roles')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'ceo_get_permission_audit_failed',
      message: 'Failed to load permission audit log.',
      context: { routeOrAction: 'ceo:adminRoleActions.getPermissionAuditLog' },
      error,
    })
    throw new Error(`Failed to load audit log: ${error.message}`)
  }

  return data ?? []
}
