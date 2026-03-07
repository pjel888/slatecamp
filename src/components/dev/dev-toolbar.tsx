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
  Shield,
  Box,
  Brain,
  RefreshCcw,
} from "lucide-react";
import type { UserTier } from "@/types/app";
import type { FeatureFlags } from "@/lib/admin/feature-flags";

interface DevToolbarProps {
  mode: "demo" | "live";
  currentTier: UserTier;
  effectiveTier: UserTier;
  flags: FeatureFlags;
}

const TIER_COLORS: Record<UserTier, string> = {
  free: "bg-zinc-500",
  pro: "bg-blue-500",
  max: "bg-amber-500",
};

const TIER_LABELS: Record<UserTier, string> = {
  free: "Free",
  pro: "Pro",
  max: "Max",
};

export function DevToolbar({
  mode,
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

  function switchTier(tier: UserTier | "auto") {
    const spoofedTier = tier === "auto" ? null : tier;
    const next: FeatureFlags = { ...flags, spoofedTier };
    setFlags(next);
    setEffectiveTier(tier === "auto" ? "max" : tier);
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
      spoofedTier: null,
      bypass3dGate: mode === "demo",
      bypassAiGate: mode === "demo",
      bypassSrsGate: mode === "demo",
    });
    setEffectiveTier(mode === "demo" ? "max" : currentTier);
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

  return (
    <div className="fixed bottom-4 right-4 z-9999 select-none">
      {/* Collapsed pill */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
        >
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white ${
              mode === "demo" ? "bg-purple-500" : "bg-emerald-500"
            }`}
          >
            {mode}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white ${TIER_COLORS[effectiveTier]}`}
          >
            {TIER_LABELS[effectiveTier]}
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
                Dev Toolbar
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

          {/* Mode indicator */}
          <div className="border-b border-border px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Mode
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white ${
                  mode === "demo" ? "bg-purple-500" : "bg-emerald-500"
                }`}
              >
                {mode === "demo" ? "Demo (No Services)" : "Live (Services Connected)"}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {mode === "demo"
                ? "Running with mock data. Set NEXT_PUBLIC_SUPABASE_URL to switch to live."
                : "Connected to real services. DB tier: " + currentTier + "."}
            </p>
          </div>

          {/* Tier switcher */}
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Effective Tier
            </span>
            <div className="mt-1.5 flex gap-1">
              {(["free", "pro", "max"] as UserTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => switchTier(tier)}
                  className={`flex-1 rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition-all ${
                    effectiveTier === tier && flags.spoofedTier === tier
                      ? `${TIER_COLORS[tier]} text-white shadow-sm`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tier}
                </button>
              ))}
              <button
                onClick={() => switchTier("auto")}
                className={`flex-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
                  !flags.spoofedTier
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                title="Admin default (Max access)"
              >
                Auto
              </button>
            </div>
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
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
