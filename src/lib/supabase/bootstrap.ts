"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const ALE_BOARD_EXAM_ID = "be000000-0000-0000-0000-000000000001";

/**
 * Uses service role to guarantee profile + ALE exam profile exist for the user.
 * Call this when the user is authenticated (you have their userId); RLS is bypassed so bootstrap always succeeds if the DB allows it.
 */
export async function ensureProfileAndExamProfile(
  userId: string,
  email?: string,
  fullName?: string
): Promise<void> {
  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existingProfile) {
    const { error: insertProfileError } = await admin.from("profiles").insert({
      id: userId,
      email: email ?? "",
      full_name: fullName ?? null,
    });
    if (insertProfileError) return;
  }

  const { data: existingExamProfiles } = await admin
    .from("exam_profiles")
    .select("id")
    .eq("user_id", userId);

  if (existingExamProfiles?.length) return;

  const { data: aleRow } = await admin
    .from("board_exams")
    .select("id")
    .eq("id", ALE_BOARD_EXAM_ID)
    .maybeSingle();

  if (!aleRow?.id) return;

  const { error: insertExamProfileError } = await admin.from("exam_profiles").insert({
    user_id: userId,
    board_exam_id: aleRow.id,
    target_exam_date: null,
    is_active: true,
    onboarding_completed: true,
    onboarding_step: "onboarding_completed",
  });
  if (insertExamProfileError) return;
}
