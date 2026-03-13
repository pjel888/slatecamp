import type PayRex from "payrex-node";
import { siteConfig } from "@/lib/constants/site";

let _payrex: ReturnType<typeof PayRex> | null = null;

export function getPayRex(): ReturnType<typeof PayRex> {
  if (!_payrex) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PayRexClient = require("payrex-node") as typeof PayRex;
    _payrex = PayRexClient(process.env.PAYREX_SECRET_KEY!);
  }
  return _payrex;
}

export const PAYREX_PAYMENT_METHODS = ["card", "gcash", "maya", "qrph"] as const;
export type PayRexPaymentMethod = (typeof PAYREX_PAYMENT_METHODS)[number];

export const PAYREX_PLANS = {
  camp: {
    amount: 49900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Camp — Monthly Subscription`,
  },
  insurance: {
    amount: 149900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Insurance — Monthly Subscription`,
  },
  institutional: {
    amount: 499900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Institutional — Monthly Subscription`,
  },
} as const;
