import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { QuickStartForm } from "./quick-start-form";
import type { ExamProfile, Subject, ReviewSession } from "@/types/app";

export const metadata = { title: "Quiz — Cerebro" };

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; quick?: string }>;
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

  const ep = examProfile as ExamProfile;

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("board_exam_id", ep.board_exam_id)
    .order("sort_order");

  const { data: recentSessions } = await supabase
    .from("review_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("exam_profile_id", ep.id)
    .order("created_at", { ascending: false })
    .limit(5);

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

      {/* Subject Quick Start */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Subject Quick Start
        </h2>
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

      {/* Recent Sessions */}
      {(recentSessions ?? []).length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent Sessions
            </h2>
            <Link href="/dashboard/sessions" className="text-xs text-[var(--accent-blue)] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {(recentSessions as ReviewSession[]).map((s) => (
              <Card key={s.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {s.name ?? s.session_type.replace(/_/g, " ")}
                      </span>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {s.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      <span>{s.total_questions} Qs</span>
                    </div>
                  </div>
                  {s.score_percentage != null && (
                    <span className="text-lg font-semibold font-mono text-foreground">
                      {Math.round(s.score_percentage)}%
                    </span>
                  )}
                  <Link href={s.status === "completed" ? `/dashboard/quiz/${s.id}/summary` : `/dashboard/quiz/${s.id}`}>
                    <Button variant="outline" size="sm">
                      {s.status === "completed" ? "Review" : "Resume"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
