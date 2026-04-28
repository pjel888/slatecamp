'use server'

import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

/**
 * Assert that the current user has developer portal access.
 * Throws an error if the user is not authenticated or lacks the developer role.
 */
export async function assertDeveloperAccess(): Promise<void> {
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.developerPortal,
  ])

  const allowed =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.developerPortal]?.allowed ?? false

  if (!allowed) {
    throw new Error('Not authorized to access developer tools')
  }
}
