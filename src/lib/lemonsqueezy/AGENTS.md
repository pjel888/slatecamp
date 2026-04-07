<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# lemonsqueezy

## Purpose

LemonSqueezy payment gateway configuration. Provides a singleton LemonSqueezy client and plan/pricing constants. Used by `@/lib/payments/provider.ts` when the active payment provider is LemonSqueezy.

## Key Files

| File | Description |
|------|-------------|
| **config.ts** | `getLemonSqueezy()` -- singleton LemonSqueezy client factory (API version `2026-02-25.clover`). `LEMONSQUEEZY_PLANS` -- plan definitions for `camp` (499 PHP), `insurance` (1499 PHP), `institutional` (4999 PHP) with price IDs from env vars. |

## For AI Agents

### Working In This Directory

1. **Singleton pattern.** `getLemonSqueezy()` creates one LemonSqueezy instance per process. Do not create clients directly.
2. **Price IDs from env.** Each plan's `priceId` comes from `LEMONSQUEEZY_CAMP_PRICE_ID`, `LEMONSQUEEZY_INSURANCE_PRICE_ID`, `LEMONSQUEEZY_INSTITUTIONAL_PRICE_ID`.
3. **Currency is PHP.** All amounts are in Philippine Peso.
4. **Do not import directly from components.** Access LemonSqueezy through `@/lib/payments/provider.ts`.

## Dependencies

### Internal

- None (leaf module)

### External

- `lemonsqueezy` -- LemonSqueezy Node.js SDK
- Environment: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_CAMP_PRICE_ID`, `LEMONSQUEEZY_INSURANCE_PRICE_ID`, `LEMONSQUEEZY_INSTITUTIONAL_PRICE_ID`

