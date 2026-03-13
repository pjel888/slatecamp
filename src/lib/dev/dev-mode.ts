import type { UserTier } from "@/types/app";

// ---------------------------------------------------------------------------
// Connection State — orthogonal to tier
// ---------------------------------------------------------------------------

export type DevConnectionState = "local" | "connected";

// ---------------------------------------------------------------------------
// Permission Capabilities — what each tier grants
// ---------------------------------------------------------------------------

export interface TierCapabilities {
  questionsPerDay: number;
  aiTokens: number;
  savedConfigs: number;
  srsAccess: boolean;
  threeDLabAccess: boolean;
  aiTutorAccess: boolean;
  aiAdaptiveAccess: boolean;
  customBanksAccess: boolean;
}

// ---------------------------------------------------------------------------
// Dev Mode Configuration — stored in the dev flags cookie
// ---------------------------------------------------------------------------

export interface DevModeConfig {
  /** Which tier to simulate (null = use real DB tier / admin default) */
  simulatedTier: UserTier | null;
  /** Individual feature gate overrides (bypass tier requirement) */
  bypass3dGate: boolean;
  bypassAiGate: boolean;
  bypassSrsGate: boolean;
}

export const DEFAULT_DEV_CONFIG: DevModeConfig = {
  simulatedTier: null,
  bypass3dGate: false,
  bypassAiGate: false,
  bypassSrsGate: false,
};

// ---------------------------------------------------------------------------
// Tier Permissions Matrix
// ---------------------------------------------------------------------------
// These are the base capabilities for each tier. Connection state does NOT
// change what a tier can do — it only changes where data comes from
// (mock vs. live Supabase).
// ---------------------------------------------------------------------------

export const TIER_CAPABILITIES: Record<UserTier, TierCapabilities> = {
  free: {
    questionsPerDay: 50,
    aiTokens: 0,
    savedConfigs: 0,
    srsAccess: false,
    threeDLabAccess: false,
    aiTutorAccess: false,
    aiAdaptiveAccess: false,
    customBanksAccess: false,
  },
  camp: {
    questionsPerDay: Infinity,
    aiTokens: 1000,
    savedConfigs: 10,
    srsAccess: true,
    threeDLabAccess: true,
    aiTutorAccess: false,
    aiAdaptiveAccess: false,
    customBanksAccess: true,
  },
  insurance: {
    questionsPerDay: Infinity,
    aiTokens: 10000,
    savedConfigs: 100,
    srsAccess: true,
    threeDLabAccess: true,
    aiTutorAccess: true,
    aiAdaptiveAccess: true,
    customBanksAccess: true,
  },
  institutional: {
    questionsPerDay: Infinity,
    aiTokens: Infinity,
    savedConfigs: Infinity,
    srsAccess: true,
    threeDLabAccess: true,
    aiTutorAccess: true,
    aiAdaptiveAccess: true,
    customBanksAccess: true,
  },
};

// ---------------------------------------------------------------------------
// Connection-Specific Behaviors
// ---------------------------------------------------------------------------
// Describes what differs between local and connected modes, independent of
// tier. These are *data-source* concerns, not permission concerns.
// ---------------------------------------------------------------------------

export interface ConnectionBehavior {
  label: string;
  description: string;
  dataSource: "mock" | "supabase";
  authProvider: "mock" | "supabase";
  paymentsAvailable: boolean;
  analyticsAvailable: boolean;
  aiServicesAvailable: boolean;
}

export const CONNECTION_BEHAVIORS: Record<DevConnectionState, ConnectionBehavior> = {
  local: {
    label: "Local",
    description: "Mock data, no external services",
    dataSource: "mock",
    authProvider: "mock",
    paymentsAvailable: false,
    analyticsAvailable: false,
    aiServicesAvailable: false,
  },
  connected: {
    label: "Connected",
    description: "Live Supabase, real data",
    dataSource: "supabase",
    authProvider: "supabase",
    paymentsAvailable: true,
    analyticsAvailable: true,
    aiServicesAvailable: true,
  },
};

// ---------------------------------------------------------------------------
// Tier Rank (for comparison)
// ---------------------------------------------------------------------------

const TIER_RANK: Record<UserTier, number> = { free: 0, camp: 1, insurance: 2, institutional: 3 };

// ---------------------------------------------------------------------------
// Resolution Functions
// ---------------------------------------------------------------------------

/**
 * Detect connection state from environment.
 */
export function getConnectionState(): DevConnectionState {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ? "connected" : "local";
}

/**
 * Resolve the effective tier given the dev mode config.
 *
 * Priority:
 * 1. If devConfig.simulatedTier is set → use it (regardless of connection state)
 * 2. If admin with no simulation → "institutional"
 * 3. If local mode with no simulation → "institutional" (full access for local dev)
 * 4. Otherwise → actual DB tier
 */
export function resolveEffectiveTier(
  dbTier: UserTier,
  isAdmin: boolean,
  connectionState: DevConnectionState,
  devConfig: DevModeConfig
): UserTier {
  // Explicit simulation always wins
  if (devConfig.simulatedTier) return devConfig.simulatedTier;

  // Admin defaults to institutional
  if (isAdmin) return "institutional";

  // Local mode defaults to institutional (so devs get full access unless they simulate)
  if (connectionState === "local") return "institutional";

  // Normal connected user — use DB tier
  return dbTier;
}

/**
 * Check if a feature requiring a minimum tier is accessible.
 * Accounts for individual gate bypasses.
 */
export function checkTierAccess(
  requiredTier: UserTier,
  effectiveTier: UserTier,
  devConfig: DevModeConfig,
  gate?: "bypass3dGate" | "bypassAiGate" | "bypassSrsGate"
): boolean {
  // Individual gate bypass overrides tier check
  if (gate && devConfig[gate]) return true;

  return TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier];
}

/**
 * Get the full resolved capabilities for a given effective tier + dev config.
 * Merges base tier capabilities with any gate overrides.
 */
export function resolveCapabilities(
  effectiveTier: UserTier,
  devConfig: DevModeConfig
): TierCapabilities {
  const base = { ...TIER_CAPABILITIES[effectiveTier] };

  // Apply gate overrides
  if (devConfig.bypass3dGate) base.threeDLabAccess = true;
  if (devConfig.bypassAiGate) {
    base.aiTutorAccess = true;
    base.aiAdaptiveAccess = true;
  }
  if (devConfig.bypassSrsGate) base.srsAccess = true;

  return base;
}

/**
 * Build a summary label for the current dev mode state.
 * e.g. "Local / Free", "Connected / Camp", "Connected / Institutional (admin)"
 */
export function getDevModeLabel(
  connectionState: DevConnectionState,
  effectiveTier: UserTier,
  isSimulated: boolean
): string {
  const conn = CONNECTION_BEHAVIORS[connectionState].label;
  const tier = effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1);
  const suffix = isSimulated ? " (simulated)" : "";
  return `${conn} / ${tier}${suffix}`;
}
