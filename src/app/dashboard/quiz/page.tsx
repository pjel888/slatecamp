import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureProfileAndExamProfile } from "@/lib/supabase/bootstrap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Play, ChevronRight } from "lucide-react";
import Link from "next/link";
import { QuickStartForm } from "./quick-start-form";
import { QuizModeCards } from "./quiz-mode-cards";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { NoExamProfilePrompt } from "@/components/shared/NoExamProfilePrompt";
import type { ExamProfile, Subject } from "@/types/app";

export const metadata = { title: "Quiz — Cerebro" };
export const dynamic = "force-dynamic";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; quick?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await ensureProfileAndExamProfile(
    user.id,
    user.email,
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
  );

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
    await supabase.from("exam_profiles").update({ is_active: true }).eq("id", allProfiles[0].id);
    examProfile = { ...allProfiles[0], is_active: true };
  }

  if (!examProfile) {
    return (
      <NoExamProfilePrompt
        title="Quiz"
        description="Run your project's supabase/seed.sql in the Supabase SQL Editor (same project as in .env.local). That adds the ALE board exam and sample data. Then refresh this page."
      />
    );
  }

  const ep = examProfile;

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("board_exam_id", ep.board_exam_id)
    .order("sort_order");

  // If quick start mode with a subject
  if (params.quick === "true" && params.subject) {
    return (
      <div className="mx-auto max-w-[600px] space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quick Start</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your settings and jump right in
          </p>
        </div>
        <QuickStartForm
          examProfileId={ep.id}
          subjectId={params.subject}
          subjectName={
            ((subjects ?? []) as Subject[]).find((s) => s.id === params.subject)?.name ?? "Subject"
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quiz</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a session or build a custom quiz
          </p>
        </div>
        <Link href="/dashboard/sessions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Custom Session
          </Button>
        </Link>
      </div>

      {/* Quiz Mode — SRS Review and others with rich info popovers */}
      <QuizModeCards />

      {/* Subject Quick Start */}
      <section>
        <div className="mb-3 flex items-center gap-1.5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Subject Quick Start
          </h2>
          <InfoTooltip content="Start a short quiz for one subject. Pick the number of questions and go." />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {((subjects ?? []) as Subject[]).map((subject) => {
            return (
              <Link key={subject.id} href={`/dashboard/quiz?subject=${subject.id}&quick=true`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${subject.color ?? "#86868B"}15` }}
                    >
                      <Play
                        className="h-4 w-4"
                        style={{ color: subject.color ?? "#86868B" }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {subject.short_name ?? subject.name}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
