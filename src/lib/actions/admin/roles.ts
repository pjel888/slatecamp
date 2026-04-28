'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { assertPermission } from '@/lib/admin/roles'
import { logServerError } from '@/lib/logging/server'

const INTERNAL_ADMIN_ROLES = [
  'owner',
  'super_admin',
  'content_admin',
  'admin',
  'developer',
  'ceo',
  'sme_reviewer',
] as const

const isUserRolesPermissionError = (message: string) =>
  /permission denied for table user_roles/i.test(message)

export type AdminRoleStorageMode = 'user_roles' | 'profiles_fallback'

export interface AdminRoleRow {
  id: string
  user_id: string
  role: string
  created_at: string
}

/**
 * List all users with admin roles, ordered by most recently added.
 */
export const getAdminUsers = async () => {
  await assertPermission('admin.users.manage')

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_roles')
    .select('id, user_id, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    if (isUserRolesPermissionError(error.message)) {
      const { data: profileRoles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role, created_at')
        .in('role', [...INTERNAL_ADMIN_ROLES])
        .order('created_at', { ascending: false })

      if (profilesError) {
        throw new Error(`Failed to load admin roles: ${profilesError.message}`)
      }

      return {
        rows: (profileRoles || []).map((row) => ({
          id: row.id,
          user_id: row.id,
          role: row.role,
          created_at: row.created_at,
        })),
        storageMode: 'profiles_fallback' as const,
      }
    }

    throw new Error(`Failed to load admin roles: ${error.message}`)
  }

  return {
    rows: (data || []) as AdminRoleRow[],
    storageMode: 'user_roles' as const,
  }
}

/**
 * Assign an admin role to a user.
 * Requires super_admin permission.
 */
export const assignRole = async (formData: FormData) => {
  await assertPermission('admin.users.manage')

  const userId = formData.get('userId') as string
  const role = formData.get('role') as string

  if (!userId || !role) {
    await logServerError({
      family: 'admin',
      eventName: 'assign_role_validation_failed',
      message: 'Assign role failed validation for missing fields.',
      context: {
        routeOrAction: 'admin:roles.assign',
      },
      error: new Error('Missing required fields: userId and role'),
      persist: false,
    })
    throw new Error('Missing required fields: userId and role')
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    await logServerError({
      family: 'admin',
      eventName: 'assign_role_validation_failed',
      message: 'Assign role failed validation for invalid user ID.',
      context: {
        routeOrAction: 'admin:roles.assign',
      },
      error: new Error('Invalid user ID format'),
      persist: false,
    })
    throw new Error('Invalid user ID format')
  }

  const supabase = createAdminClient()
  let storageMode: AdminRoleStorageMode = 'user_roles'
  let { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })

  if (error && isUserRolesPermissionError(error.message)) {
    storageMode = 'profiles_fallback'
    const profileResult = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    error = profileResult.error
  }

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'assign_role_failed',
      message: 'Failed to assign admin role.',
      context: {
        routeOrAction: 'admin:roles.assign',
        metadata: {
          role,
          userId,
        },
      },
      error,
    })
    throw new Error(`Failed to assign role: ${error.message}`)
  }

  return {
    error: null,
    storageMode,
  }
}

/**
 * Revoke an admin role by its row ID.
 * Requires super_admin permission.
 */
export const revokeRole = async (formData: FormData) => {
  await assertPermission('admin.users.manage')

  const roleId = formData.get('roleId') as string

  if (!roleId) {
    await logServerError({
      family: 'admin',
      eventName: 'revoke_role_validation_failed',
      message: 'Revoke role failed validation for missing roleId.',
      context: {
        routeOrAction: 'admin:roles.revoke',
      },
      error: new Error('Missing required field: roleId'),
      persist: false,
    })
    throw new Error('Missing required field: roleId')
  }

  const supabase = createAdminClient()
  let storageMode: AdminRoleStorageMode = 'user_roles'
  let { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', roleId)

  if (error && isUserRolesPermissionError(error.message)) {
    storageMode = 'profiles_fallback'
    const profileResult = await supabase
      .from('profiles')
      .update({ role: 'member' })
      .eq('id', roleId)

    error = profileResult.error
  }

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'revoke_role_failed',
      message: 'Failed to revoke admin role.',
      context: {
        routeOrAction: 'admin:roles.revoke',
        metadata: {
          roleId,
        },
      },
      error,
    })
    throw new Error(`Failed to revoke role: ${error.message}`)
  }

  return {
    error: null,
    storageMode,
  }
}
