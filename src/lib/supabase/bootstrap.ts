"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/demo/config";

/**
 * Bootstraps a user by ensuring they have necessary records in the new schema.
 * No-op in demo mode.
 */
export const bootstrapUser = async (
  userId: string
): Promise<void> => {
  if (isDemoMode()) return;

  const admin = createAdminClient();

  // Fast path: established users already have records — skip all writes
  const { data: existing } = await admin
    .from("user_global_stats")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  // New user: full bootstrap
  const ARCHITECTURE_ID = 'a0000000-0000-0000-0000-000000000001';

  const { data: discipline, error: discError } = await admin
    .from("disciplines")
    .select("discipline_id")
    .eq("name", "Architecture")
    .maybeSingle();

  const disciplineId = discipline?.discipline_id ?? ARCHITECTURE_ID;
  if (!discipline?.discipline_id) {
    console.warn("Default discipline 'Architecture' not found via query, using fallback ID.", discError || "No data");
  }

  // All three upserts are independent — run in parallel
  const [{ error: subError }, { error: statsError }, { error: profileError }] = await Promise.all([
    admin
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        tier: 'free',
        status: 'active',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }),
    admin
      .from("user_global_stats")
      .upsert({
        user_id: userId,
        current_discipline_id: disciplineId,
        global_readiness_score: 0.0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }),
    admin
      .from("profiles")
      .upsert({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id', ignoreDuplicates: true }),
  ]);

  if (subError) {
    console.error("Error upserting subscription:", JSON.stringify(subError, null, 2));
    throw new Error(`Bootstrap failed: could not create user subscription — ${subError.message}`);
  }
  if (statsError) {
    console.error("Error upserting stats:", JSON.stringify(statsError, null, 2));
    throw new Error(`Bootstrap failed: could not create user global stats — ${statsError.message}`);
  }
  if (profileError) {
    console.error("Error upserting profile:", JSON.stringify(profileError, null, 2));
    throw new Error(`Bootstrap failed: could not create user profile — ${profileError.message}`);
  }
};
