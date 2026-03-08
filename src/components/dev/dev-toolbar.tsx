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

interface DevToolbarProps {
  mode: "dev" | "live";
  currentTier: UserTier;
  effectiveTier: UserTier;
  flags: FeatureFlags;
}

type EnvironmentMode = "dev" | "free" | "pro" | "max";

const ENV_CONFIG: Record<EnvironmentMode, { label: string; color: string; desc: string }> = {
  dev:  { label: "Dev",  color: "bg-purple-500", desc: "No external services — mock data only" },
  free: { label: "Free", color: "bg-zinc-500",   desc: "Live services — Free tier experience" },
  pro:  { label: "Pro",  color: "bg-blue-500",   desc: "Live services — Pro tier experience" },
  max:  { label: "Max",  color: "bg-amber-500",  desc: "Live services — Max tier experience" },
};

export function DevToolbar({
  mode,
  currentTier,
  effectiveTier: initialEffective,
  flags: initialFlags,
}: DevToolbarProps) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [_effectiveTier, setEffectiveTier] = useState(initialEffective);
  const [flags, setFlags] = useState(initialFlags);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const isDevMode = mode === "dev";

  const currentEnv: EnvironmentMode = isDevMode
    ? "dev"
    : (flags.spoofedTier ?? currentTier) as EnvironmentMode;

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

  function switchEnv(env: EnvironmentMode) {
    if (isDevMode && env !== "dev") return;
    if (env === "dev") return;

    const spoofedTier = env as UserTier;
    const next: FeatureFlags = { ...flags, spoofedTier };
    setFlags(next);
    setEffectiveTier(spoofedTier);
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
      bypass3dGate: isDevMode,
      bypassAiGate: isDevMode,
      bypassSrsGate: isDevMode,
    });
    setEffectiveTier(isDevMode ? "max" : currentTier);
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

  const envConfig = ENV_CONFIG[currentEnv];

  return (
    <div className="fixed bottom-4 right-4 z-9999 select-none">
      {/* Collapsed pill */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
        >
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          {isDevMode ? (
            <WifiOff className="h-3 w-3 text-purple-500" />
          ) : (
            <Wifi className="h-3 w-3 text-emerald-500" />
          )}
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white ${envConfig.color}`}
          >
            {envConfig.label}
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
                Developer Panel
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

          {/* Environment switcher */}
          <div className="border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Environment
            </span>
            <div className="mt-1.5 grid grid-cols-4 gap-1">
              {(["dev", "free", "pro", "max"] as EnvironmentMode[]).map((env) => {
                const cfg = ENV_CONFIG[env];
                const isActive = currentEnv === env;
                const isDisabled = (isDevMode && env !== "dev") || (!isDevMode && env === "dev");

                return (
                  <button
                    key={env}
                    onClick={() => switchEnv(env)}
                    disabled={isDisabled}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all ${
                      isActive
                        ? `${cfg.color} text-white shadow-sm`
                        : isDisabled
                          ? "bg-muted/50 text-muted-foreground/30 cursor-not-allowed"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={cfg.desc}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {isDevMode ? (
                <span className="flex items-center gap-1">
                  <WifiOff className="h-2.5 w-2.5" />
                  No external services — all data is mocked
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Wifi className="h-2.5 w-2.5" />
                  Connected — viewing as {envConfig.label} tier
                </span>
              )}
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
