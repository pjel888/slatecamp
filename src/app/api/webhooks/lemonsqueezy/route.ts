import { NextResponse } from "next/server";
import { headers } from "next/headers";
import LemonSqueezy from "lemonsqueezy";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLemonSqueezy } from "@/lib/lemonsqueezy/config";
import type { UserTier } from "@/types/app";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("x-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: LemonSqueezy.Event;

  try {
    event = getLemonSqueezy().webhooks.constructEvent(
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
      const session = event.data.object as LemonSqueezy.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const VALID_TIERS: UserTier[] = ['free', 'camp', 'insurance', 'institutional']
      const rawTier = session.metadata?.tier as string | undefined
      const tier: UserTier = VALID_TIERS.includes(rawTier as UserTier)
        ? (rawTier as UserTier)
        : 'camp';

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
      const subscription = event.data.object as LemonSqueezy.Subscription;
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

