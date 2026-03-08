import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags, getEffectiveTier, getConnectionState } from "./feature-flags";
import { isAdminByEmail } from "./is-admin";
import type { UserTier } from "@/types/app";
import type { DevConnectionState } from "@/lib/dev/dev-mode";

export interface AdminAwareProfile {
  id: string;
  email: string;
  full_name: string | null;
  tier: UserTier;
  effectiveTier: UserTier;
  isAdmin: boolean;
  connectionState: DevConnectionState;
  isTierSimulated: boolean;
  profession: string;
  exam_target: string | null;
  target_exam_date: string | null;
  daily_streak: number;
  longest_streak: number;
  onboarding_completed: boolean;
  preferred_theme: string;
  ai_tokens_used: number;
  ai_tokens_limit: number;
  [key: string]: unknown;
}

/**
 * Fetches profile with admin-aware effective tier and connection state.
 * Use this instead of raw profile queries wherever tier gating is needed.
 */
export async function getAdminAwareProfile(): Promise<AdminAwareProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const isAdmin = (profile as { is_admin?: boolean }).is_admin === true || isAdminByEmail(user.email ?? undefined);
  const flags = await getFeatureFlags();
  const connectionState = getConnectionState();
  const effectiveTier = getEffectiveTier(
    profile.tier as UserTier,
    isAdmin,
    flags
  );

  const isTierSimulated =
    (flags.simulatedTier ?? flags.spoofedTier ?? null) !== null;

  return {
    ...profile,
    tier: profile.tier as UserTier,
    effectiveTier,
    isAdmin,
    connectionState,
    isTierSimulated,
  } as AdminAwareProfile;
}
