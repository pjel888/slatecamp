<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# payrex

## Purpose

PayRex payment gateway configuration for Philippine payment methods. Provides a singleton PayRex client, supported payment method types, and plan/pricing constants. Default payment provider for SlateCamp (Philippine market).

## Key Files

| File | Description |
|------|-------------|
| **config.ts** | `getPayRex()` -- singleton PayRex client factory (uses `require` for CommonJS compatibility). `PAYREX_PAYMENT_METHODS` -- supported methods: `card`, `gcash`, `maya`, `qrph`. `PAYREX_PLANS` -- plan definitions with amounts in centavos (camp: 49900, insurance: 149900, institutional: 499900). |

## For AI Agents

### Working In This Directory

1. **Singleton pattern.** `getPayRex()` creates one client per process. Do not create clients directly.
2. **Amounts in centavos.** PayRex uses centavo amounts (49900 = 499.00 PHP). LemonSqueezy uses peso amounts.
3. **CommonJS import.** PayRex SDK uses `require()` due to ESM/CJS compatibility. The eslint disable comment is intentional.
4. **Payment methods.** Philippine-specific: GCash, Maya, QRPH (QR-based), plus card.
5. **Do not import directly from components.** Access PayRex through `@/lib/payments/provider.ts`.

## Dependencies

### Internal

- `@/lib/constants/site` -- `siteConfig` for plan descriptions

### External

- `payrex-node` -- PayRex Node.js SDK
- Environment: `PAYREX_SECRET_KEY`
