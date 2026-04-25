import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayRex } from "@/lib/payrex/config";
import { tierFromAmount } from "@/lib/payments/provider";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/constants/feature-flags";
import { logServerError, logServerEvent } from "@/lib/logging/server";
import type { UserTier } from "@/types/app";

type PayRexWebhookEvent = {
  id?: string;
  type: string;
  data: {
    resource: {
      id?: string;
      amount?: number;
      metadata?: Record<string, string>;
    };
  };
};

const BILLING_TIERS: readonly UserTier[] = ['free', 'pro', 'prime', 'institutional', 'enterprise'];
const isUserTier = (value: unknown): value is UserTier =>
  typeof value === 'string' && BILLING_TIERS.includes(value as UserTier);

export async function POST(request: Request) {
  if (!FEATURE_PAYMENTS_ENABLED) {
    console.log('[WEBHOOK] PayRex webhook received but payments disabled');
    return NextResponse.json({
      received: true,
      status: 'disabled',
      timestamp: new Date().toISOString(),
    });
  }
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("payrex-signature");

  if (!signature) {
    await logServerEvent({
      severity: 'warn',
      family: 'billing',
      eventName: 'payrex_missing_signature',
      message: 'PayRex webhook request missing signature header.',
      context: {
        routeOrAction: 'api:webhooks.payrex',
        provider: 'payrex',
      },
    });
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const payrex = getPayRex();
  if (!payrex) {
    return NextResponse.json({ error: "PayRex not configured" }, { status: 503 });
  }

  let event: PayRexWebhookEvent;
  try {
    event = await payrex.webhooks.parseEvent(
      body,
      signature,
      process.env.PAYREX_WEBHOOK_SECRET!
    ) as PayRexWebhookEvent;
  } catch {
    await logServerEvent({
      severity: 'warn',
      family: 'billing',
      eventName: 'payrex_invalid_signature',
      message: 'PayRex webhook signature validation failed.',
      context: {
        routeOrAction: 'api:webhooks.payrex',
        provider: 'payrex',
      },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Idempotency: skip already-processed events
  const eventId = String(event.id ?? `${event.type}-${Date.now()}`);
  const { data: alreadyProcessed } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('provider', 'payrex')
    .eq('event_id', eventId)
    .maybeSingle();

  if (alreadyProcessed) {
    await logServerEvent({
      severity: 'info',
      family: 'billing',
      eventName: 'payrex_event_replayed',
      message: 'PayRex webhook replay detected.',
      context: {
        routeOrAction: 'api:webhooks.payrex',
        provider: 'payrex',
        eventId,
        metadata: {
          eventType: event.type,
        },
      },
    });
    return NextResponse.json({ received: true, idempotent: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.resource;
    const metadata = paymentIntent.metadata ?? {};
    const userId = metadata.user_id;
    const amountCents = paymentIntent.amount ?? 0;
    const now = new Date().toISOString();

    const rawTier = metadata.tier ?? tierFromAmount(amountCents)
    const tier = isUserTier(rawTier) ? rawTier : 'pro';

    if (!userId) {
      await logServerEvent({
        severity: 'warn',
        family: 'billing',
        eventName: 'payrex_missing_user_id',
        message: 'PayRex payment succeeded without user_id metadata.',
        context: {
          routeOrAction: 'api:webhooks.payrex',
          provider: 'payrex',
          eventId,
          metadata: {
            eventType: event.type,
            amountCents,
          },
        },
      });
      return NextResponse.json({ error: "Missing user metadata" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: userId,
          tier,
          status: 'active',
          payrex_reference: String(paymentIntent.id ?? eventId),
          amount: Number.isFinite(amountCents) ? amountCents / 100 : null,
          updated_at: now,
        },
        { onConflict: 'user_id' },
      );

    if (updateError) {
      await logServerError({
        family: 'billing',
        eventName: 'payrex_subscription_upsert_failed',
        message: 'Failed to create or update user subscription from PayRex webhook.',
        context: {
          routeOrAction: 'api:webhooks.payrex',
          provider: 'payrex',
          eventId,
          userId,
          metadata: {
            eventType: event.type,
            tier,
            amountCents,
          },
        },
        error: updateError,
      });
      return NextResponse.json({ error: "Subscription update failed" }, { status: 500 });
    }
  }

  // Mark event as processed
  const { error: processedError } = await supabase.from('processed_webhook_events').insert({
    provider: 'payrex',
    event_id: eventId,
    event_type: event.type,
  });

  if (processedError) {
    await logServerError({
      family: 'billing',
      eventName: 'payrex_processed_event_insert_failed',
      message: 'Failed to mark PayRex webhook event as processed.',
      context: {
        routeOrAction: 'api:webhooks.payrex',
        provider: 'payrex',
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
