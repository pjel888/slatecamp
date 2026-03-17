'use client'

import { useDevStore } from '@/stores/dev-store'

/**
 * Returns the effective user role, accounting for dev impersonation.
 *
 * @param serverRole - The real role from the server component
 * @returns The effective role string
 */
export function useUserRole(serverRole: string): string {
  const isImpersonating = useDevStore((s) => s.isImpersonating)
  const impersonatedRole = useDevStore((s) => s.impersonatedRole)

  // In production, always return the real role
  if (process.env.NODE_ENV === 'production') {
    return serverRole
  }

  // In dev mode with active impersonation, return the impersonated role
  if (isImpersonating && impersonatedRole) {
    return impersonatedRole
  }

  return serverRole
}
