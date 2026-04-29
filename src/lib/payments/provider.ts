import type { UserTier } from "@/types/app";
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

export type PaymentProvider = "payrex";
export type PaymentUnavailableCode =
  | "PAYMENTS_DISABLED"
  | "PAYMENT_PROVIDER_UNSUPPORTED"
  | "PAYMENT_PROVIDER_UNAVAILABLE"
  | "PAYMENT_PLAN_UNAVAILABLE"
  | "PAYMENT_CHECKOUT_UNAVAILABLE";

export class PaymentUnavailableError extends Error {
  code: PaymentUnavailableCode;

  constructor(message: string, code: PaymentUnavailableCode = "PAYMENT_PROVIDER_UNAVAILABLE") {
    super(message);
    this.name = "PaymentUnavailableError";
    this.code = code;
  }
}

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
  const provider = (process.env.PAYMENT_PROVIDER ?? "payrex").toLowerCase();
  if (provider === "payrex") return provider;
  throw new PaymentUnavailableError(
    `Unsupported payment provider "${provider}".`,
    "PAYMENT_PROVIDER_UNSUPPORTED",
  );
}

/**
 * Check if payment features are available
 */
export const isPaymentEnabled = (): boolean => {
  return FEATURE_PAYMENTS_ENABLED;
}

export async function createCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  if (!FEATURE_PAYMENTS_ENABLED) {
    console.log('[PAYMENTS] createCheckout called but payments are disabled');
    throw new PaymentUnavailableError(
      "Payments are currently disabled.",
      "PAYMENTS_DISABLED",
    );
  }

  getPaymentProvider();

  return createPayRexCheckout(params);
}

async function createPayRexCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { getPayRex, PAYREX_PLANS } = await import("@/lib/payrex/config");
  const payrex = getPayRex();
  if (!payrex) {
    throw new PaymentUnavailableError(
      "PayRex is not configured.",
      "PAYMENT_PROVIDER_UNAVAILABLE",
    );
  }

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
  if (!checkoutUrl) {
    throw new PaymentUnavailableError(
      "PayRex did not return a checkout URL.",
      "PAYMENT_CHECKOUT_UNAVAILABLE",
    );
  }

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
