'use server'

import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

/**
 * Centralized server-side guard for all CEO portal data access.
 * Throws if the caller is not authorized for the CEO portal.
 */
export async function assertCeoAccess(): Promise<void> {
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.ceoPortal,
  ])
  const allowed =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.ceoPortal]?.allowed ?? false
  if (!allowed) {
    throw new Error('Not authorized: CEO portal access required')
  }
}
