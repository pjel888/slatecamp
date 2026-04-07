"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
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
  pro: 1,
  prime: 2,
  institutional: 3,
  enterprise: 4,
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
  const capabilities = useMemo(() => TIER_CAPABILITIES[effectiveTier], [effectiveTier]);
  const hasAccess = useCallback(
    (requiredTier: UserTier) => TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier],
    [effectiveTier],
  );

  return (
    <TierContext.Provider
      value={{ tier, effectiveTier, isDevMode, capabilities, hasAccess }}
    >
      {children}
    </TierContext.Provider>
  );
}
