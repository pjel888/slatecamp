import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewFeed } from "./review-feed";
import type { ExamProfile, Subject } from "@/types/app";

export const metadata = { title: "Review Mode — Cerebro" };

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: examProfile } = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!examProfile) redirect("/onboarding");

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("board_exam_id", (examProfile as ExamProfile).board_exam_id)
    .order("sort_order");

  const { data: initialQuestions } = await supabase
    .from("questions")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <ReviewFeed
      examProfileId={(examProfile as ExamProfile).id}
      subjects={(subjects ?? []) as Subject[]}
      initialSubjectId={params.subject ?? null}
      initialQuestions={initialQuestions ?? []}
    />
  );
}
