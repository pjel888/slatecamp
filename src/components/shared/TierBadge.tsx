"use client";

import { Sparkles, Zap, Crown } from "lucide-react";
import type { UserTier } from "@/types/app";

const TIER_CONFIG: Record<
  UserTier,
  { label: string; icon: React.ElementType; className: string }
> = {
  free: {
    label: "Free",
    icon: Sparkles,
    className:
      "bg-muted/60 text-muted-foreground border-border/60",
  },
  pro: {
    label: "Pro",
    icon: Zap,
    className:
      "bg-color-signal-blue/10 text-color-signal-blue border-color-signal-blue/30",
  },
  max: {
    label: "Max",
    icon: Crown,
    className:
      "bg-color-result-gold/10 text-color-result-gold border-color-result-gold/30",
  },
};

/** @deprecated Use `UserTier` with `devMode` prop instead. */
export type DisplayTier = UserTier | "dev";

interface TierBadgeProps {
  tier: DisplayTier;
  /** When true, appends an asterisk to indicate dev/simulated mode. */
  devMode?: boolean;
  size?: "sm" | "default";
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  devMode = false,
  size = "default",
  showIcon = true,
  className,
}: TierBadgeProps) {
  // If legacy "dev" value is passed, treat as "max" in dev mode
  const resolvedTier: UserTier = tier === "dev" ? "max" : tier;
  const isDevMode = devMode || tier === "dev";

  const config = TIER_CONFIG[resolvedTier];
  const Icon = config.icon;
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border font-medium ${config.className} ${
        isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } ${className ?? ""}`}
    >
      {showIcon && <Icon className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={1.5} />}
      {config.label}
      {isDevMode && "*"}
    </span>
  );
}
