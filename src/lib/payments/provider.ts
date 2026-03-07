import type { UserTier } from "@/types/app";

export type PaymentProvider = "stripe" | "payrex";

export interface CreateCheckoutParams {
  userId: string;
  email: string;
  tier: "pro" | "max";
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string | null;
  id: string;
  provider: PaymentProvider;
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "payrex";
  if (provider === "stripe" && process.env.STRIPE_SECRET_KEY) return "stripe";
  return "payrex";
}

export async function createCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const provider = getPaymentProvider();

  if (provider === "stripe") {
    return createStripeCheckout(params);
  }
  return createPayRexCheckout(params);
}

async function createStripeCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { getStripe, STRIPE_PLANS } = await import("@/lib/stripe/config");
  const stripe = getStripe();

  const plan = STRIPE_PLANS[params.tier];
  const session = await stripe.checkout.sessions.create({
    customer_email: params.email,
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId, tier: params.tier },
  });

  return { url: session.url, id: session.id, provider: "stripe" };
}

async function createPayRexCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { getPayRex, PAYREX_PLANS } = await import("@/lib/payrex/config");
  const payrex = getPayRex();

  const plan = PAYREX_PLANS[params.tier];
  const paymentIntent = await payrex.paymentIntents.create({
    amount: plan.amount,
    currency: plan.currency,
    payment_methods: ["card", "gcash", "maya", "qrph"],
    description: plan.description,
    metadata: {
      user_id: params.userId,
      tier: params.tier,
      email: params.email,
    },
  });

  const checkoutUrl = (paymentIntent.attributes?.checkout_url as string) ?? null;

  return {
    url: checkoutUrl,
    id: paymentIntent.id,
    provider: "payrex",
  };
}

export function tierFromAmount(amountCents: number): UserTier {
  if (amountCents >= 99900) return "max";
  if (amountCents >= 49900) return "pro";
  return "free";
}
