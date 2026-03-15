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
  const ARCHITECTURE_ID = 'a0000000-0000-0000-0000-000000000001';

  // 1. Get default discipline (Architecture)
  let disciplineId = ARCHITECTURE_ID;
  
  const { data: discipline, error: discError } = await admin
    .from("disciplines")
    .select("discipline_id")
    .eq("name", "Architecture")
    .maybeSingle();

  if (discipline?.discipline_id) {
    disciplineId = discipline.discipline_id;
  } else {
    console.warn("Default discipline 'Architecture' not found via query, using fallback ID.", discError || "No data");
  }

  // 2. Upsert user_subscriptions
  const { error: subError } = await admin
    .from("user_subscriptions")
    .upsert({
      user_id: userId,
      tier: 'free',
      status: 'active',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }); // Force update to ensure consistency

  if (subError) {
    console.error("Error upserting subscription:", JSON.stringify(subError, null, 2));
  }

  // 3. Upsert user_global_stats with default discipline
  const { error: statsError } = await admin
    .from("user_global_stats")
    .upsert({
      user_id: userId,
      current_discipline_id: disciplineId,
      global_readiness_score: 0.0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }); // Force update to fix null discipline

  if (statsError) {
    console.error("Error upserting stats:", JSON.stringify(statsError, null, 2));
  }
}
