import type PayRex from "payrex-node";

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
    description: "Cerebro Pro — Monthly Subscription",
  },
  max: {
    amount: 99900,
    currency: "PHP" as const,
    description: "Cerebro Max — Monthly Subscription",
  },
} as const;
