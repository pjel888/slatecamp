import { redirect } from "next/navigation";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags } from "@/lib/admin/feature-flags";
import { DevPanel } from "./dev-panel";

export const metadata = { title: "Developer Settings" };

export default async function DeveloperSettingsPage() {
  const profile = await getAdminAwareProfile();

  if (!profile || !profile.isAdmin) {
    redirect("/dashboard/settings");
  }

  const flags = await getFeatureFlags();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Developer Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin-only panel. Override feature flags and spoof subscription tiers
          for testing.
        </p>
      </div>

      <DevPanel
        currentTier={profile.tier}
        effectiveTier={profile.effectiveTier}
        flags={flags}
      />
    </div>
  );
}
