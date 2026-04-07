import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLemonSqueezy } from "@/lib/lemonsqueezy/config";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/constants/feature-flags";
import type { UserTier } from "@/types/app";

export async function POST(request: Request) {
  if (!FEATURE_PAYMENTS_ENABLED) {
    console.log('[WEBHOOK] LemonSqueezy webhook received but payments disabled');
    return NextResponse.json({
      received: true,
      status: 'disabled',
      timestamp: new Date().toISOString(),
    });
  }
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("x-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ls = getLemonSqueezy() as any;
  if (!ls) {
    return NextResponse.json({ error: "LemonSqueezy not configured" }, { status: 503 });
  }

  try {
    event = ls.webhooks.constructEvent(
      body,
      sig,
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Idempotency: skip already-processed events
  const eventId = String((event as any).id ?? `${event.type}-${Date.now()}`);
  const { data: alreadyProcessed } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('provider', 'lemonsqueezy')
    .eq('event_id', eventId)
    .maybeSingle();

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const VALID_TIERS: UserTier[] = ['free', 'pro', 'prime', 'institutional', 'enterprise']
      const rawTier = session.metadata?.tier as string | undefined
      const tier: UserTier = VALID_TIERS.includes(rawTier as UserTier)
        ? (rawTier as UserTier)
        : 'pro';

      const userId = session.metadata?.userId || "";

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          tier,
          lemon_squeezy_customer_id: customerId,
          lemon_squeezy_subscription_id: subscriptionId,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) console.error("Subscription update error:", error);

      // Funnel event: pro_subscribed
      if (userId) {
        await supabase.from("analytics_events").insert({
          user_id: userId,
          event_name: "pro_subscribed",
          event_properties: { plan: tier, lemon_squeezy_subscription_id: subscriptionId },
        }).then(() => {});
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      await supabase
        .from("user_subscriptions")
        .update({
          tier: "free" as UserTier,
          lemon_squeezy_subscription_id: null,
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq("lemon_squeezy_subscription_id", subscription.id);
      break;
    }
  }

  // Mark event as processed
  await supabase.from('processed_webhook_events').insert({
    provider: 'lemonsqueezy',
    event_id: eventId,
    event_type: event.type,
  });

  return NextResponse.json({ received: true });
}

