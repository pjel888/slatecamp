"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Zap,
  Box,
  Brain,
  RefreshCcw,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { UserTier } from "@/types/app";
import type { FeatureFlags } from "@/lib/admin/feature-flags";
import type { DevConnectionState } from "@/lib/dev/dev-mode";

interface DevToolbarProps {
  connectionState: DevConnectionState;
  currentTier: UserTier;
  effectiveTier: UserTier;
  flags: FeatureFlags;
}

const TIER_CONFIG: Record<UserTier, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-zinc-500" },
  pro:  { label: "Pro",  color: "bg-blue-500" },
  max:  { label: "Max",  color: "bg-amber-500" },
};

const CONN_CONFIG: Record<DevConnectionState, { label: string; color: string; icon: typeof Wifi }> = {
  local:     { label: "Local",     color: "text-purple-500", icon: WifiOff },
  connected: { label: "Connected", color: "text-emerald-500", icon: Wifi },
};

export function DevToolbar({
  connectionState,
  currentTier,
  effectiveTier: initialEffective,
  flags: initialFlags,
}: DevToolbarProps) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [effectiveTier, setEffectiveTier] = useState(initialEffective);
  const [flags, setFlags] = useState(initialFlags);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const isLocal = connectionState === "local";

  useEffect(() => {
    setEffectiveTier(initialEffective);
    setFlags(initialFlags);
  }, [initialEffective, initialFlags]);

  const persist = useCallback(
    async (newFlags: FeatureFlags) => {
      setSaving(true);
      try {
        await fetch("/api/admin/flags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newFlags),
        });
        router.refresh();
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  function switchTier(tier: UserTier) {
    const next: FeatureFlags = {
      ...flags,
      simulatedTier: tier,
      spoofedTier: tier, // backward compat
    };
    setFlags(next);
    setEffectiveTier(tier);
    persist(next);
  }

  function toggleGate(gate: "bypass3dGate" | "bypassAiGate" | "bypassSrsGate") {
    const next: FeatureFlags = { ...flags, [gate]: !flags[gate] };
    setFlags(next);
    persist(next);
  }

  async function resetAll() {
    await fetch("/api/admin/flags", { method: "DELETE" });
    setFlags({
      simulatedTier: null,
      bypass3dGate: isLocal,
      bypassAiGate: isLocal,
      bypassSrsGate: isLocal,
    });
    setEffectiveTier(isLocal ? "max" : currentTier);
    router.refresh();
  }

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-4 right-4 z-9999 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-muted"
        title="Show dev toolbar"
      >
        <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    );
  }

  const tierConfig = TIER_CONFIG[effectiveTier];
  const connConfig = CONN_CONFIG[connectionState];
  const ConnIcon = connConfig.icon;

  return (
    <div className="fixed bottom-4 right-4 z-9999 select-none">
      {/* Collapsed pill */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
        >
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          <ConnIcon className={`h-3 w-3 ${connConfig.color}`} />
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white ${tierConfig.color}`}
          >
            {tierConfig.label}
          </span>
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="w-72 overflow-hidden rounded-xl border border-border bg-background/95 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                Developer Mode
              </span>
              {saving && (
                <span className="text-[10px] text-muted-foreground animate-pulse">
                  saving...
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Collapse"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setHidden(true);
                }}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Hide toolbar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Connection State (read-only) */}
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Connection
            </span>
            <p className="mt-1 flex items-center gap-1.5 text-[11px]">
              <ConnIcon className={`h-3 w-3 ${connConfig.color}`} />
              <span className="font-medium">{connConfig.label}</span>
              <span className="text-muted-foreground">
                — {isLocal ? "mock data" : "live Supabase"}
              </span>
            </p>
          </div>

          {/* Tier Switcher */}
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Tier
            </span>
            <div className="mt-1.5 grid grid-cols-3 gap-1">
              {(["free", "pro", "max"] as UserTier[]).map((tier) => {
                const cfg = TIER_CONFIG[tier];
                const isActive = effectiveTier === tier;

                return (
                  <button
                    key={tier}
                    onClick={() => switchTier(tier)}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
                      isActive
                        ? `${cfg.color} text-white shadow-sm`
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={`Simulate ${cfg.label} tier`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {flags.simulatedTier
                ? `Simulating ${effectiveTier} (DB: ${currentTier})`
                : `Using ${isLocal ? "default (max)" : `DB tier (${currentTier})`}`}
            </p>
          </div>

          {/* Feature gates */}
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Feature Gates
            </span>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {([
                { key: "bypass3dGate" as const, label: "3D Lab", icon: Box },
                { key: "bypassAiGate" as const, label: "AI Features", icon: Brain },
                { key: "bypassSrsGate" as const, label: "SRS Review", icon: Zap },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleGate(key)}
                  className="flex items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    {label}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      flags[key] ? "bg-emerald-500" : "bg-zinc-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-3 py-2">
            <button
              onClick={resetAll}
              className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RefreshCcw className="h-3 w-3" />
              Reset
            </button>
            <a
              href="/dashboard/settings/developer"
              className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Full settings
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
