import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewPageClient } from "./review-page-client";
import { NoExamProfilePrompt } from "@/components/shared/NoExamProfilePrompt";
import type { ExamProfile, Subject, SubjectMastery } from "@/types/app";

export const metadata = { title: "Review — Cerebro" };

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: examProfile } = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!examProfile) {
    return (
      <NoExamProfilePrompt
        title="Review"
        description="Doomscroll through practice questions. Choose an exam to get started."
      />
    );
  }

  const ep = examProfile as ExamProfile;

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("board_exam_id", ep.board_exam_id)
    .order("sort_order");

  const { data: mast } = await supabase
    .from("subject_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("exam_profile_id", ep.id);
  const masteries = (mast ?? []) as SubjectMastery[];

  const questionCounts: Record<string, number> = {};
  for (const s of (subjects ?? []) as Subject[]) {
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", s.id)
      .eq("status", "published");
    questionCounts[s.id] = count ?? 0;
  }

  return (
    <ReviewPageClient
      examProfileId={ep.id}
      subjects={(subjects ?? []) as Subject[]}
      masteries={masteries}
      questionCounts={questionCounts}
    />
  );
}
