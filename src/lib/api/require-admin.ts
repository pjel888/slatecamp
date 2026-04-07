'use server'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/admin/roles'

interface AdminResult {
  user: { id: string; email?: string }
  role: UserRole
}

interface AdminError {
  error: NextResponse
}

/**
 * Reusable authorization guard for API route handlers.
 * Returns the authenticated admin user + role, or an error NextResponse.
 *
 * Usage in a route handler:
 *   const auth = await requireAdmin()
 *   if ('error' in auth) return auth.error
 *   // auth.user and auth.role are available
 */
export const requireAdmin = async (): Promise<AdminResult | AdminError> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['super_admin', 'content_admin', 'sme_reviewer'])
    .limit(1)
    .maybeSingle()

  if (!roleRow) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, role: roleRow.role as UserRole }
}
