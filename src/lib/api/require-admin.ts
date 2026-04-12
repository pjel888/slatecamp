'use server'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/admin/roles'
import { resolveCurrentUserRole } from '@/lib/entitlements/resolve-role'
import { canReviewContentForRole } from '@/lib/entitlements/policy'

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
 */
export const requireAdmin = async (): Promise<AdminResult | AdminError> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const resolution = await resolveCurrentUserRole()
  const isAuthorized = canReviewContentForRole(resolution.normalizedRole)

  if (!isAuthorized || !resolution.compatibilityRole) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, role: resolution.compatibilityRole as UserRole }
}
