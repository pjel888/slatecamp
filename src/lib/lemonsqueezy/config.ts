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
  pro: {
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID ?? "",
    name: "Pro",
    amount: 499,
    currency: "php",
  },
  prime: {
    variantId: process.env.LEMONSQUEEZY_PRIME_VARIANT_ID ?? "",
    name: "Prime",
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
