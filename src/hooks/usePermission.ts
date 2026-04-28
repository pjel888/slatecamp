'use client'

import { useMemo } from 'react'
import { useEntitlements } from '@/lib/context/entitlement-context'
import type { AdminPermission } from '@/lib/entitlements/types'

export function usePermission() {
  const { entitlements } = useEntitlements()
  const permissions = useMemo(
    () => new Set(entitlements.permissions ?? []),
    [entitlements.permissions],
  )

  const can = (permission: AdminPermission): boolean => permissions.has(permission)

  return { can }
}
