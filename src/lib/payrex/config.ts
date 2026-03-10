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
  pro: {
    amount: 49900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Pro — Monthly Subscription`,
  },
  max: {
    amount: 99900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Max — Monthly Subscription`,
  },
} as const;
