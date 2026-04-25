import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLemonSqueezy } from "@/lib/lemonsqueezy/config";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/constants/feature-flags";
import type { UserTier } from "@/types/app";
import { logServerError, logServerEvent } from "@/lib/logging/server";

type LemonSqueezyCheckoutSession = {
  customer?: string;
  subscription?: string;
  metadata?: {
    tier?: string;
    userId?: string;
  };
};

type LemonSqueezySubscription = {
  id: string;
};

type LemonSqueezyWebhookEvent = {
  id?: string;
  type: string;
  data: {
    object: LemonSqueezyCheckoutSession | LemonSqueezySubscription;
  };
};

type LemonSqueezyWebhookClient = {
  webhooks: {
    constructEvent(body: string, signature: string, secret: string): LemonSqueezyWebhookEvent;
  };
};

const BILLING_TIERS: readonly UserTier[] = ['free', 'pro', 'prime', 'institutional', 'enterprise'];
const isUserTier = (value: unknown): value is UserTier =>
  typeof value === 'string' && BILLING_TIERS.includes(value as UserTier);

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

  let event: LemonSqueezyWebhookEvent;

  const ls = getLemonSqueezy() as LemonSqueezyWebhookClient | null;
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
  const eventId = String(event.id ?? `${event.type}-${Date.now()}`);
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
      const session = event.data.object as LemonSqueezyCheckoutSession;
      const customerId = session.customer ?? "";
      const subscriptionId = session.subscription ?? "";

      const rawTier = session.metadata?.tier as string | undefined
      const tier: UserTier = isUserTier(rawTier) ? rawTier : 'pro';

      const userId = session.metadata?.userId || "";
      const now = new Date().toISOString();

      if (!userId) {
        await logServerEvent({
          severity: 'warn',
          family: 'billing',
          eventName: 'lemonsqueezy_missing_user_id',
          message: 'LemonSqueezy checkout completed without userId metadata.',
          context: {
            routeOrAction: 'api:webhooks.lemonsqueezy',
            provider: 'lemonsqueezy',
            eventId,
            metadata: {
              eventType: event.type,
              subscriptionId,
              customerId,
            },
          },
        });
        return NextResponse.json({ error: "Missing user metadata" }, { status: 400 });
      }

      const { error } = await supabase
        .from("user_subscriptions")
        .upsert(
          {
            user_id: userId,
            tier,
            lemonsqueezy_customer_id: customerId,
            lemonsqueezy_subscription_id: subscriptionId,
            status: 'active',
            updated_at: now,
          },
          { onConflict: 'user_id' },
        );

      if (error) {
        await logServerError({
          family: 'billing',
          eventName: 'lemonsqueezy_subscription_upsert_failed',
          message: 'Failed to create or update user subscription from LemonSqueezy webhook.',
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
        return NextResponse.json({ error: "Subscription update failed" }, { status: 500 });
      }

      // Funnel event: pro_subscribed
      if (userId) {
        await supabase.from("analytics_events").insert({
          user_id: userId,
          event_name: "pro_subscribed",
          event_properties: { plan: tier, lemonsqueezy_subscription_id: subscriptionId },
        }).then(() => {});
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as LemonSqueezySubscription;
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          tier: "free" as UserTier,
          lemonsqueezy_subscription_id: null,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("lemonsqueezy_subscription_id", subscription.id);

      if (error) {
        await logServerError({
          family: 'billing',
          eventName: 'lemonsqueezy_subscription_cancel_failed',
          message: 'Failed to cancel user subscription from LemonSqueezy webhook.',
          context: {
            routeOrAction: 'api:webhooks.lemonsqueezy',
            provider: 'lemonsqueezy',
            eventId,
            metadata: {
              eventType: event.type,
              subscriptionId: subscription.id,
            },
          },
          error,
        });
        return NextResponse.json({ error: "Subscription cancellation failed" }, { status: 500 });
      }
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
