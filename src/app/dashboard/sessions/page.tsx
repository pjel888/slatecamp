import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import type { ReviewSession, ExamProfile } from "@/types/app";

export const metadata = { title: "Sessions — Cerebro" };

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: examProfile } = await supabase
    .from("exam_profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const profileId = (examProfile as ExamProfile | null)?.id;

  let sessions: ReviewSession[] = [];
  if (profileId) {
    const { data } = await supabase
      .from("review_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("exam_profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50);
    sessions = (data ?? []) as ReviewSession[];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-semibold text-foreground">Sessions</h1>
            <InfoTooltip content="All your quiz sessions. Resume in-progress or open summaries for completed sessions." side="right" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your quiz history and session management
          </p>
        </div>
        <Link href="/dashboard/sessions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New Session
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No sessions yet. Create your first session to start tracking your progress.
            </p>
            <Link href="/dashboard/sessions/new">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Create Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const scorePct = s.score_percentage != null ? Math.round(s.score_percentage) : null;
            const totalMin = Math.round((s.total_time_ms ?? 0) / 60000);
            const isCompleted = s.status === "completed";

            return (
              <Card key={s.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {s.name ?? s.session_type.replace(/_/g, " ")}
                      </span>
                      <Badge
                        variant={isCompleted ? "secondary" : "default"}
                        className="shrink-0 text-xs capitalize"
                      >
                        {s.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      <span>{s.total_questions} questions</span>
                      {totalMin > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.5} />
                          {totalMin}m
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {scorePct !== null && (
                      <span className="text-xl font-semibold font-mono text-foreground">
                        {scorePct}%
                      </span>
                    )}
                    {isCompleted ? (
                      <Link href={`/dashboard/quiz/${s.id}/summary`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          Details <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/quiz/${s.id}`}>
                        <Button size="sm" className="gap-1">
                          Resume <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
