import { createClient, getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { daysUntil, getGreeting } from "@/lib/utils/helpers";
import {
  Flame,
  CalendarDays,
  BookOpen,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { SubjectCardsGrid } from "./subject-cards-grid";
import { ReadinessGauge } from "@/components/shared/ReadinessGauge";
import { DailyMission } from "@/components/dashboard/DailyMission";
import { getReadinessScore } from "@/lib/actions/readiness";
import { getDailyMission } from "@/lib/actions/daily-mission";
import { getSubjectDailyStudiersBatch } from "@/lib/actions/social-proof";
import {
  getFinalStretchState,
  getWeakSubjectsForFinalStretch,
} from "@/lib/actions/final-stretch";
import { FinalStretchBanner } from "@/components/dashboard/FinalStretchBanner";
import { WhatToFocusOn } from "@/components/dashboard/WhatToFocusOn";
import { FinalStretchUpsellModal } from "@/components/modals/FinalStretchUpsellModal";
import { SRSWidget } from "@/components/dashboard/SRSWidget";
import { getSRSDashboardData } from "@/lib/actions/srs-dashboard";
import type { DailyUserStats, ReviewSession, ExamProfile, Subject, SubjectMastery, UserTier } from "@/types/app";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const tier = (profile?.tier ?? "free") as UserTier;

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

  // Get readiness score, daily mission, and social proof (daily studiers per subject) in parallel
  const [readinessData, missionData, dailyStudiers] = await Promise.all([
    examProfile ? getReadinessScore(examProfile.id) : null,
    examProfile ? getDailyMission(examProfile.id) : null,
    subjects.length > 0 ? getSubjectDailyStudiersBatch(subjects.map((s) => s.id)) : Promise.resolve({}),
  ]);

  const { data: recentSessions } = await supabase
    .from("review_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const examDaysLeft = examProfile?.target_exam_date
    ? daysUntil(examProfile.target_exam_date)
    : null;

  const streak = examProfile?.daily_streak ?? 0;

  // SRS dashboard data (due count, avg retention, next review) for Pro/Max
  const srsDashboardData =
    examProfile && tier !== "free"
      ? await getSRSDashboardData(examProfile.id)
      : null;

  // Final Stretch (0–30 days to exam)
  const finalStretch = examProfile
    ? await getFinalStretchState(
        {
          target_exam_date: examProfile.target_exam_date,
          final_stretch_upsell_shown: (examProfile as { final_stretch_upsell_shown?: boolean }).final_stretch_upsell_shown,
        },
        tier
      )
    : { active: false, daysLeft: null, phase: null, showUpsellModal: false };
  const weakSubjects =
    finalStretch.active && examProfile
      ? await getWeakSubjectsForFinalStretch(examProfile.id)
      : [];
  const examShortName = examProfile?.board_exams?.short_name ?? "ALE";

  return (
    <div className="space-y-8">
      {/* Greeting — Final Stretch: show T-N days */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {finalStretch.active && finalStretch.daysLeft != null
            ? `T-${finalStretch.daysLeft} days to your ${examShortName}`
            : `${getGreeting()}, ${profile?.full_name?.split(" ")[0] ?? "there"}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {examProfile?.board_exams
            ? `Reviewing for ${examProfile.board_exams.short_name}`
            : "Ready to study?"}
        </p>
      </div>

      {/* Final Stretch Banner + Upsell Modal */}
      {finalStretch.active && finalStretch.daysLeft != null && finalStretch.phase && (
        <FinalStretchBanner
          daysLeft={finalStretch.daysLeft}
          phase={finalStretch.phase}
          examName={examShortName}
        />
      )}
      {finalStretch.showUpsellModal && examProfile && finalStretch.daysLeft != null && (
        <FinalStretchUpsellModal
          show
          examProfileId={examProfile.id}
          daysLeft={finalStretch.daysLeft}
          examName={examShortName}
        />
      )}

      {/* ============================================ */}
      {/* PRIMARY ZONE — Readiness + Daily Mission     */}
      {/* ============================================ */}
      {examProfile && (
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          {/* Readiness Gauge */}
          <div className="flex items-center justify-center rounded-xl border border-border bg-card p-6">
            <ReadinessGauge
              score={readinessData?.score ?? 0}
              previousScore={readinessData?.previousScore}
              size="lg"
              showLabel
              animateOnMount
            />
          </div>

          {/* Daily Mission */}
          {missionData && (
            <DailyMission
              mission={missionData}
              examProfileId={examProfile.id}
            />
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* SECONDARY ZONE — Subjects + Sidebar widgets  */}
      {/* ============================================ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Subject Cards */}
        <div>
          {subjects.length > 0 ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
                <Badge variant="secondary" className="text-xs">
                  {subjects.length} subjects
                </Badge>
              </div>
              <SubjectCardsGrid
                subjects={subjects}
                masteries={masteries}
                questionCounts={questionCounts}
                examProfileId={examProfile?.id ?? ""}
                tier={tier}
                dailyStudiers={dailyStudiers}
              />
            </section>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-6 w-6 text-muted-foreground mb-2" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">
                  Start your first session to unlock insights.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Sidebar widgets (desktop only) */}
        <div className="hidden space-y-4 lg:block">
          {/* What to focus on (Final Stretch) */}
          {finalStretch.active && weakSubjects.length > 0 && examProfile && (
            <WhatToFocusOn
              weakSubjects={weakSubjects}
              examProfileId={examProfile.id}
            />
          )}
          {/* SRS Widget (with retention when Pro/Max) */}
          {tier !== "free" && srsDashboardData ? (
            <SRSWidget data={srsDashboardData} />
          ) : tier === "free" ? (
            <Card className="opacity-75">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  SRS Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Spaced repetition is available on Pro. <Link href="/dashboard/settings/billing" className="text-primary underline">Upgrade →</Link>
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Exam Countdown */}
          {examDaysLeft !== null && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Exam Countdown
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold font-mono text-foreground">
                  {examDaysLeft}d
                </p>
                <p className="mt-1 text-xs text-muted-foreground">days remaining</p>
              </CardContent>
            </Card>
          )}

          {/* Streak */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Streak
              </CardTitle>
              <Flame
                className={`h-4 w-4 ${streak > 0 ? "text-warning" : "text-muted-foreground"}`}
                strokeWidth={1.5}
              />
            </CardHeader>
            <CardContent>
              {streak > 0 ? (
                <>
                  <p className="text-3xl font-semibold font-mono text-foreground">{streak}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    day{streak !== 1 ? "s" : ""} in a row
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Answer questions today to start your streak.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================ */}
      {/* TERTIARY ZONE — Recent sessions + Quick Actions */}
      {/* ============================================ */}
      <div className="space-y-4">
        {/* Recent Sessions (last 3, compact) */}
        {(recentSessions as ReviewSession[] | null)?.length ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(recentSessions as ReviewSession[]).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {session.session_type.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground">
                        {session.questions_correct}/{session.total_questions} correct
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold font-mono text-foreground">
                        {session.score_percentage != null
                          ? `${Math.round(session.score_percentage)}%`
                          : "—"}
                      </div>
                      <TrendingUp className="ml-auto h-3 w-3 text-success" strokeWidth={1.5} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Quick Actions — ghost/outline buttons, not primary */}
        <div className="flex gap-3">
          <Link href="/dashboard/sessions/new" className="flex-1">
            <Button variant="outline" className="h-11 w-full text-sm gap-2">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              New Session
            </Button>
          </Link>
          <Link href="/dashboard/library" className="flex-1">
            <Button variant="outline" className="h-11 w-full text-sm gap-2">
              <BookOpen className="h-4 w-4" strokeWidth={1.5} />
              Browse Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
