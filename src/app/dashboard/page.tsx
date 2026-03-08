import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { daysUntil, getGreeting } from "@/lib/utils/helpers";
import {
  Flame,
  CalendarDays,
  BarChart3,
  Box,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { SubjectCardsGrid } from "./subject-cards-grid";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import type { DailyUserStats, TestSession, ExamProfile, Subject, SubjectMastery } from "@/types/app";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get active exam profile
  const { data: activeExamProfile } = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const examProfile = activeExamProfile as ExamProfile | null;

  // Get subjects for active profile
  let subjects: Subject[] = [];
  let masteries: SubjectMastery[] = [];
  if (examProfile) {
    const { data: subs } = await supabase
      .from("subjects")
      .select("*")
      .eq("board_exam_id", examProfile.board_exam_id)
      .order("sort_order");
    subjects = (subs ?? []) as Subject[];

    const { data: mast } = await supabase
      .from("subject_mastery")
      .select("*")
      .eq("user_id", user.id)
      .eq("exam_profile_id", examProfile.id);
    masteries = (mast ?? []) as SubjectMastery[];
  }

  // Get question counts per subject
  const questionCounts: Record<string, number> = {};
  if (subjects.length > 0) {
    for (const s of subjects) {
      const { count } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("subject_id", s.id)
        .eq("status", "published");
      questionCounts[s.id] = count ?? 0;
    }
  }

  const { data: recentSessions } = await supabase
    .from("review_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: todayStats } = await supabase
    .from("daily_user_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", new Date().toISOString().split("T")[0])
    .single();

  const examDaysLeft = examProfile?.target_exam_date
    ? daysUntil(examProfile.target_exam_date)
    : null;

  const streak = examProfile?.daily_streak ?? profile?.daily_streak ?? 0;
  const longestStreak = examProfile?.longest_streak ?? profile?.longest_streak ?? 0;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {getGreeting()}, {profile?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {examProfile?.board_exams
            ? `Reviewing for ${examProfile.board_exams.short_name}`
            : "Ready to study?"}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Exam Countdown
              </CardTitle>
              <InfoTooltip content="Days left until your target exam date. Set or change it in onboarding or settings." />
            </div>
            <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono text-foreground">
              {examDaysLeft !== null ? `${examDaysLeft}d` : "—"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {examDaysLeft !== null ? "days remaining" : "Set your exam date"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
              <InfoTooltip content="Consecutive days you’ve studied. Study at least one day to keep your streak." />
            </div>
            <Flame
              className={`h-4 w-4 ${
                streak > 0
                  ? "text-warning"
                  : "text-muted-foreground"
              }`}
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono text-foreground">
              {streak}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Longest: {longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today
              </CardTitle>
              <InfoTooltip content="Number of questions you’ve answered today (tracked sessions and review)." />
            </div>
            <Target className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono text-foreground">
              {(todayStats as DailyUserStats | null)?.questions_attempted ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              questions answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Study Time
              </CardTitle>
              <InfoTooltip content="Total time spent studying today (sessions, review mode, and 3D lab)." />
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono text-foreground">
              {Math.round(((todayStats as DailyUserStats | null)?.total_study_time_ms ?? 0) / 60000)}m
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/review">
          <Button variant="outline" className="h-12 w-full justify-start gap-3 text-sm">
            <BookOpen className="h-4 w-4" strokeWidth={1.5} />
            Review Mode
          </Button>
        </Link>
        <Link href="/dashboard/sessions/new">
          <Button variant="outline" className="h-12 w-full justify-start gap-3 text-sm">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            New Session
          </Button>
        </Link>
        <Link href="/dashboard/analytics">
          <Button variant="outline" className="h-12 w-full justify-start gap-3 text-sm">
            <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
            Analytics
          </Button>
        </Link>
        <Link href="/dashboard/3d-lab">
          <Button variant="outline" className="h-12 w-full justify-start gap-3 text-sm">
            <Box className="h-4 w-4" strokeWidth={1.5} />
            3D Lab
          </Button>
        </Link>
      </div>

      {/* Subject Cards */}
      {subjects.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
              <InfoTooltip content="Subjects for your exam. Tap Review for endless practice or Quick Start for a timed quiz on that subject." />
            </div>
            <Badge variant="secondary" className="text-xs">
              {subjects.length} subjects
            </Badge>
          </div>
          <SubjectCardsGrid
            subjects={subjects}
            masteries={masteries}
            questionCounts={questionCounts}
            examProfileId={examProfile?.id ?? ""}
          />
        </section>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-base">Recent Sessions</CardTitle>
            <InfoTooltip content="Your latest quiz sessions. Resume in-progress or review results for completed ones." />
          </div>
        </CardHeader>
        <CardContent>
          {(recentSessions as TestSession[] | null)?.length ? (
            <div className="space-y-3">
              {(recentSessions as TestSession[]).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {session.session_type.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {session.correct_answers}/{session.total_questions} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold font-mono text-foreground">
                      {session.score_percentage != null
                        ? `${Math.round(session.score_percentage)}%`
                        : "—"}
                    </div>
                    <TrendingUp
                      className="ml-auto h-3 w-3 text-success"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No sessions yet. Start a quiz to see your progress here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
