import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags, getEffectiveTier } from "@/lib/admin/feature-flags";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { DevToolbar } from "@/components/dev/dev-toolbar";
import { BreadcrumbProvider } from "@/lib/context/breadcrumb-context";
import { ExamProfileProvider } from "@/lib/context/exam-profile-context";
import type { UserTier } from "@/types/app";
import type { ExamProfile, Subject } from "@/types/app";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, tier, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;
  const currentTier = (profile?.tier ?? "free") as UserTier;
  const showDevTools = isDemo || isAdmin;

  const flags = showDevTools ? await getFeatureFlags() : null;
  const effectiveTier = flags
    ? getEffectiveTier(currentTier, true, flags)
    : currentTier;

  // Load exam profiles for the context provider
  const { data: examProfiles } = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const allProfiles = (examProfiles ?? []) as ExamProfile[];
  const activeProfile = allProfiles.find((p) => p.is_active) ?? allProfiles[0] ?? null;

  let subjects: Subject[] = [];
  if (activeProfile) {
    const { data: subs } = await supabase
      .from("subjects")
      .select("*")
      .eq("board_exam_id", activeProfile.board_exam_id)
      .order("sort_order");
    subjects = (subs ?? []) as Subject[];
  }

  return (
    <ExamProfileProvider
      initialProfile={activeProfile}
      initialProfiles={allProfiles}
      initialSubjects={subjects}
    >
      <div className="flex h-screen">
        <Sidebar
          isAdmin={isAdmin}
          userDisplay={{
            name: profile?.full_name ?? user.email ?? "User",
            avatarUrl: profile?.avatar_url ?? null,
          }}
          tier={isDemo ? "dev" : effectiveTier}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <BreadcrumbProvider>
            <Navbar isAdmin={isAdmin} />
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              <div className="mx-auto max-w-[1200px] p-4 lg:p-8">{children}</div>
            </main>
            <BottomNav />
          </BreadcrumbProvider>
        </div>
        {showDevTools && flags && (
          <DevToolbar
            mode={isDemo ? "dev" : "live"}
            currentTier={currentTier}
            effectiveTier={effectiveTier}
            flags={flags}
          />
        )}
      </div>
    </ExamProfileProvider>
  );
}
