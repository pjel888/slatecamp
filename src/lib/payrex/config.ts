import type PayRex from "payrex-node";
import { siteConfig } from "@/lib/constants/site";

let _payrex: ReturnType<typeof PayRex> | null = null;

/**
 * Returns PayRex client only if SDK is available and key is set.
 * Returns null if payment is disabled.
 */
export const getPayRex = (): ReturnType<typeof PayRex> | null => {
  if (!process.env.PAYREX_SECRET_KEY) {
    console.warn('[PAYMENTS] PAYREX_SECRET_KEY not set - PayRex disabled');
    return null;
  }

  if (_payrex) return _payrex;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PayRexClient = require("payrex-node") as typeof PayRex;
    _payrex = PayRexClient(process.env.PAYREX_SECRET_KEY!);
    return _payrex;
  } catch (error) {
    console.warn('[PAYMENTS] PayRex SDK not available:', error);
    return null;
  }
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
