import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLemonSqueezy } from "@/lib/lemonsqueezy/config";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/constants/feature-flags";
import type { UserTier } from "@/types/app";
import { logServerError, logServerEvent } from "@/lib/logging/server";

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
    await logServerEvent({
      severity: 'warn',
      family: 'billing',
      eventName: 'lemonsqueezy_missing_signature',
      message: 'LemonSqueezy webhook request missing signature header.',
      context: {
        routeOrAction: 'api:webhooks.lemonsqueezy',
        provider: 'lemonsqueezy',
      },
    });
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: any;

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
    await logServerEvent({
      severity: 'warn',
      family: 'billing',
      eventName: 'lemonsqueezy_invalid_signature',
      message: 'LemonSqueezy webhook signature validation failed.',
      context: {
        routeOrAction: 'api:webhooks.lemonsqueezy',
        provider: 'lemonsqueezy',
      },
    });
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
    await logServerEvent({
      severity: 'info',
      family: 'billing',
      eventName: 'lemonsqueezy_event_replayed',
      message: 'LemonSqueezy webhook replay detected.',
      context: {
        routeOrAction: 'api:webhooks.lemonsqueezy',
        provider: 'lemonsqueezy',
        eventId,
        metadata: {
          eventType: event.type,
        },
      },
    });
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

      if (error) {
        await logServerError({
          family: 'billing',
          eventName: 'lemonsqueezy_subscription_update_failed',
          message: 'Failed to update user subscription from LemonSqueezy webhook.',
          context: {
            routeOrAction: 'api:webhooks.lemonsqueezy',
            provider: 'lemonsqueezy',
            eventId,
            userId: userId || null,
            metadata: {
              eventType: event.type,
              subscriptionId,
              customerId,
              tier,
            },
          },
          error,
        });
      }

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
  const { error: processedError } = await supabase.from('processed_webhook_events').insert({
    provider: 'lemonsqueezy',
    event_id: eventId,
    event_type: event.type,
  });

  if (processedError) {
    await logServerError({
      family: 'billing',
      eventName: 'lemonsqueezy_processed_event_insert_failed',
      message: 'Failed to mark LemonSqueezy webhook event as processed.',
      context: {
        routeOrAction: 'api:webhooks.lemonsqueezy',
        provider: 'lemonsqueezy',
        eventId,
        metadata: {
          eventType: event.type,
        },
      },
      error: processedError,
    });
  }

  return NextResponse.json({ received: true });
}
