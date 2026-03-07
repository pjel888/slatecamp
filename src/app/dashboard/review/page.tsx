import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags, hasTierAccess } from "@/lib/admin/feature-flags";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";

export const metadata = { title: "SRS Review" };

export default async function ReviewPage() {
  const profile = await getAdminAwareProfile();
  if (!profile) redirect("/login");

  const flags = await getFeatureFlags();
  const hasSrsAccess =
    flags.bypassSrsGate ||
    hasTierAccess("pro", profile.tier, profile.isAdmin, flags);

  if (!hasSrsAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Brain className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          Spaced Repetition Review
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          SRS Review uses the SM-2 algorithm to schedule questions at the optimal
          time for long-term retention. Upgrade to Pro to unlock this feature.
        </p>
        <Link href="/dashboard/settings/billing" className="mt-6">
          <Button>Upgrade to Pro</Button>
        </Link>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: dueItems, count } = await supabase
    .from("srs_queue")
    .select("id, question_id", { count: "exact" })
    .eq("user_id", profile.id)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at")
    .limit(30);

  const dueCount = count ?? 0;

  if (dueCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-signal-green)]/10">
          <Brain className="h-8 w-8 text-[var(--color-signal-green)]" strokeWidth={1.5} />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          All caught up!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No cards due for review right now. Try a practice quiz instead.
        </p>
        <Link href="/dashboard/quiz" className="mt-6">
          <Button>
            Practice Quiz <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // Create a review session and redirect to quiz
  const { data: session } = await supabase
    .from("test_sessions")
    .insert({
      user_id: profile.id,
      session_type: "review",
      total_questions: Math.min(dueCount, 30),
      difficulty_mode: "mixed",
    })
    .select("id")
    .single();

  if (session) {
    redirect(`/dashboard/quiz/${session.id}`);
  }

  return null;
}
