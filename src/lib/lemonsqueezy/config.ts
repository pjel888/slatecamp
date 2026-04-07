import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";

let _lemonsqueezy: any = null; // Typing based on @lemonsqueezy/lemonsqueezy.js if available

export function getLemonSqueezy() {
  if (!_lemonsqueezy) {
    // Note: Initialization varies for LemonSqueezy SDK
    _lemonsqueezy = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY!);
  }
  return _lemonsqueezy;
}

export const LEMONSQUEEZY_PLANS = {
  camp: {
    variantId: process.env.LEMONSQUEEZY_CAMP_VARIANT_ID ?? "",
    name: "Camp",
    amount: 499,
    currency: "php",
  },
  insurance: {
    variantId: process.env.LEMONSQUEEZY_INSURANCE_VARIANT_ID ?? "",
    name: "Insurance",
    amount: 1499,
    currency: "php",
  },
  institutional: {
    variantId: process.env.LEMONSQUEEZY_INSTITUTIONAL_VARIANT_ID ?? "",
    name: "Institutional",
    amount: 4999,
    currency: "php",
  },
} as const;
