import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants/routes";
import { ensureProfileAndExamProfile } from "@/lib/supabase/bootstrap";
import { getFeatureFlags, getEffectiveTier, getConnectionState } from "@/lib/admin/feature-flags";
import { isAdminByEmail } from "@/lib/admin/is-admin";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { DevToolbar } from "@/components/dev/dev-toolbar";
import { BreadcrumbProvider } from "@/lib/context/breadcrumb-context";
import { ExamProfileProvider } from "@/lib/context/exam-profile-context";
import { TierProvider } from "@/lib/context/tier-context";
import { ActiveSessionProvider } from "@/lib/context/active-session-context";
import type { UserTier } from "@/types/app";
import type { BoardExam, ExamProfile, Subject } from "@/types/app";

export const dynamic = "force-dynamic";

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

  if (!user) redirect(ROUTES.LOGIN);

  await ensureProfileAndExamProfile(
    user.id,
    user.email,
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as { is_admin?: boolean } | null)?.is_admin === true || isAdminByEmail(user.email ?? undefined);
  const currentTier = (profile?.tier ?? "free") as UserTier;
  const showDevTools = isDemo || isAdmin;

  const flags = showDevTools ? await getFeatureFlags() : null;
  const effectiveTier = flags
    ? getEffectiveTier(currentTier, true, flags)
    : currentTier;

  // Load exam profiles for the context provider
  let examProfilesData = await supabase
    .from("exam_profiles")
    .select("*, board_exams(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  let allProfiles = (examProfilesData.data ?? []) as ExamProfile[];

  if (allProfiles.length === 0) {
    const { data: refetched } = await supabase
      .from("exam_profiles")
      .select("*, board_exams(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    allProfiles = (refetched ?? []) as ExamProfile[];
  }

  const activeProfile = allProfiles.find((p) => p.is_active) ?? allProfiles[0] ?? null;

  // Load all board exams for the profile switcher
  const { data: boardExams } = await supabase
    .from("board_exams")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const allBoardExams = (boardExams ?? []) as BoardExam[];

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
    <TierProvider
      tier={currentTier}
      effectiveTier={effectiveTier}
      isDevMode={showDevTools}
    >
    <ExamProfileProvider
      initialProfile={activeProfile}
      initialProfiles={allProfiles}
      initialBoardExams={allBoardExams}
      initialSubjects={subjects}
    >
      <ActiveSessionProvider>
      <div className="flex h-screen">
        <Sidebar
          isAdmin={isAdmin}
          isDevMode={showDevTools}
          userDisplay={{
            name: profile?.full_name ?? user.email ?? "User",
            avatarUrl: profile?.avatar_url ?? null,
          }}
          tier={effectiveTier}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <BreadcrumbProvider>
            <Navbar isAdmin={isAdmin} />
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              <div className="h-full p-4 lg:p-8">{children}</div>
            </main>
            <BottomNav />
          </BreadcrumbProvider>
        </div>
        {showDevTools && flags != null && (
          <DevToolbar
            connectionState={getConnectionState()}
            currentTier={currentTier}
            effectiveTier={effectiveTier}
            flags={flags}
          />
        )}
      </div>
      </ActiveSessionProvider>
    </ExamProfileProvider>
    </TierProvider>
  );
}
