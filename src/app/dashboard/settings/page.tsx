import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "./settings-form";
import { EmailPreferencesForm } from "./email-preferences-form";
import { LogoutCard } from "./logout-card";
import { ExamProfileSwitcher } from "@/components/shared/ExamProfileSwitcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import type { Profile } from "@/types/app";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await getAdminAwareProfile();
  if (!profile) redirect(ROUTES.LOGIN);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, preferences, and subscription.
        </p>
      </div>

      {/* Admin Banner */}
      {profile.isAdmin && (
        <Card className="border-color-signal-amber/30 bg-color-signal-amber/5">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-color-signal-amber" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Admin Account
                </p>
                <p className="text-xs text-muted-foreground">
                  Effective tier: <strong className="capitalize">{profile.effectiveTier}</strong>
                  {profile.effectiveTier !== profile.tier && (
                    <span> (DB: {profile.tier})</span>
                  )}
                </p>
              </div>
            </div>
            <Link href="/dashboard/settings/developer">
              <Button size="sm" variant="outline">
                Dev Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Subscription</CardTitle>
            <Badge className="capitalize">{profile.effectiveTier}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {profile.effectiveTier === "free" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for unlimited questions, SRS, and AI features.
                Pay with GCash, Maya, or credit card.
              </p>
              <Link href="/dashboard/settings/billing">
                <Button size="sm">Upgrade Plan</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You&apos;re on the{" "}
                <strong className="capitalize">{profile.effectiveTier}</strong> plan.
              </p>
              <Link href="/dashboard/settings/billing">
                <Button variant="outline" size="sm">
                  Manage Billing
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exam Profile</CardTitle>
          <p className="text-xs text-muted-foreground">
            Switch between your board exam profiles.
          </p>
        </CardHeader>
        <CardContent>
          <ExamProfileSwitcher />
        </CardContent>
      </Card>

      {/* Email preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email</CardTitle>
          <p className="text-xs text-muted-foreground">
            Control when we send you emails. You can unsubscribe from any email via the link in the message.
          </p>
        </CardHeader>
        <CardContent>
          <EmailPreferencesForm
            finalStretchDaily={
              (profile as { email_preferences?: { final_stretch_daily?: boolean } }).email_preferences
                ?.final_stretch_daily ?? true
            }
          />
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm profile={profile as unknown as Profile} />
        </CardContent>
      </Card>

      {/* Account / Log out */}
      <LogoutCard />
    </div>
  );
}
