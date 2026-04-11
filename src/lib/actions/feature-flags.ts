'use server'

import { isDemoMode } from '@/lib/demo/config'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'
import { readDevOverrideCookie } from '@/lib/entitlements/dev-overrides'

/**
 * Get feature flags for the current user.
 * This is a Server Action so it can read the httpOnly cookie securely.
 * Returns null for non-admin users or if no flags are set.
 */
export async function getFeatureFlags(): Promise<Record<string, boolean> | null> {
  // In demo mode, return demo flags if set
  if (isDemoMode()) {
    const flags = await readDevOverrideCookie();
    return flags as Record<string, boolean>;
  }

  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.devOverrideWrite,
  ])
  const canRead =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.devOverrideWrite]?.allowed ?? false
  if (!canRead) {
    return null;
  }

  const flags = await readDevOverrideCookie();
  return flags as Record<string, boolean>;
}

/**
 * Check if a specific feature flag is enabled.
 * Returns false for non-admin users or if flag is not set.
 */
export async function isFeatureEnabled(flagName: string): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags?.[flagName] ?? false;
}
