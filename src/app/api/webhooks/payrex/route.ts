import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayRex } from "@/lib/payrex/config";
import { tierFromAmount } from "@/lib/payments/provider";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/constants/feature-flags";
import { logServerError, logServerEvent } from "@/lib/logging/server";

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

  let event;
  try {
    event = await payrex.webhooks.parseEvent(
      body,
      signature,
      process.env.PAYREX_WEBHOOK_SECRET!
    );
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
  const eventId = String((event as any).id ?? `${event.type}-${Date.now()}`);
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
    const paymentIntent = event.data.resource as Record<string, unknown>;
    const metadata = (paymentIntent.metadata ?? {}) as Record<string, string>;
    const userId = metadata.user_id;
    const amountCents = paymentIntent.amount as number;

    const VALID_TIERS = ['free', 'pro', 'prime', 'institutional', 'enterprise'] as const
    const rawTier = metadata.tier ?? tierFromAmount(amountCents)
    const tier = VALID_TIERS.includes(rawTier as any) ? rawTier : 'pro';

    if (userId) {
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          tier,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        await logServerError({
          family: 'billing',
          eventName: 'payrex_subscription_update_failed',
          message: 'Failed to update user subscription from PayRex webhook.',
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
      }
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
