import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { siteConfig } from "@/lib/constants/site";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { SessionList } from "./session-list";
import type { ReviewSession, ExamProfile } from "@/types/app";

export const metadata = { title: `Sessions — ${siteConfig.name}` };

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

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
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}
