import { redirect } from "next/navigation";
import { getAdminAwareProfile } from "@/lib/admin/get-admin-profile";
import { ROUTES } from "@/lib/constants/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { TIER_PRICES } from "@/lib/utils/constants";
import { UpgradeButton } from "./upgrade-button";

export const metadata = { title: "Billing" };

const PLAN_FEATURES = {
  free: [
    "50 questions/day",
    "Manual flashcards",
    "Basic analytics",
    "Community question decks (browse)",
  ],
  pro: [
    "Unlimited questions",
    "AI Spaced Repetition (SM-2)",
    "Custom Question Banks",
    "3D Interactivity",
    "Detailed analytics",
    "Marketplace access",
    "1,000 AI tokens/mo",
  ],
  max: [
    "Everything in Pro",
    "Socratic AI Tutor",
    "Predictive Score Modeling",
    "Voice Prep Mode",
    "IRT Adaptive Quizzes",
    "Unlimited AI tokens",
    "Saved Review Configurations",
  ],
};

const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash" },
  { id: "maya", label: "Maya" },
  { id: "card", label: "Credit / Debit Card" },
  { id: "qrph", label: "QR Ph" },
];

export default async function BillingPage() {
  const profile = await getAdminAwareProfile();
  if (!profile) redirect(ROUTES.LOGIN);

  const currentTier = profile.effectiveTier;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Plans & Billing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the plan that fits your review goals. Pay with GCash, Maya,
          credit card, or QR Ph.
        </p>
      </div>

      {/* Payment Methods */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Accepted:</span>
        {PAYMENT_METHODS.map((pm) => (
          <Badge key={pm.id} variant="secondary" className="text-[10px]">
            {pm.label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {(["free", "pro", "max"] as const).map((tier) => {
          const isCurrentPlan = currentTier === tier;
          const price =
            tier === "free"
              ? "₱0"
              : tier === "pro"
                ? TIER_PRICES.pro.label
                : TIER_PRICES.max.label;

          return (
            <Card
              key={tier}
              className={
                isCurrentPlan
                  ? "border-color-signal-amber ring-1 ring-color-signal-amber"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">{tier}</CardTitle>
                  {isCurrentPlan && <Badge>Current</Badge>}
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-semibold">{price}</span>
                  {tier !== "free" && (
                    <span className="text-sm text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {PLAN_FEATURES[tier].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-color-signal-green" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <UpgradeButton tier={tier} disabled />
                ) : tier === "free" ? (
                  <UpgradeButton tier={tier} disabled />
                ) : (
                  <UpgradeButton tier={tier} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
