"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/demo/config";

/**
 * Bootstraps a user by ensuring they have necessary records in the new schema.
 * No-op in demo mode.
 */
export async function bootstrapUser(
  userId: string
): Promise<void> {
  if (isDemoMode()) return;

  const admin = createAdminClient();

  // 1. Ensure user_subscriptions exists
  const { data: existingSub, error: subFetchError } = await admin
    .from("user_subscriptions")
    .select("subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subFetchError) {
    console.error("Error fetching user subscription:", subFetchError);
  }

  if (!existingSub && !subFetchError) {
    const { error: subInsertError } = await admin.from("user_subscriptions").insert({
      user_id: userId,
      tier: 'free',
      status: 'active',
    });
    if (subInsertError) {
      console.error("Error inserting default subscription:", subInsertError);
    }
  }

  // 2. Ensure user_global_stats exists
  const { data: existingStats, error: statsFetchError } = await admin
    .from("user_global_stats")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (statsFetchError) {
    console.error("Error fetching user stats:", statsFetchError);
  }

  if (!existingStats && !statsFetchError) {
    // Note: streak columns removed to match active schema
    const { error: statsInsertError } = await admin.from("user_global_stats").insert({
      user_id: userId,
      current_discipline_id: null,
      global_readiness_score: 0.0,
    });
    if (statsInsertError) {
      console.error("Error inserting default stats:", statsInsertError);
    }
  }
}
