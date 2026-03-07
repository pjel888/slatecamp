import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags, getEffectiveTier } from "./feature-flags";
import type { UserTier } from "@/types/app";

export interface AdminAwareProfile {
  id: string;
  email: string;
  full_name: string | null;
  tier: UserTier;
  effectiveTier: UserTier;
  isAdmin: boolean;
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
 * Fetches profile with admin-aware effective tier.
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

  const isAdmin = profile.is_admin === true;
  const flags = await getFeatureFlags();
  const effectiveTier = getEffectiveTier(
    profile.tier as UserTier,
    isAdmin,
    flags
  );

  return {
    ...profile,
    tier: profile.tier as UserTier,
    effectiveTier,
    isAdmin,
  } as AdminAwareProfile;
}
