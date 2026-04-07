<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# payments

## Purpose

Payment provider abstraction layer. Routes checkout creation to either LemonSqueezy or PayRex based on the `PAYMENT_PROVIDER` environment variable. Defines the `PaymentProvider` type, `CreateCheckoutParams`, and `CheckoutResult` interfaces used across the billing system.

## Key Files

| File | Description |
|------|-------------|
| **provider.ts** | `getPaymentProvider()` -- resolves active provider (`"lemonsqueezy"` or `"payrex"`, defaults to `"payrex"`). `createCheckout(params)` -- creates a checkout session via the active provider. Dynamically imports `@/lib/lemonsqueezy/config` or `@/lib/payrex/config`. |

## For AI Agents

### Working In This Directory

1. **Provider resolution.** `getPaymentProvider()` checks `PAYMENT_PROVIDER` env var. Falls back to `"payrex"` if LemonSqueezy key is missing.
2. **Dynamic imports.** Provider configs are dynamically imported to avoid loading both SDKs.
3. **Tiers.** Three subscription tiers: `"camp"`, `"insurance"`, `"institutional"`.
4. **Adding a new provider:** Implement the same checkout interface (`CreateCheckoutParams` -> `CheckoutResult`), add a branch in `createCheckout()`, create config in `@/lib/{provider}/config.ts`.

### Common Patterns

**Creating a checkout:**
```typescript
import { createCheckout } from '@/lib/payments/provider'

const result = await createCheckout({
  userId: user.id,
  email: user.email,
  tier: 'camp',
  successUrl: `${baseUrl}/success`,
  cancelUrl: `${baseUrl}/pricing`,
})
// result.url -> redirect URL, result.provider -> 'lemonsqueezy' | 'payrex'
```

## Dependencies

### Internal

- `@/lib/lemonsqueezy/config` -- `getLemonSqueezy()`, `LEMONSQUEEZY_PLANS` (dynamic import)
- `@/lib/payrex/config` -- `getPayRex()`, `PAYREX_PLANS` (dynamic import)
- `@/types/app` -- `UserTier`

### External

- Environment: `PAYMENT_PROVIDER`, `LEMONSQUEEZY_API_KEY`

