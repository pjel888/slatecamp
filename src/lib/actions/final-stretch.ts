"use server";

import { createClient } from "@/lib/supabase/server";

export type FinalStretchPhase = "final_approach" | "countdown" | "final_week" | "exam_eve";

export interface FinalStretchState {
  active: boolean;
  daysLeft: number | null;
  phase: FinalStretchPhase | null;
  /** Free user and upsell not yet shown for this profile */
  showUpsellModal: boolean;
}

function getPhase(daysLeft: number): FinalStretchPhase {
  if (daysLeft <= 3) return "exam_eve";
  if (daysLeft <= 7) return "final_week";
  if (daysLeft <= 20) return "countdown";
  return "final_approach";
}

export async function getFinalStretchState(
  examProfile: { target_exam_date: string | null; final_stretch_upsell_shown?: boolean } | null,
  tier: string
): Promise<FinalStretchState> {
  if (!examProfile?.target_exam_date) {
    return { active: false, daysLeft: null, phase: null, showUpsellModal: false };
  }
  const target = new Date(examProfile.target_exam_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));

  if (daysLeft > 30) {
    return { active: false, daysLeft, phase: null, showUpsellModal: false };
  }

  const phase = getPhase(daysLeft);
  const showUpsellModal =
    tier === "free" && !examProfile.final_stretch_upsell_shown;

  return { active: true, daysLeft, phase, showUpsellModal };
}

export async function getWeakSubjectsForFinalStretch(
  examProfileId: string,
  limit = 3
): Promise<{ subject_id: string; subject_name: string; percentage: number; suggestedCount: number }[]> {
  const supabase = await createClient();
  const { data: masteries } = await supabase
    .from("subject_mastery")
    .select("subject_id, mastery_score")
    .eq("exam_profile_id", examProfileId)
    .lt("mastery_score", 75)
    .order("mastery_score", { ascending: true })
    .limit(limit);

  if (!masteries?.length) return [];
  const subjectIds = masteries.map((m: { subject_id: string }) => m.subject_id);
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, short_name")
    .in("id", subjectIds);
  const subjectMap = new Map(
    (subjects ?? []).map((s: { id: string; short_name?: string; name: string }) => [
      s.id,
      s.short_name ?? s.name,
    ])
  );
  return masteries.map((m: { subject_id: string; mastery_score: number | null }) => ({
    subject_id: m.subject_id,
    subject_name: subjectMap.get(m.subject_id) ?? "Subject",
    percentage: Number(m.mastery_score ?? 0),
    suggestedCount: 15,
  }));
}

export async function markFinalStretchUpsellShown(examProfileId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("exam_profiles")
    .update({ final_stretch_upsell_shown: true })
    .eq("id", examProfileId)
    .eq("user_id", user.id);
}
