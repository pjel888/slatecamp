<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# stripe

## Purpose

Stripe payment gateway configuration. Provides a singleton Stripe client and plan/pricing constants. Used by `@/lib/payments/provider.ts` when the active payment provider is Stripe.

## Key Files

| File | Description |
|------|-------------|
| **config.ts** | `getStripe()` -- singleton Stripe client factory (API version `2026-02-25.clover`). `STRIPE_PLANS` -- plan definitions for `camp` (499 PHP), `insurance` (1499 PHP), `institutional` (4999 PHP) with price IDs from env vars. |

## For AI Agents

### Working In This Directory

1. **Singleton pattern.** `getStripe()` creates one Stripe instance per process. Do not create clients directly.
2. **Price IDs from env.** Each plan's `priceId` comes from `STRIPE_CAMP_PRICE_ID`, `STRIPE_INSURANCE_PRICE_ID`, `STRIPE_INSTITUTIONAL_PRICE_ID`.
3. **Currency is PHP.** All amounts are in Philippine Peso.
4. **Do not import directly from components.** Access Stripe through `@/lib/payments/provider.ts`.

## Dependencies

### Internal

- None (leaf module)

### External

- `stripe` -- Stripe Node.js SDK
- Environment: `STRIPE_SECRET_KEY`, `STRIPE_CAMP_PRICE_ID`, `STRIPE_INSURANCE_PRICE_ID`, `STRIPE_INSTITUTIONAL_PRICE_ID`
