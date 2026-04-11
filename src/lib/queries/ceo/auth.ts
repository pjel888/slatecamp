import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { resolveCurrentUserRole } from '@/lib/entitlements/resolve-role'
import { canAccessCeoPortalForRole } from '@/lib/entitlements/policy'

/**
 * Verify CEO access in Server Components. Redirects on failure.
 * Returns the authenticated user and profile.
 */
export const verifyCeoAccess = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const roleResolution = await resolveCurrentUserRole()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (!canAccessCeoPortalForRole(roleResolution.normalizedRole)) {
    redirect('/dashboard')
  }

  return {
    user,
    profile: { role: roleResolution.normalizedRole, display_name: profile?.display_name ?? null },
    supabase,
  }
}

/**
 * Assert CEO role in Server Actions. Throws on failure (does not redirect).
 * Returns the authenticated supabase client for subsequent queries.
 */
export const assertCeoRole = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized: not authenticated')
  const roleResolution = await resolveCurrentUserRole()

  if (!canAccessCeoPortalForRole(roleResolution.normalizedRole)) {
    throw new Error('Forbidden: CEO access required')
  }

  return { user, supabase }
}
