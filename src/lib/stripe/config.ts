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
  camp: {
    priceId: process.env.STRIPE_CAMP_PRICE_ID ?? "",
    name: "Camp",
    amount: 499,
    currency: "php",
  },
  insurance: {
    priceId: process.env.STRIPE_INSURANCE_PRICE_ID ?? "",
    name: "Insurance",
    amount: 1499,
    currency: "php",
  },
  institutional: {
    priceId: process.env.STRIPE_INSTITUTIONAL_PRICE_ID ?? "",
    name: "Institutional",
    amount: 4999,
    currency: "php",
  },
} as const;
