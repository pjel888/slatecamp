import type { UserTier } from "@/types/app";

export type PaymentProvider = "lemonsqueezy" | "payrex";

export interface CreateCheckoutParams {
  userId: string;
  email: string;
  tier: "pro" | "prime" | "institutional";
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
  if (provider === "lemonsqueezy" && process.env.LEMONSQUEEZY_API_KEY) return "lemonsqueezy";
  return "payrex";
}

export async function createCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const provider = getPaymentProvider();

  if (provider === "lemonsqueezy") {
    return createLemonSqueezyCheckout(params);
  }
  return createPayRexCheckout(params);
}

async function createLemonSqueezyCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { getLemonSqueezy, LEMONSQUEEZY_PLANS } = await import("@/lib/lemonsqueezy/config");
  const ls = getLemonSqueezy();

  const plan = LEMONSQUEEZY_PLANS[params.tier];
  
  // Note: LemonSqueezy checkout creation differs from LemonSqueezy
  // This is a placeholder for actual LS checkout implementation
  const checkout = await ls.createCheckout({
    variantId: plan.variantId,
    attributes: {
      user_email: params.email,
      custom_data: { userId: params.userId, tier: params.tier },
      checkout_data: {
        email: params.email,
      },
    },
  });

  return { url: checkout.url, id: checkout.id, provider: "lemonsqueezy" };
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
  if (amountCents >= 499900) return "institutional";
  if (amountCents >= 149900) return "prime";
  if (amountCents >= 49900) return "pro";
  return "free";
}
