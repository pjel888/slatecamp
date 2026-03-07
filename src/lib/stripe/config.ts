import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    name: "Pro",
    amount: 499,
    currency: "php",
  },
  max: {
    priceId: process.env.STRIPE_MAX_PRICE_ID ?? "",
    name: "Max",
    amount: 999,
    currency: "php",
  },
} as const;
