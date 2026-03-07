import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags, getEffectiveTier } from "@/lib/admin/feature-flags";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { BottomNav } from "@/components/shared/BottomNav";
import { DevToolbar } from "@/components/dev/dev-toolbar";
import type { UserTier } from "@/types/app";

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
    .select("is_admin, tier")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;
  const currentTier = (profile?.tier ?? "free") as UserTier;
  const showDevTools = isDemo || isAdmin;

  const flags = showDevTools ? await getFeatureFlags() : null;
  const effectiveTier = flags
    ? getEffectiveTier(currentTier, true, flags)
    : currentTier;

  return (
    <div className="flex h-screen">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar isAdmin={isAdmin} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-[1200px] p-4 lg:p-8">{children}</div>
        </main>
        <BottomNav />
      </div>
      {showDevTools && flags && (
        <DevToolbar
          mode={isDemo ? "demo" : "live"}
          currentTier={currentTier}
          effectiveTier={effectiveTier}
          flags={flags}
        />
      )}
    </div>
  );
}
