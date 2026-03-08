import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, RotateCcw, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReviewSession, SessionQuestion, Question } from "@/types/app";

export const metadata = { title: "Session Summary — Cerebro" };

export default async function SessionSummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("review_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) redirect("/dashboard");

  const s = session as ReviewSession;

  const { data: sessionQuestions } = await supabase
    .from("session_questions")
    .select("*, questions(*)")
    .eq("session_id", sessionId)
    .order("question_number");

  const sqs = (sessionQuestions ?? []) as SessionQuestion[];
  const wrongAnswers = sqs.filter((sq) => sq.is_correct === false);

  const totalTimeMinutes = Math.round((s.total_time_ms ?? 0) / 60000);
  const avgTimeSeconds = s.avg_response_time_ms ? Math.round(s.avg_response_time_ms / 1000) : 0;
  const scorePct = s.score_percentage ?? 0;

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      {/* Score */}
      <div className="text-center">
        <div className="inline-flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--accent-blue)]">
          <span className="text-4xl font-bold font-mono text-foreground">
            {Math.round(scorePct)}%
          </span>
        </div>
        <p className="mt-3 text-lg font-semibold text-foreground">
          {scorePct >= 80 ? "Excellent!" : scorePct >= 60 ? "Good job!" : "Keep practicing!"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {s.questions_correct}/{s.total_questions} correct
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Check className="mx-auto h-5 w-5 text-[var(--success)]" strokeWidth={1.5} />
            <p className="mt-1 text-2xl font-semibold font-mono text-foreground">{s.questions_correct}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <X className="mx-auto h-5 w-5 text-[var(--danger)]" strokeWidth={1.5} />
            <p className="mt-1 text-2xl font-semibold font-mono text-foreground">{s.questions_incorrect}</p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-1 text-2xl font-semibold font-mono text-foreground">{totalTimeMinutes}m</p>
            <p className="text-xs text-muted-foreground">~{avgTimeSeconds}s/Q</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Breakdown */}
      {s.subject_scores?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s.subject_scores.map((ss) => (
                <div key={ss.subject_id} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{ss.subject_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {ss.correct}/{ss.total}
                    </span>
                    <Badge
                      variant={ss.percentage >= 80 ? "default" : ss.percentage >= 60 ? "secondary" : "destructive"}
                      className="text-xs font-mono"
                    >
                      {Math.round(ss.percentage)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wrong Answers */}
      {wrongAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Questions to Review ({wrongAnswers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wrongAnswers.slice(0, 10).map((sq) => {
                const q = sq.questions as Question | undefined;
                return (
                  <div key={sq.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm text-foreground line-clamp-2">{q?.prompt}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Your: {sq.selected_answer?.toUpperCase()}
                      </Badge>
                      <Badge className="text-xs bg-[var(--success)] text-white">
                        Correct: {q?.correct_answer?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/sessions" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            Sessions
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
