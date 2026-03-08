import { redirect } from "next/navigation";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { getFeatureFlags, getConnectionState } from "@/lib/admin/feature-flags";
import { DevPanel } from "./dev-panel";

export const metadata = { title: "Developer Settings" };

export default async function DeveloperSettingsPage() {
  const profile = await getAdminAwareProfile();

  if (!profile || !profile.isAdmin) {
    redirect("/dashboard/settings");
  }

  const flags = await getFeatureFlags();
  const connectionState = getConnectionState();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Developer Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin-only panel. Simulate any combination of subscription tier and
          database connection state.
        </p>
      </div>

      <DevPanel
        currentTier={profile.tier}
        effectiveTier={profile.effectiveTier}
        connectionState={connectionState}
        flags={flags}
      />
    </div>
  );
}
