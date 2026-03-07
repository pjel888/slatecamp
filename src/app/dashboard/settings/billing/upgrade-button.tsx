"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  tier: "free" | "pro" | "max";
  disabled?: boolean;
}

export function UpgradeButton({ tier, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (tier === "free" || disabled) return;
    setLoading(true);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // PayRex may not return a URL for all flows —
        // for PaymentIntent-based flows, the checkout is handled client-side
        console.error("No checkout URL returned:", data);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <Button variant="outline" className="w-full" disabled>
        {tier === "free" ? "Free Plan" : "Current Plan"}
      </Button>
    );
  }

  return (
    <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
      {loading ? "Redirecting..." : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
    </Button>
  );
}
