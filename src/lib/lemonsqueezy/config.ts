// import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";

// SDK not installed - stub for build compatibility
let _lemonsqueezy: any = null;

/**
 * @deprecated Payments disabled - returns null
 * Re-enable by: installing package, setting env vars, removing this stub
 */
export const getLemonSqueezy = (): null => {
  console.warn('[PAYMENTS] LemonSqueezy is disabled - getLemonSqueezy() called');
  return null;
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
