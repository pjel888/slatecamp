import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/config";
import type { UserTier } from "@/types/app";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const tier: UserTier =
        (session.metadata?.tier as UserTier) ?? "camp";

      const userId = session.metadata?.userId || "";

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
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
          event_properties: { plan: tier, stripe_subscription_id: subscriptionId },
        }).then(() => {});
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("user_subscriptions")
        .update({
          tier: "free" as UserTier,
          stripe_subscription_id: null,
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
