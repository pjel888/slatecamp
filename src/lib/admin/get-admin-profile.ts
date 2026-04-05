import { createClient, getUser } from "@/lib/supabase/server";
import { getFeatureFlags, getEffectiveTier, getConnectionState } from "./feature-flags";
import { getUserRole } from "@/lib/admin/roles";
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
  const {
    data: { user },
  } = await getUser();

  if (!user) return null;

  const supabase = await createClient();

  // Fetch new data structures in parallel
  const [subResult, statsResult] = await Promise.all([
    supabase
      .from("user_subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_global_stats")
      .select("*, disciplines(name)")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const subscription = subResult.data;
  const stats = statsResult.data;

  // Even if stats/sub are missing, we can provide a base profile if user exists
  const currentTier = (subscription?.tier ?? "free") as UserTier;
  const role = await getUserRole();
  const isAdmin = role !== null;
  
  const flags = await getFeatureFlags();
  const connectionState = getConnectionState();
  const effectiveTier = getEffectiveTier(
    currentTier,
    isAdmin,
    flags
  );

  const isTierSimulated =
    (flags.simulatedTier ?? flags.spoofedTier ?? null) !== null;

  return {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name ?? user.email,
    tier: currentTier,
    effectiveTier,
    isAdmin,
    connectionState,
    isTierSimulated,
    profession: (stats?.disciplines as any)?.name ?? "Architecture",
    exam_target: null,
    target_exam_date: null,
    daily_streak: (stats as any)?.current_streak_days ?? 0,
    longest_streak: (stats as any)?.longest_streak_days ?? 0,
    onboarding_completed: !!stats?.current_discipline_id,
    preferred_theme: "system",
    ai_tokens_used: 0,
    ai_tokens_limit: 1000, // Default limit
  } as AdminAwareProfile;
}
