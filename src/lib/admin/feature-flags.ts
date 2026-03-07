import type { UserTier } from "@/types/app";
import { cookies } from "next/headers";

export interface FeatureFlags {
  spoofedTier: UserTier | null;
  bypass3dGate: boolean;
  bypassAiGate: boolean;
  bypassSrsGate: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  spoofedTier: null,
  bypass3dGate: false,
  bypassAiGate: false,
  bypassSrsGate: false,
};

const COOKIE_NAME = "cerebro_dev_flags";

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const baseFlags: FeatureFlags = isDemo
    ? { ...DEFAULT_FLAGS, bypass3dGate: true, bypassAiGate: true, bypassSrsGate: true }
    : DEFAULT_FLAGS;

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (!raw) return baseFlags;
    return { ...baseFlags, ...JSON.parse(raw) };
  } catch {
    return baseFlags;
  }
}

/**
 * Returns the effective tier for the user.
 * If the user is an admin and has a spoofed tier set via dev flags, that takes priority.
 * If the user is an admin (no spoof set), they get "max" access by default.
 */
export function getEffectiveTier(
  actualTier: UserTier,
  isAdmin: boolean,
  flags: FeatureFlags
): UserTier {
  if (!isAdmin) return actualTier;
  if (flags.spoofedTier) return flags.spoofedTier;
  return "max";
}

/**
 * Check if a feature requiring a minimum tier is accessible.
 * Admins always pass unless they explicitly spoof a lower tier.
 */
export function hasTierAccess(
  requiredTier: UserTier,
  actualTier: UserTier,
  isAdmin: boolean,
  flags: FeatureFlags
): boolean {
  const effective = getEffectiveTier(actualTier, isAdmin, flags);
  const RANK: Record<UserTier, number> = { free: 0, pro: 1, max: 2 };
  return RANK[effective] >= RANK[requiredTier];
}
