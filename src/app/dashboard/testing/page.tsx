import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { ensureProfileAndExamProfile } from "@/lib/supabase/bootstrap";
import { NoExamProfilePrompt } from "@/components/shared/NoExamProfilePrompt";
import { TestingTabs } from "@/components/testing/testing-tabs";
import type { ExamProfile, Subject, ReviewSession, SubjectMastery } from "@/types/app";

export const metadata = { title: "Testing — Cerebro" };
export const dynamic = "force-dynamic";

export default async function TestingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; subject?: string; quick?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  await ensureProfileAndExamProfile(
    user.id,
    user.email,
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
  );

  // --- Resolve active exam profile ---
  let examProfilesRaw = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  let allProfiles = (examProfilesRaw.data ?? []) as ExamProfile[];
  let examProfile: ExamProfile | null =
    allProfiles.find((p) => p.is_active) ?? allProfiles[0] ?? null;

  if (allProfiles.length === 0) {
    examProfilesRaw = await supabase
      .from("exam_profiles")
      .select("*, board_exams(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    allProfiles = (examProfilesRaw.data ?? []) as ExamProfile[];
    examProfile = allProfiles[0] ?? null;
  }

  if (examProfile && !examProfile.is_active && allProfiles.length > 0) {
    await supabase.from("exam_profiles").update({ is_active: false }).eq("user_id", user.id);
    await supabase
      .from("exam_profiles")
      .update({ is_active: true })
      .eq("id", allProfiles[0].id);
    examProfile = { ...allProfiles[0], is_active: true };
  }

  if (!examProfile) {
    return (
      <NoExamProfilePrompt
        title="Testing"
        description="Run your project's supabase/seed.sql in the Supabase SQL Editor (same project as in .env.local). That adds the ALE board exam and sample data. Then refresh this page."
      />
    );
  }

  const ep = examProfile;

  // --- Fetch subjects (shared across quiz, review, library tabs) ---
  const { data: subjectsRaw } = await supabase
    .from("subjects")
    .select("*")
    .eq("board_exam_id", ep.board_exam_id)
    .order("sort_order");
  const subjects = (subjectsRaw ?? []) as Subject[];

  // --- Fetch sessions (for sessions tab) ---
  const { data: sessionsRaw } = await supabase
    .from("review_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("exam_profile_id", ep.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const sessions = (sessionsRaw ?? []) as ReviewSession[];

  // --- Fetch mastery scores (for review tab) ---
  const { data: masteryRaw } = await supabase
    .from("subject_mastery")
    .select("*")
    .eq("user_id", user.id)
    .eq("exam_profile_id", ep.id);
  const masteries = (masteryRaw ?? []) as SubjectMastery[];

  // --- Fetch question counts (shared by review + library tabs) ---
  const questionCounts: Record<string, number> = {};
  if (subjects.length > 0) {
    const { data: countRows } = await supabase
      .from("questions")
      .select("subject_id")
      .in(
        "subject_id",
        subjects.map((s) => s.id)
      )
      .eq("status", "published");
    for (const row of countRows ?? []) {
      const sid = (row as { subject_id: string }).subject_id;
      questionCounts[sid] = (questionCounts[sid] ?? 0) + 1;
    }
  }

  // --- Determine initial tab + quick start state ---
  const initialTab = params.tab ?? "quiz";
  const initialQuickSubjectId =
    params.quick === "true" && params.subject ? params.subject : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Testing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practice, review, and track your board exam preparation
        </p>
      </div>

      <TestingTabs
        examProfile={ep}
        subjects={subjects}
        sessions={sessions}
        masteries={masteries}
        questionCounts={questionCounts}
        initialTab={initialTab}
        initialQuickSubjectId={initialQuickSubjectId}
      />
    </div>
  );
}
