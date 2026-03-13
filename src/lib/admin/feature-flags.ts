import type { UserTier } from "@/types/app";
import { cookies } from "next/headers";
import {
  type DevModeConfig,
  type DevConnectionState,
  DEFAULT_DEV_CONFIG,
  getConnectionState,
  resolveEffectiveTier,
  checkTierAccess,
} from "@/lib/dev/dev-mode";

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

const COOKIE_NAME = "cerebro_dev_flags";

/**
 * Read dev flags from cookie, with fallback defaults.
 * In local mode, all gates are bypassed by default.
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const connectionState = getConnectionState();
  const isLocal = connectionState === "local";

  const baseFlags: FeatureFlags = isLocal
    ? { ...DEFAULT_DEV_CONFIG, bypass3dGate: true, bypassAiGate: true, bypassSrsGate: true }
    : { ...DEFAULT_DEV_CONFIG };

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (!raw) return baseFlags;

    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;

    // Migrate legacy spoofedTier → simulatedTier
    if (parsed.spoofedTier && !parsed.simulatedTier) {
      parsed.simulatedTier = parsed.spoofedTier;
    }

    return { ...baseFlags, ...parsed };
  } catch {
    return baseFlags;
  }
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
