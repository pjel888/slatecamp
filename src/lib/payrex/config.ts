import { siteConfig } from "@/lib/constants/site";
import type { PayRexClient } from "@/types/payrex";

/**
 * PayRex is intentionally deferred for the payment-free launch.
 *
 * The previous runtime used the payrex-node SDK, which pulled a vulnerable axios
 * version into the production dependency graph. Until paid checkout is re-enabled
 * and the SDK is re-vetted, this adapter fails closed and payment routes return
 * the existing provider-unavailable response.
 */
export const getPayRex = (): PayRexClient | null => {
  if (process.env.PAYREX_SECRET_KEY) {
    console.warn('[PAYMENTS] PayRex SDK is deferred and not bundled for this launch');
  }

  return null;
}

export const PAYREX_PAYMENT_METHODS = ["card", "gcash", "maya", "qrph"] as const;
export type PayRexPaymentMethod = (typeof PAYREX_PAYMENT_METHODS)[number];

export const PAYREX_PLANS = {
  pro: {
    amount: 49900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Pro — Monthly Subscription`,
  },
  prime: {
    amount: 149900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Prime — Monthly Subscription`,
  },
  institutional: {
    amount: 499900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Institutional — Monthly Subscription`,
  },
} as const;
