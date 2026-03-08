import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";
import { DomainRadar } from "@/components/analytics/DomainRadar";
import { StreakCalendar } from "@/components/analytics/StreakCalendar";
import type { ExamProfile, ReviewSession, SubjectMastery, DailyUserStats, Subject } from "@/types/app";

export const metadata = { title: "Analytics — Cerebro" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: examProfile } = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const ep = examProfile as ExamProfile | null;
  const profileId = ep?.id;

  // Subject masteries
  let masteries: SubjectMastery[] = [];
  let subjects: Subject[] = [];
  if (profileId) {
    const { data: m } = await supabase
      .from("subject_mastery")
      .select("*")
      .eq("user_id", user.id)
      .eq("exam_profile_id", profileId);
    masteries = (m ?? []) as SubjectMastery[];

    const { data: s } = await supabase
      .from("subjects")
      .select("*")
      .eq("board_exam_id", ep!.board_exam_id)
      .order("sort_order");
    subjects = (s ?? []) as Subject[];
  }

  // Recent sessions for performance chart
  const { data: recentSessions } = await supabase
    .from("review_sessions")
    .select("id, score_percentage, created_at, session_type")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: true })
    .limit(30);

  // Daily stats for streak calendar
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

  const { data: dailyStats } = await supabase
    .from("daily_user_stats")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  // Study time today
  const today = new Date().toISOString().split("T")[0];
  const { data: studyTimeLogs } = await supabase
    .from("study_time_logs")
    .select("duration_ms, mode")
    .eq("user_id", user.id)
    .gte("started_at", `${today}T00:00:00`);

  const totalStudyTimeMs = (studyTimeLogs ?? []).reduce(
    (sum: number, log: { duration_ms: number | null }) => sum + (log.duration_ms ?? 0), 0
  );

  // Radar chart data (matches DomainRadar props: { name, value }[])
  const radarData = subjects.map((subject) => {
    const mastery = masteries.find((m) => m.subject_id === subject.id);
    return {
      name: subject.short_name ?? subject.name,
      value: mastery?.mastery_score ?? 0,
    };
  });

  const totalQuestionsAnswered = masteries.reduce((sum, m) => sum + m.total_attempted, 0);
  const overallAccuracy = totalQuestionsAnswered > 0
    ? Math.round(masteries.reduce((sum, m) => sum + m.total_correct, 0) / totalQuestionsAnswered * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your performance and study progress
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-blue)]/10">
                <Target className="h-5 w-5 text-[var(--accent-blue)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{totalQuestionsAnswered}</p>
                <p className="text-xs text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success)]/10">
                <TrendingUp className="h-5 w-5 text-[var(--success)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{overallAccuracy}%</p>
                <p className="text-xs text-muted-foreground">Overall Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning)]/10">
                <BarChart3 className="h-5 w-5 text-[var(--warning)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{(recentSessions ?? []).length}</p>
                <p className="text-xs text-muted-foreground">Sessions Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">
                  {Math.round(totalStudyTimeMs / 3600000)}h
                </p>
                <p className="text-xs text-muted-foreground">Study Time Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Subject Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <DomainRadar data={radarData} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Answer questions to see mastery breakdown
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Streak Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <StreakCalendar stats={(dailyStats ?? []) as DailyUserStats[]} />
        </CardContent>
      </Card>

      {/* Subject Breakdown Table */}
      {masteries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjects.map((subject) => {
                const m = masteries.find((mas) => mas.subject_id === subject.id);
                const accuracy = m && m.total_attempted > 0
                  ? Math.round((m.total_correct / m.total_attempted) * 100)
                  : 0;

                return (
                  <div key={subject.id} className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm text-foreground">
                          {subject.short_name ?? subject.name}
                        </span>
                        <span className="ml-2 text-sm font-mono font-semibold text-foreground">
                          {accuracy}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${accuracy}%`,
                            backgroundColor: subject.color ?? "var(--accent-blue)",
                          }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {m?.total_attempted ?? 0} Qs
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
