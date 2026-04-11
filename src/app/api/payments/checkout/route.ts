import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout, isPaymentEnabled } from "@/lib/payments/provider";
import { isDemoMode } from "@/lib/demo/config";
import {
  logEntitlementAuditEvent,
  serializeOverrideState,
} from "@/lib/entitlements/audit";
import { getViewerEntitlements } from "@/lib/entitlements/get-viewer-entitlements";
import { ENTITLEMENT_FEATURE_KEYS } from "@/lib/entitlements/feature-keys";

const CHECKOUT_TIERS = ["pro", "prime", "institutional"] as const;
type CheckoutTier = (typeof CHECKOUT_TIERS)[number]
const isCheckoutTier = (value: unknown): value is CheckoutTier =>
  typeof value === "string" && CHECKOUT_TIERS.includes(value as CheckoutTier)

export async function POST(request: Request) {
  if (!isPaymentEnabled()) {
    return NextResponse.json({
      error: "Payments are currently disabled",
      code: "PAYMENTS_DISABLED",
    }, { status: 503 });
  }

  if (isDemoMode()) {
    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    return NextResponse.json({
      url: `${origin}/dashboard/settings/billing?success=true`,
      id: "demo-checkout",
      provider: "demo",
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await request.json();

  if (!isCheckoutTier(tier)) {
    return NextResponse.json(
      { error: "Unsupported checkout tier" },
      { status: 400 },
    );
  }

  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
  ])

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  try {
    const result = await createCheckout({
      userId: user.id,
      email: user.email!,
      tier,
      successUrl: `${origin}/dashboard/settings/billing?success=true`,
      cancelUrl: `${origin}/dashboard/settings/billing?cancelled=true`,
    });

    logEntitlementAuditEvent({
      eventName: 'entitlement.decision',
      timestamp: new Date().toISOString(),
      traceId: entitlements.traceId,
      userId: entitlements.userId,
      routeOrAction: 'api/payments/checkout',
      featureKey: ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
      normalizedRole: entitlements.normalizedRole,
      roleSource: entitlements.roleResolution.resolvedFrom,
      rawTier: entitlements.rawTier,
      subscriptionStatus: entitlements.subscriptionStatus,
      effectiveTier: entitlements.effectiveTier,
      overrideState: serializeOverrideState(entitlements.overrides),
      decision: true,
      decisionSource: `checkout:${tier}`,
      trace: [`checkout-tier:${tier}`],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
