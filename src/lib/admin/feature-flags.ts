import type { UserTier } from "@/types/app";
import {
  type DevModeConfig,
  type DevConnectionState,
  getConnectionState,
  resolveEffectiveTier,
  checkTierAccess,
} from "@/lib/dev/dev-mode";
import {
  readDevOverrideCookie,
  type DevOverrideCookiePayload,
} from "@/lib/entitlements/dev-overrides";

// ---------------------------------------------------------------------------
// Feature Flags — stored in a session cookie
// ---------------------------------------------------------------------------
// The shape mirrors DevModeConfig with a legacy spoofedTier alias for
// backward compatibility with existing cookies.
// ---------------------------------------------------------------------------

export interface FeatureFlags extends DevModeConfig {
  /** @deprecated Use simulatedTier instead. Kept for cookie migration. */
  spoofedTier?: UserTier | null;
}

/**
 * Read dev flags from cookie, with fallback defaults.
 * In local mode, all gates are bypassed by default.
 *
 * @deprecated Prefer `resolveDevOverrides()` from `@/lib/entitlements/dev-overrides`.
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const connectionState = getConnectionState();
  const isLocal = connectionState === "local";

  const baseFlags: FeatureFlags = isLocal
    ? { simulatedTier: null, bypass3dGate: true, bypassAiGate: true, bypassSrsGate: true }
    : { simulatedTier: null, bypass3dGate: false, bypassAiGate: false, bypassSrsGate: false };

  const parsed = (await readDevOverrideCookie()) as DevOverrideCookiePayload;

  return {
    ...baseFlags,
    simulatedTier: parsed.simulatedTier ?? parsed.spoofedTier ?? null,
    spoofedTier: parsed.spoofedTier ?? null,
    bypass3dGate: parsed.bypass3dGate ?? baseFlags.bypass3dGate,
    bypassAiGate: parsed.bypassAiGate ?? baseFlags.bypassAiGate,
    bypassSrsGate: parsed.bypassSrsGate ?? baseFlags.bypassSrsGate,
  };
}

/**
 * Extract the DevModeConfig subset from FeatureFlags.
 */
export function toDevConfig(flags: FeatureFlags): DevModeConfig {
  return {
    simulatedTier: flags.simulatedTier ?? flags.spoofedTier ?? null,
    bypass3dGate: flags.bypass3dGate,
    bypassAiGate: flags.bypassAiGate,
    bypassSrsGate: flags.bypassSrsGate,
  };
}

// ---------------------------------------------------------------------------
// Tier resolution — delegates to dev-mode module
// ---------------------------------------------------------------------------

/**
 * Returns the effective tier for the user.
 * Priority: simulatedTier > admin default (institutional) > local default (institutional) > DB tier
 *
 * @deprecated Prefer `getViewerEntitlements()` from `@/lib/entitlements/get-viewer-entitlements`.
 */
export function getEffectiveTier(
  actualTier: UserTier,
  isAdmin: boolean,
  flags: FeatureFlags
): UserTier {
  const connectionState = getConnectionState();
  const devConfig = toDevConfig(flags);
  return resolveEffectiveTier(actualTier, isAdmin, connectionState, devConfig);
}

/**
 * Check if a feature requiring a minimum tier is accessible.
 * Accounts for individual gate bypasses.
 *
 * @deprecated Prefer `evaluateFeatureAccess()` from `@/lib/entitlements/resolve-entitlements`.
 */
export function hasTierAccess(
  requiredTier: UserTier,
  actualTier: UserTier,
  isAdmin: boolean,
  flags: FeatureFlags
): boolean {
  const effectiveTier = getEffectiveTier(actualTier, isAdmin, flags);
  const devConfig = toDevConfig(flags);
  return checkTierAccess(requiredTier, effectiveTier, devConfig);
}

// Re-export for convenience
export { getConnectionState, type DevConnectionState };
