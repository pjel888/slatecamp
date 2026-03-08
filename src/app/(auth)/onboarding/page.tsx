import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./onboarding-wizard";
import type { BoardExam } from "@/types/app";

export const metadata = { title: "Welcome to Cerebro" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) redirect("/dashboard");

  const { data: boardExams } = await supabase
    .from("board_exams")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <OnboardingWizard
          userId={user.id}
          boardExams={(boardExams ?? []) as BoardExam[]}
        />
      </div>
    </div>
  );
}
