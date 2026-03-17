'use client'

import { useDevStore } from '@/stores/dev-store'
import {
  FEATURE_FLAGS,
  getConfigDefault,
  type FeatureFlagKey,
} from '@/config/feature-flags'

// ---------------------------------------------------------------------------
// Client-side: 3-layer resolution
// Priority: dev override > DB value > config default
// ---------------------------------------------------------------------------

/**
 * Resolve a feature flag value on the client.
 *
 * @param key - The feature flag key
 * @param dbValue - Optional DB value passed as prop from a server component
 * @returns The resolved boolean value and metadata about which layer won
 */
export function useFeatureFlag(
  key: FeatureFlagKey,
  dbValue?: boolean,
): { enabled: boolean; source: 'override' | 'db' | 'config' } {
  const overrides = useDevStore((s) => s.featureOverrides)

  // Layer 1: Dev override (highest priority)
  if (key in overrides) {
    return { enabled: overrides[key]!, source: 'override' }
  }

  // Layer 2: DB value (passed from server component)
  if (dbValue !== undefined) {
    return { enabled: dbValue, source: 'db' }
  }

  // Layer 3: Config default (lowest priority)
  return { enabled: getConfigDefault(key), source: 'config' }
}

/**
 * Resolve all feature flags at once (useful for the flag board UI).
 */
export function useAllFeatureFlags(
  dbValues?: Partial<Record<FeatureFlagKey, boolean>>,
): Record<FeatureFlagKey, { enabled: boolean; source: 'override' | 'db' | 'config' }> {
  const overrides = useDevStore((s) => s.featureOverrides)
  const keys = Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]

  const result = {} as Record<FeatureFlagKey, { enabled: boolean; source: 'override' | 'db' | 'config' }>

  for (const key of keys) {
    if (key in overrides) {
      result[key] = { enabled: overrides[key]!, source: 'override' }
    } else if (dbValues && key in dbValues) {
      result[key] = { enabled: dbValues[key]!, source: 'db' }
    } else {
      result[key] = { enabled: getConfigDefault(key), source: 'config' }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Server-side: 2-layer resolution (no dev overrides on server)
// Priority: DB value > config default
// ---------------------------------------------------------------------------

/**
 * Resolve a feature flag on the server.
 * Call this in server components / actions and pass the result as a prop.
 */
export function getFeatureFlagServer(
  key: FeatureFlagKey,
  dbFlags?: Record<string, boolean>,
): boolean {
  // DB value if available
  if (dbFlags && key in dbFlags) {
    return dbFlags[key]
  }

  // Config default
  return getConfigDefault(key)
}
