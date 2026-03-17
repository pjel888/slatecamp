"use client";

import Link from "next/link";
import { Lock, Sparkle } from "@phosphor-icons/react";
import { SCIcon } from "@/components/graphics/icons/Icon";
import { Button } from "@/components/ui/button";
import { useTier } from "@/lib/context/tier-context";
import type { UserTier } from "@/types/app";

// ---------------------------------------------------------------------------
// Upgrade labels per required tier
// ---------------------------------------------------------------------------

const UPGRADE_LABEL: Record<UserTier, string> = {
  free: "Sign Up",
  camp: "Upgrade to Camp",
  insurance: "Upgrade to Insurance",
  institutional: "Upgrade to Institutional",
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
        <SCIcon icon={Lock} size="xl" className="text-muted-foreground" />
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
            <SCIcon icon={Sparkle} size="xs" />
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
        <SCIcon icon={Lock} size="lg" className="text-muted-foreground" />
        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          Requires {tierLabel}
        </p>
        <Link href="/dashboard/settings/billing" className="mt-2 pointer-events-auto">
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]">
            <SCIcon icon={Sparkle} size="xs" />
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
 * Renders a small "CAMP" / "INSURANCE" / "INSTITUTIONAL" badge + lock icon
 * when the user doesn't have access. Renders nothing if they do.
 */
export function TierLockedBadge({ requiredTier, className }: TierLockedBadgeProps) {
  const { hasAccess } = useTier();

  if (hasAccess(requiredTier)) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground ${className ?? ""}`}
    >
      <SCIcon icon={Lock} size="xs" />
      {requiredTier.toUpperCase()}
    </span>
  );
}
