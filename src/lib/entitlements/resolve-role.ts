import { cache } from 'react'
import { createClient, getUser } from '@/lib/supabase/server'
import type { CanonicalRole, RoleResolution, RoleSource } from './types'
export type { RoleResolution } from './types'

type CompatibilityRole = Exclude<CanonicalRole, 'anonymous' | 'member'>

const RECOGNIZED_INTERNAL_ROLES: ReadonlySet<CompatibilityRole> = new Set([
  'super_admin',
  'content_admin',
  'sme_reviewer',
  'developer',
  'admin',
  'ceo',
])

const ROLE_PRIORITY: Record<CompatibilityRole, number> = {
  super_admin: 6,
  content_admin: 5,
  developer: 4,
  admin: 4,
  ceo: 4,
  sme_reviewer: 3,
}

const normalizeCompatibilityRole = (value: unknown): CompatibilityRole | null =>
  typeof value === 'string' && RECOGNIZED_INTERNAL_ROLES.has(value as CompatibilityRole)
    ? (value as CompatibilityRole)
    : null

const pickStrongestRole = (
  roles: CompatibilityRole[],
): CompatibilityRole | null =>
  roles.reduce<CompatibilityRole | null>((strongest, role) => {
    if (!strongest) {
      return role
    }

    return ROLE_PRIORITY[role] > ROLE_PRIORITY[strongest] ? role : strongest
  }, null)

interface RoleInputs {
  email?: string | null
  appMetadataRole?: unknown
  userMetadataRole?: unknown
  profileRole?: unknown
  userRoleRows?: Array<{ role: unknown }> | null
  forcedUserIdActive?: boolean
}

export const resolveRoleFromInputs = (inputs: RoleInputs): RoleResolution => {
  const roleSources: RoleSource[] = []
  const precedenceTrace: string[] = []

  if (inputs.forcedUserIdActive) {
    return {
      normalizedRole: 'super_admin',
      compatibilityRole: 'super_admin',
      resolvedFrom: 'dev_force_user',
      roleSources: ['dev_force_user'],
      precedenceTrace: ['dev_force_user=>super_admin'],
    }
  }

  const appMetadataRole = normalizeCompatibilityRole(inputs.appMetadataRole)
  if (appMetadataRole) {
    roleSources.push('app_metadata')
    precedenceTrace.push(`app_metadata:${appMetadataRole}`)
  }

  const userMetadataRole = normalizeCompatibilityRole(inputs.userMetadataRole)
  if (userMetadataRole) {
    roleSources.push('user_metadata')
    precedenceTrace.push(`user_metadata:${userMetadataRole}`)
  }

  const profileRole = normalizeCompatibilityRole(inputs.profileRole)
  if (profileRole) {
    roleSources.push('profile')
    precedenceTrace.push(`profile:${profileRole}`)
  }

  const rowRoles = (inputs.userRoleRows ?? [])
    .map((row) => normalizeCompatibilityRole(row.role))
    .filter((role): role is CompatibilityRole => role !== null)

  if (rowRoles.length > 0) {
    roleSources.push('user_roles')
    precedenceTrace.push(`user_roles:${rowRoles.join(',')}`)
  }

  const resolvedRole = pickStrongestRole([
    ...[appMetadataRole, userMetadataRole, profileRole].filter(
      (role): role is CompatibilityRole => role !== null,
    ),
    ...rowRoles,
  ])

  if (resolvedRole) {
    return {
      normalizedRole: resolvedRole,
      compatibilityRole: resolvedRole,
      resolvedFrom: roleSources[0] ?? 'none',
      roleSources,
      precedenceTrace,
    }
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (inputs.email && adminEmails.includes(inputs.email)) {
    return {
      normalizedRole: 'super_admin',
      compatibilityRole: 'super_admin',
      resolvedFrom: 'admin_email',
      roleSources: ['admin_email'],
      precedenceTrace: ['admin_email=>super_admin'],
    }
  }

  return {
    normalizedRole: inputs.email ? 'member' : 'anonymous',
    compatibilityRole: null,
    resolvedFrom: 'none',
    roleSources: ['none'],
    precedenceTrace: [inputs.email ? 'fallback=>member' : 'fallback=>anonymous'],
  }
}

export const resolveCurrentUserRole = cache(async (): Promise<RoleResolution> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return resolveRoleFromInputs({})
  }

  const [profileResult, roleRowsResult] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return resolveRoleFromInputs({
    email: user.email,
    appMetadataRole: user.app_metadata?.role,
    userMetadataRole: user.user_metadata?.role,
    profileRole: profileResult.data?.role,
    userRoleRows: roleRowsResult.data ?? [],
    forcedUserIdActive:
      process.env.NODE_ENV === 'development' && Boolean(process.env.DEV_FORCE_USER_ID),
  })
})
