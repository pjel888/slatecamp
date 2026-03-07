import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { DomainRadar } from "@/components/analytics/DomainRadar";
import { StreakCalendar } from "@/components/analytics/StreakCalendar";
import type { DomainMastery, DailyUserStats, TestSession } from "@/types/app";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("test_sessions")
    .select("*")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(50);

  const { data: domainMasteries } = await supabase
    .from("domain_mastery")
    .select("*, exam_domains(name)")
    .eq("user_id", user.id);

  const { data: dailyStats } = await supabase
    .from("daily_user_stats")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(90);

  const { data: weakQuestions } = await supabase
    .from("user_responses")
    .select("question_id, is_correct, questions(prompt)")
    .eq("user_id", user.id)
    .eq("is_correct", false)
    .limit(50);

  // Aggregate weak questions (failed 2+ times)
  const failCounts: Record<string, { count: number; prompt: string }> = {};
  ((weakQuestions ?? []) as { question_id: string; is_correct: boolean; questions: { prompt: string } | null }[]).forEach((r) => {
    const qid = r.question_id;
    const prompt = r.questions;
    if (!failCounts[qid]) {
      failCounts[qid] = { count: 0, prompt: prompt?.prompt ?? "Unknown" };
    }
    failCounts[qid].count++;
  });
  const weakestQuestions = Object.entries(failCounts)
    .filter(([, v]) => v.count >= 2)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  const domainData = ((domainMasteries ?? []) as (DomainMastery & { exam_domains: { name: string } | null })[]).map((dm) => ({
    domain: dm.exam_domains,
    mastery_score: dm.mastery_score,
    total_attempted: dm.total_attempted,
    total_correct: dm.total_correct,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your progress and identify weak areas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart sessions={(sessions as TestSession[]) ?? []} />
          </CardContent>
        </Card>

        {/* Domain Mastery Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domain Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainRadar
              data={domainData.map((d) => ({
                name: d.domain?.name ?? "Unknown",
                value: d.mastery_score,
              }))}
            />
          </CardContent>
        </Card>

        {/* Streak Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Study Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakCalendar stats={(dailyStats as DailyUserStats[]) ?? []} />
          </CardContent>
        </Card>

        {/* Weakest Questions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Weakest Questions{" "}
              <span className="text-sm font-normal text-muted-foreground">
                (failed 2+ times)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakestQuestions.length > 0 ? (
              <div className="space-y-2">
                {weakestQuestions.map(([qid, { count, prompt }]) => (
                  <div
                    key={qid}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <p className="line-clamp-1 text-sm text-foreground">
                      {prompt}
                    </p>
                    <span className="ml-4 shrink-0 text-xs font-medium text-[var(--color-signal-red)]">
                      {count}x wrong
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No frequently missed questions yet. Keep practicing!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
