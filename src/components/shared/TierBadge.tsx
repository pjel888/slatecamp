"use client";

import { Sparkles, Zap, Crown, FlaskConical } from "lucide-react";

export type DisplayTier = "free" | "pro" | "max" | "dev";

const TIER_CONFIG: Record<
  DisplayTier,
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
  dev: {
    label: "Dev",
    icon: FlaskConical,
    className:
      "bg-color-signal-amber/10 text-color-signal-amber border-color-signal-amber/30",
  },
};

interface TierBadgeProps {
  tier: DisplayTier;
  size?: "sm" | "default";
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  size = "default",
  showIcon = true,
  className,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
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
    </span>
  );
}
