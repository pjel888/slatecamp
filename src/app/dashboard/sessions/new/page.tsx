import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { siteConfig } from "@/lib/constants/site";
import { SessionBuilder } from "./session-builder";
import { NoExamProfilePrompt } from "@/components/shared/NoExamProfilePrompt";
import type { ExamProfile, Subject } from "@/types/app";

export const metadata = { title: `New Session — ${siteConfig.name}` };

export default async function NewSessionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { data: examProfile } = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!examProfile) {
    return (
      <NoExamProfilePrompt
        title="New Session"
        description="Build a custom quiz by subject and question count. Choose an exam to get started."
      />
    );
  }

  const ep = examProfile as ExamProfile;

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("board_exam_id", ep.board_exam_id)
    .order("sort_order");

  return (
    <SessionBuilder
      examProfileId={ep.id}
      subjects={(subjects ?? []) as Subject[]}
    />
  );
}
