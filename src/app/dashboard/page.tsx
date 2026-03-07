import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { daysUntil, getGreeting } from "@/lib/utils/helpers";
import {
  Brain,
  Flame,
  CalendarDays,
  ArrowRight,
  Upload,
  Box,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { DailyUserStats, TestSession, DomainMastery } from "@/types/app";

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

  const { count: srsCount } = await supabase
    .from("srs_queue")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("next_review_at", new Date().toISOString());

  const { data: recentSessions } = await supabase
    .from("test_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: domainMasteries } = await supabase
    .from("domain_mastery")
    .select("*, exam_domains(name)")
    .eq("user_id", user.id);

  const { data: todayStats } = await supabase
    .from("daily_user_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", new Date().toISOString().split("T")[0])
    .single();

  const reviewsDue = srsCount ?? 0;
  const examDaysLeft = profile?.target_exam_date
    ? daysUntil(profile.target_exam_date)
    : null;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {getGreeting()}, {profile?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile?.exam_target
            ? `Reviewing for ${profile.exam_target}`
            : "Ready to study?"}
        </p>
      </div>

      {/* Top row widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Mission */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviews Due
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono text-foreground">
              {reviewsDue}
            </div>
            <Link href="/dashboard/review">
              <Button size="sm" className="mt-3 w-full">
                Start Review <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Exam Countdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exam Countdown
            </CardTitle>
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

        {/* Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Flame
              className={`h-4 w-4 ${
                (profile?.daily_streak ?? 0) > 0
                  ? "text-[var(--color-signal-amber)]"
                  : "text-muted-foreground"
              }`}
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold font-mono text-foreground">
              {profile?.daily_streak ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Longest: {profile?.longest_streak ?? 0} days
            </p>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
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
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/dashboard/review", label: "Start Review", icon: Brain },
          { href: "/dashboard/quiz", label: "Practice Quiz", icon: Clock },
          { href: "/dashboard/library/upload", label: "Upload PDF", icon: Upload },
          { href: "/dashboard/3d-lab", label: "3D Lab", icon: Box },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-3 text-sm"
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {(recentSessions as TestSession[] | null)?.length ? (
            <div className="space-y-3">
              {(recentSessions as TestSession[]).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {session.session_type.replace("_", " ")}
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
                      className="ml-auto h-3 w-3 text-[var(--color-signal-green)]"
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
