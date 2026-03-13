"use client";

import { createContext, useContext } from "react";
import type { UserTier } from "@/types/app";
import type { TierCapabilities } from "@/lib/dev/dev-mode";
import { TIER_CAPABILITIES } from "@/lib/dev/dev-mode";

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

interface TierContextValue {
  /** The user's real DB tier. */
  tier: UserTier;
  /** The effective tier after admin/dev overrides. */
  effectiveTier: UserTier;
  /** Whether dev mode (admin or local) is active. */
  isDevMode: boolean;
  /** Resolved capabilities for the effective tier. */
  capabilities: TierCapabilities;
  /** Quick check: does the effective tier meet or exceed the required tier? */
  hasAccess: (requiredTier: UserTier) => boolean;
}

const TIER_RANK: Record<UserTier, number> = { 
  free: 0, 
  camp: 1, 
  insurance: 2, 
  institutional: 3 
};

const TierContext = createContext<TierContextValue>({
  tier: "free",
  effectiveTier: "free",
  isDevMode: false,
  capabilities: TIER_CAPABILITIES.free,
  hasAccess: () => false,
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTier() {
  return useContext(TierContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface TierProviderProps {
  children: React.ReactNode;
  tier: UserTier;
  effectiveTier: UserTier;
  isDevMode: boolean;
}

export function TierProvider({
  children,
  tier,
  effectiveTier,
  isDevMode,
}: TierProviderProps) {
  const capabilities = TIER_CAPABILITIES[effectiveTier];
  const hasAccess = (requiredTier: UserTier) =>
    TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier];

  return (
    <TierContext.Provider
      value={{ tier, effectiveTier, isDevMode, capabilities, hasAccess }}
    >
      {children}
    </TierContext.Provider>
  );
}
