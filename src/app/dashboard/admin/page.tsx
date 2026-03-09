import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { isAdminByEmail } from "@/lib/admin/is-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, BarChart3, TrendingUp, Shield } from "lucide-react";

export const metadata = { title: "Admin — Cerebro" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as { is_admin?: boolean } | null)?.is_admin === true || isAdminByEmail(user.email ?? undefined);
  if (!profile || !isAdmin) redirect(ROUTES.DASHBOARD);

  // Total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  // Users by tier
  const { data: tierData } = await supabase
    .from("profiles")
    .select("tier");

  const tierCounts = { free: 0, pro: 0, max: 0 };
  (tierData ?? []).forEach((p: { tier: string }) => {
    const tier = p.tier as keyof typeof tierCounts;
    if (tier in tierCounts) tierCounts[tier]++;
  });

  // Questions answered (total session questions with answers)
  const { count: totalAnswered } = await supabase
    .from("session_questions")
    .select("id", { count: "exact", head: true })
    .not("selected_answer", "is", null);

  // Total sessions
  const { count: totalSessions } = await supabase
    .from("review_sessions")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed");

  // Total questions in bank
  const { count: totalQuestions } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  // Most missed questions
  const { data: missedQuestions } = await supabase
    .from("session_questions")
    .select("question_id, questions(prompt)")
    .eq("is_correct", false)
    .limit(100);

  const missedCounts: Record<string, { count: number; prompt: string }> = {};
  (missedQuestions ?? []).forEach((sq: { question_id: string; questions: { prompt: string } | null }) => {
    const qId = sq.question_id;
    const prompt = sq.questions?.prompt ?? "";
    if (!missedCounts[qId]) missedCounts[qId] = { count: 0, prompt };
    missedCounts[qId].count++;
  });

  const topMissed = Object.entries(missedCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-accent-blue" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform analytics and overview</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10">
                <Users className="h-5 w-5 text-accent-blue" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{totalUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <MessageSquare className="h-5 w-5 text-success" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{totalAnswered ?? 0}</p>
                <p className="text-xs text-muted-foreground">Answers Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <BarChart3 className="h-5 w-5 text-warning" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{totalSessions ?? 0}</p>
                <p className="text-xs text-muted-foreground">Sessions Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <TrendingUp className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{totalQuestions ?? 0}</p>
                <p className="text-xs text-muted-foreground">Questions in Bank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tier Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {(["free", "pro", "max"] as const).map((tier) => (
              <div key={tier} className="flex-1 rounded-lg bg-secondary p-4 text-center">
                <p className="text-2xl font-semibold font-mono text-foreground">{tierCounts[tier]}</p>
                <Badge variant="secondary" className="mt-1 capitalize text-xs">{tier}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Missed Questions */}
      {topMissed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Most Missed Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMissed.map(([qId, { count, prompt }]) => (
                <div key={qId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <p className="text-sm text-foreground line-clamp-1 flex-1">{prompt}</p>
                  <Badge variant="destructive" className="ml-3 shrink-0 text-xs">
                    {count}x wrong
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
