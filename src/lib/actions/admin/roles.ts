'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canManageUsers } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import { logServerError } from '@/lib/logging/server'

/**
 * List all users with admin roles, ordered by most recently added.
 */
export const getAdminUsers = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_roles')
    .select('id, user_id, role, created_at')
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Assign an admin role to a user.
 * Requires super_admin permission.
 */
export const assignRole = async (formData: FormData) => {
  const allowed = await canManageUsers()
  if (!allowed) {
    await logServerError({
      family: 'admin',
      eventName: 'assign_role_unauthorized',
      message: 'Unauthorized attempt to assign an admin role.',
      context: {
        routeOrAction: 'admin:roles.assign',
      },
    })
    throw new Error('Unauthorized: only super_admin can assign roles')
  }

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
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })

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

  revalidatePath(ROUTES.admin.settings)
}

/**
 * Revoke an admin role by its row ID.
 * Requires super_admin permission.
 */
export const revokeRole = async (formData: FormData) => {
  const allowed = await canManageUsers()
  if (!allowed) {
    await logServerError({
      family: 'admin',
      eventName: 'revoke_role_unauthorized',
      message: 'Unauthorized attempt to revoke an admin role.',
      context: {
        routeOrAction: 'admin:roles.revoke',
      },
    })
    throw new Error('Unauthorized: only super_admin can revoke roles')
  }

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
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', roleId)

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

  revalidatePath(ROUTES.admin.settings)
}
