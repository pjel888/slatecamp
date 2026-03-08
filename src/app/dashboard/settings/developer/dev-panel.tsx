"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  AlertTriangle,
  RotateCcw,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  Crown,
  Box,
  Brain,
  RefreshCcw,
  Check,
} from "lucide-react";
import type { UserTier } from "@/types/app";
import type { FeatureFlags } from "@/lib/admin/feature-flags";
import type { DevConnectionState, TierCapabilities } from "@/lib/dev/dev-mode";
import {
  TIER_CAPABILITIES,
  CONNECTION_BEHAVIORS,
} from "@/lib/dev/dev-mode";

interface Props {
  currentTier: UserTier;
  effectiveTier: UserTier;
  connectionState: DevConnectionState;
  flags: FeatureFlags;
}

const TIERS: { value: UserTier; label: string; icon: typeof Sparkles; color: string }[] = [
  { value: "free", label: "Free", icon: Sparkles, color: "bg-zinc-500" },
  { value: "pro", label: "Pro", icon: Zap, color: "bg-blue-500" },
  { value: "max", label: "Max", icon: Crown, color: "bg-amber-500" },
];

export function DevPanel({ currentTier, effectiveTier, connectionState, flags }: Props) {
  const [simulatedTier, setSimulatedTier] = useState<UserTier | null>(
    flags.simulatedTier ?? flags.spoofedTier ?? null
  );
  const [bypass3d, setBypass3d] = useState(flags.bypass3dGate);
  const [bypassAi, setBypassAi] = useState(flags.bypassAiGate);
  const [bypassSrs, setBypassSrs] = useState(flags.bypassSrsGate);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const isLocal = connectionState === "local";
  const activeTier = simulatedTier ?? effectiveTier;

  // Sync from server on prop change
  useEffect(() => {
    setSimulatedTier(flags.simulatedTier ?? flags.spoofedTier ?? null);
    setBypass3d(flags.bypass3dGate);
    setBypassAi(flags.bypassAiGate);
    setBypassSrs(flags.bypassSrsGate);
  }, [flags]);

  async function persistFlags(newFlags: Partial<FeatureFlags>) {
    setSaving(true);
    const merged: FeatureFlags = {
      simulatedTier: simulatedTier,
      spoofedTier: simulatedTier, // backward compat
      bypass3dGate: bypass3d,
      bypassAiGate: bypassAi,
      bypassSrsGate: bypassSrs,
      ...newFlags,
    };
    await fetch("/api/admin/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    setSaving(false);
    router.refresh();
  }

  function selectTier(tier: UserTier | null) {
    setSimulatedTier(tier);
    persistFlags({
      simulatedTier: tier,
      spoofedTier: tier, // backward compat
    });
  }

  function toggleGate(
    gate: "bypass3dGate" | "bypassAiGate" | "bypassSrsGate",
    setter: (v: boolean) => void,
    current: boolean
  ) {
    setter(!current);
    persistFlags({ [gate]: !current });
  }

  async function handleReset() {
    setSimulatedTier(null);
    setBypass3d(isLocal);
    setBypassAi(isLocal);
    setBypassSrs(isLocal);
    await fetch("/api/admin/flags", { method: "DELETE" });
    router.refresh();
  }

  const connBehavior = CONNECTION_BEHAVIORS[connectionState];
  const tierCaps = TIER_CAPABILITIES[activeTier];

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
              Developer Mode Active
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                {isLocal ? (
                  <WifiOff className="h-3 w-3" />
                ) : (
                  <Wifi className="h-3 w-3" />
                )}
                {connBehavior.label}
              </Badge>
              <div className="text-xs text-muted-foreground">
                DB Tier:{" "}
                <Badge variant="secondary" className="ml-1 capitalize">
                  {currentTier}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Effective:{" "}
                <Badge className="ml-1 capitalize">{activeTier}</Badge>
                {simulatedTier && (
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    (simulated)
                  </span>
                )}
              </div>
            </div>
            {saving && (
              <p className="text-[10px] text-muted-foreground animate-pulse">
                Saving flags...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection State (read-only — determined by environment) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(["local", "connected"] as DevConnectionState[]).map((state) => {
              const behavior = CONNECTION_BEHAVIORS[state];
              const isActive = connectionState === state;
              return (
                <div
                  key={state}
                  className={`relative rounded-lg border p-3 ${
                    isActive
                      ? "border-foreground/20 bg-muted/40"
                      : "border-border/50 opacity-40"
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-2 top-2">
                      <Check className="h-3.5 w-3.5 text-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {state === "local" ? (
                      <WifiOff className="h-4 w-4 text-purple-500" />
                    ) : (
                      <Wifi className="h-4 w-4 text-emerald-500" />
                    )}
                    <span className="text-sm font-medium">{behavior.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {behavior.description}
                  </p>
                  <div className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
                    <div>Data: {behavior.dataSource}</div>
                    <div>Auth: {behavior.authProvider}</div>
                    <div>Payments: {behavior.paymentsAvailable ? "yes" : "no"}</div>
                    <div>AI services: {behavior.aiServicesAvailable ? "yes" : "no"}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Connection state is determined by the <code className="text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> env
            variable. {isLocal ? "Unset — using mock data." : "Set — using live Supabase."}
          </p>
        </CardContent>
      </Card>

      {/* Tier Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tier Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {/* "None" option */}
            <button
              onClick={() => selectTier(null)}
              className={`rounded-lg border px-3 py-2 text-center transition-all ${
                simulatedTier === null
                  ? "border-foreground/20 bg-muted/60 shadow-sm"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <span className="block text-xs font-semibold">Default</span>
              <span className="text-[10px] text-muted-foreground">
                {isLocal ? "Max" : "DB tier"}
              </span>
            </button>
            {TIERS.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => selectTier(value)}
                className={`rounded-lg border px-3 py-2 text-center transition-all ${
                  simulatedTier === value
                    ? "border-foreground/20 bg-muted/60 shadow-sm"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <Icon className={`mx-auto h-4 w-4 ${
                  simulatedTier === value ? "text-foreground" : "text-muted-foreground"
                }`} strokeWidth={1.5} />
                <span className="mt-1 block text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>

          {/* Permissions Matrix for selected tier */}
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Capabilities for {activeTier.toUpperCase()} tier
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions/day</span>
                <span className="font-medium">
                  {tierCaps.questionsPerDay === Infinity ? "Unlimited" : tierCaps.questionsPerDay}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI tokens</span>
                <span className="font-medium">
                  {tierCaps.aiTokens === Infinity ? "Unlimited" : tierCaps.aiTokens === 0 ? "None" : tierCaps.aiTokens}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SRS</span>
                <CapBadge enabled={tierCaps.srsAccess || bypassSrs} bypassed={bypassSrs && !tierCaps.srsAccess} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">3D Lab</span>
                <CapBadge enabled={tierCaps.threeDLabAccess || bypass3d} bypassed={bypass3d && !tierCaps.threeDLabAccess} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Tutor</span>
                <CapBadge enabled={tierCaps.aiTutorAccess || bypassAi} bypassed={bypassAi && !tierCaps.aiTutorAccess} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saved configs</span>
                <span className="font-medium">
                  {tierCaps.savedConfigs === Infinity ? "Unlimited" : tierCaps.savedConfigs === 0 ? "None" : tierCaps.savedConfigs}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Gate Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Gate Overrides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">3D Lab Access</p>
              <p className="text-xs text-muted-foreground">
                Bypass Pro/Max gate for the 3D interactivity module
              </p>
            </div>
            <Switch
              checked={bypass3d}
              onCheckedChange={() => toggleGate("bypass3dGate", setBypass3d, bypass3d)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">AI Features</p>
              <p className="text-xs text-muted-foreground">
                Bypass gate for Socratic Tutor and AI question generation
              </p>
            </div>
            <Switch
              checked={bypassAi}
              onCheckedChange={() => toggleGate("bypassAiGate", setBypassAi, bypassAi)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">SRS Review</p>
              <p className="text-xs text-muted-foreground">
                Bypass Pro gate for spaced repetition review sessions
              </p>
            </div>
            <Switch
              checked={bypassSrs}
              onCheckedChange={() => toggleGate("bypassSrsGate", setBypassSrs, bypassSrs)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3x2 Matrix Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Matrix Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-1.5 pr-3 text-left font-medium text-muted-foreground">Feature</th>
                  <th className="px-2 py-1.5 text-center font-medium text-muted-foreground" colSpan={2}>
                    <div className="flex items-center justify-center gap-1">
                      <WifiOff className="h-3 w-3" /> Local
                    </div>
                  </th>
                  <th className="px-2 py-1.5 text-center font-medium text-muted-foreground" colSpan={2}>
                    <div className="flex items-center justify-center gap-1">
                      <Wifi className="h-3 w-3" /> Connected
                    </div>
                  </th>
                </tr>
                <tr className="border-b border-border/50">
                  <th />
                  <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">Data</th>
                  <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">Access</th>
                  <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">Data</th>
                  <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">Access</th>
                </tr>
              </thead>
              <tbody>
                {(["free", "pro", "max"] as UserTier[]).map((tier) => {
                  const caps = TIER_CAPABILITIES[tier];
                  return (
                    <tr key={tier} className="border-b border-border/30">
                      <td className="py-1.5 pr-3 font-medium capitalize">{tier}</td>
                      <td className="px-1 py-1.5 text-center text-muted-foreground">Mock</td>
                      <td className="px-1 py-1.5 text-center">
                        <MatrixCell caps={caps} />
                      </td>
                      <td className="px-1 py-1.5 text-center text-muted-foreground">Live</td>
                      <td className="px-1 py-1.5 text-center">
                        <MatrixCell caps={caps} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Access permissions are identical across connection states.
            Connection state only changes the data source (mock vs live).
          </p>
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
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset All
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function CapBadge({ enabled, bypassed }: { enabled: boolean; bypassed: boolean }) {
  if (bypassed) {
    return (
      <span className="rounded bg-color-signal-amber/15 px-1.5 py-0.5 text-[10px] font-medium text-color-signal-amber">
        Bypassed
      </span>
    );
  }
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
        enabled
          ? "bg-emerald-500/15 text-emerald-600"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {enabled ? "Yes" : "No"}
    </span>
  );
}

function MatrixCell({ caps }: { caps: TierCapabilities }) {
  const features = [
    caps.srsAccess && "SRS",
    caps.threeDLabAccess && "3D",
    caps.aiTutorAccess && "AI",
  ].filter(Boolean);

  if (features.length === 0) return <span className="text-muted-foreground">Basic</span>;
  if (features.length === 3) return <span className="text-emerald-600">Full</span>;
  return <span>{features.join(", ")}</span>;
}
