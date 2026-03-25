import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Verify CEO access in Server Components. Redirects on failure.
 * Returns the authenticated user and profile.
 */
export const verifyCeoAccess = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['ceo', 'super_admin'].includes(profile.role ?? '')) {
    redirect('/dashboard')
  }

  return {
    user,
    profile: profile as { role: string; display_name: string | null },
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['ceo', 'super_admin'].includes(profile.role ?? '')) {
    throw new Error('Forbidden: CEO access required')
  }

  return { user, supabase }
}
