import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayRex } from "@/lib/payrex/config";
import { tierFromAmount } from "@/lib/payments/provider";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("payrex-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const payrex = getPayRex();

  let event;
  try {
    event = await payrex.webhooks.parseEvent(
      body,
      signature,
      process.env.PAYREX_WEBHOOK_SECRET!
    );
  } catch {
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
      await supabase
        .from("user_subscriptions")
        .update({
          tier,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }
  }

  // Mark event as processed
  await supabase.from('processed_webhook_events').insert({
    provider: 'payrex',
    event_id: eventId,
    event_type: event.type,
  });

  return NextResponse.json({ received: true });
}
