"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertTriangle, RotateCcw } from "lucide-react";
import type { UserTier } from "@/types/app";
import type { FeatureFlags } from "@/lib/admin/feature-flags";

interface Props {
  currentTier: UserTier;
  effectiveTier: UserTier;
  flags: FeatureFlags;
}

export function DevPanel({ currentTier, effectiveTier, flags }: Props) {
  const [spoofedTier, setSpoofedTier] = useState<string>(
    flags.spoofedTier ?? "none"
  );
  const [bypass3d, setBypass3d] = useState(flags.bypass3dGate);
  const [bypassAi, setBypassAi] = useState(flags.bypassAiGate);
  const [bypassSrs, setBypassSrs] = useState(flags.bypassSrsGate);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);

    const newFlags: FeatureFlags = {
      spoofedTier: spoofedTier === "none" ? null : (spoofedTier as UserTier),
      bypass3dGate: bypass3d,
      bypassAiGate: bypassAi,
      bypassSrsGate: bypassSrs,
    };

    // Set cookie via API to avoid client-side cookie issues with httpOnly
    await fetch("/api/admin/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFlags),
    });

    setSaving(false);
    router.refresh();
  }

  async function handleReset() {
    setSpoofedTier("none");
    setBypass3d(false);
    setBypassAi(false);
    setBypassSrs(false);

    await fetch("/api/admin/flags", {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-color-signal-amber/30 bg-color-signal-amber/5">
        <CardContent className="flex items-start gap-4 pt-6">
          <Shield
            className="mt-0.5 h-5 w-5 shrink-0 text-color-signal-amber"
            strokeWidth={1.5}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Admin Mode Active
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="text-xs text-muted-foreground">
                Database Tier:{" "}
                <Badge variant="secondary" className="ml-1 capitalize">
                  {currentTier}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Effective Tier:{" "}
                <Badge className="ml-1 capitalize">{effectiveTier}</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              As an admin, you have Max-tier access by default. Use the controls
              below to test specific tier experiences.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tier Spoofing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tier Spoofing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Simulated Plan</Label>
            <Select
              value={spoofedTier}
              onValueChange={(v) => setSpoofedTier(v ?? "none")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Admin default = Max)</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="max">Max</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Override the tier used for all feature gates. &quot;None&quot; gives you
              full Max access as admin.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Gate Overrides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                3D Lab Access
              </p>
              <p className="text-xs text-muted-foreground">
                Bypass Pro/Max gate for the 3D interactivity module
              </p>
            </div>
            <Switch checked={bypass3d} onCheckedChange={setBypass3d} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                AI Features
              </p>
              <p className="text-xs text-muted-foreground">
                Bypass gate for Socratic Tutor and AI question generation
              </p>
            </div>
            <Switch checked={bypassAi} onCheckedChange={setBypassAi} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                SRS Review
              </p>
              <p className="text-xs text-muted-foreground">
                Bypass Pro gate for spaced repetition review sessions
              </p>
            </div>
            <Switch checked={bypassSrs} onCheckedChange={setBypassSrs} />
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
        />
        <p className="text-xs text-muted-foreground">
          These flags are stored in a session cookie and only affect your
          browser. They do not modify your database record or affect other
          users.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Apply Flags"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset All
        </Button>
      </div>
    </div>
  );
}
