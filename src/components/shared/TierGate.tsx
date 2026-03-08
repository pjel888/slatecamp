"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTier } from "@/lib/context/tier-context";
import type { UserTier } from "@/types/app";

// ---------------------------------------------------------------------------
// Upgrade labels per required tier
// ---------------------------------------------------------------------------

const UPGRADE_LABEL: Record<UserTier, string> = {
  free: "Sign Up",
  pro: "Upgrade to Pro",
  max: "Upgrade to Max",
};

// ---------------------------------------------------------------------------
// TierGate — wraps children with a locked overlay when tier is insufficient
// ---------------------------------------------------------------------------

interface TierGateProps {
  /** The minimum tier required to access this feature. */
  requiredTier: UserTier;
  children: React.ReactNode;
  /**
   * Render style when locked:
   * - "overlay" (default): dims children and overlays a lock + upgrade CTA
   * - "replace": hides children entirely, shows a centered lock message
   * - "disable": renders children but disables pointer events + reduced opacity
   */
  variant?: "overlay" | "replace" | "disable";
  /** Optional label for the locked state (e.g. "SRS Review"). */
  featureLabel?: string;
}

export function TierGate({
  requiredTier,
  children,
  variant = "overlay",
  featureLabel,
}: TierGateProps) {
  const { hasAccess } = useTier();

  if (hasAccess(requiredTier)) {
    return <>{children}</>;
  }

  const label = UPGRADE_LABEL[requiredTier];
  const tierLabel = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);

  // --- "disable" variant: muted children, no interaction ---
  if (variant === "disable") {
    return (
      <div className="pointer-events-none opacity-50 select-none">
        {children}
      </div>
    );
  }

  // --- "replace" variant: children hidden, full locked state ---
  if (variant === "replace") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Lock className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        {featureLabel && (
          <h3 className="mt-3 text-base font-semibold text-foreground">
            {featureLabel}
          </h3>
        )}
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Requires a {tierLabel} plan.
        </p>
        <Link href="/dashboard/settings/billing" className="mt-4">
          <Button size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            {label}
          </Button>
        </Link>
      </div>
    );
  }

  // --- "overlay" variant (default): children visible but locked ---
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Lock className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          Requires {tierLabel}
        </p>
        <Link href="/dashboard/settings/billing" className="mt-2 pointer-events-auto">
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
            {label}
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TierBadgeInline — small inline badge for tier-gated items in lists
// ---------------------------------------------------------------------------

interface TierLockedBadgeProps {
  requiredTier: UserTier;
  className?: string;
}

/**
 * Renders a small "PRO" / "MAX" badge + lock icon when the user doesn't
 * have access. Renders nothing if they do.
 */
export function TierLockedBadge({ requiredTier, className }: TierLockedBadgeProps) {
  const { hasAccess } = useTier();

  if (hasAccess(requiredTier)) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ${className ?? ""}`}
    >
      <Lock className="h-2.5 w-2.5" />
      {requiredTier.toUpperCase()}
    </span>
  );
}
