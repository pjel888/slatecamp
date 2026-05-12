# Payment Gateway Decoupling Plan (Payrex & LemonSqueezy)

**Status:** PLAN REFINED - COMPREHENSIVE IMPLEMENTATION GUIDE
**Date:** 2026-04-07
**Objective:** Systematically disable, comment out, or bypass all Payrex and LemonSqueezy integrations to enable "Free Mode" operation without payment APIs.

---

## EXECUTIVE SUMMARY

**Current State:**
- Build fails due to missing `@lemonsqueezy/lemonsqueezy.js` package
- Both payment providers have empty API keys in `.env.local`
- All users should have full access without payment barriers

**Target State:**
- Application builds successfully without payment SDKs
- All features accessible to all users (no paywall)
- Clean separation for future re-enablement

**Scope:** 28 files across 6 categories, executed in 5 phases

---

## PHASE 0: PRE-FLIGHT CHECKLIST

Before starting, verify:

- [ ] Current `bun run build` fails with the expected error
- [ ] Database is accessible (`bunx supabase status`)
- [ ] No pending payment webhooks in queue
- [ ] Current user tier distribution (should be mostly 'free')
- [ ] Backup of `.env.local` exists

**Verification Command:**
```bash
bun run build 2>&1 | grep -E "(lemonsqueezy|payrex|module not found)"
```

---

## PHASE 1: BUILD FIX (Critical Path)

### 1.1 Stub LemonSqueezy SDK - `src/lib/lemonsqueezy/config.ts`

**Current (broken):**
```typescript
import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";

let _lemonsqueezy: any = null;

export function getLemonSqueezy() {
  if (!_lemonsqueezy) {
    _lemonsqueezy = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY!);
  }
  return _lemonsqueezy;
}
```

**Replace with:**
```typescript
// import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";

// SDK not installed - stub for build compatibility
let _lemonsqueezy: any = null;

/**
 * @deprecated Payments disabled - returns null
 * Re-enable by: installing package, setting env vars, removing this stub
 */
export function getLemonSqueezy(): null {
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
```

### 1.2 Guard PayRex SDK - `src/lib/payrex/config.ts`

**Current:**
```typescript
import type PayRex from "payrex-node";
import { siteConfig } from "@/lib/constants/site";

let _payrex: ReturnType<typeof PayRex> | null = null;

export function getPayRex(): ReturnType<typeof PayRex> {
  if (!_payrex) {
    const PayRexClient = require("payrex-node") as typeof PayRex;
    _payrex = PayRexClient(process.env.PAYREX_SECRET_KEY!);
  }
  return _payrex;
}
```

**Replace with:**
```typescript
import type PayRex from "payrex-node";
import { siteConfig } from "@/lib/constants/site";

let _payrex: ReturnType<typeof PayRex> | null = null;

/**
 * Returns PayRex client only if SDK is available and key is set.
 * Returns null if payment is disabled.
 */
export function getPayRex(): ReturnType<typeof PayRex> | null {
  if (!process.env.PAYREX_SECRET_KEY) {
    console.warn('[PAYMENTS] PAYREX_SECRET_KEY not set - PayRex disabled');
    return null;
  }

  if (_payrex) return _payrex;

  try {
    const PayRexClient = require("payrex-node") as typeof PayRex;
    _payrex = PayRexClient(process.env.PAYREX_SECRET_KEY!);
    return _payrex;
  } catch (error) {
    console.warn('[PAYMENTS] PayRex SDK not available:', error);
    return null;
  }
}

export const PAYREX_PAYMENT_METHODS = ["card", "gcash", "maya", "qrph"] as const;
export type PayRexPaymentMethod = (typeof PAYREX_PAYMENT_METHODS)[number];

export const PAYREX_PLANS = {
  pro: {
    amount: 49900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Pro — Monthly Subscription`,
  },
  prime: {
    amount: 149900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Prime — Monthly Subscription`,
  },
  institutional: {
    amount: 499900,
    currency: "PHP" as const,
    description: `${siteConfig.name} Institutional — Monthly Subscription`,
  },
} as const;
```

### 1.3 Verify Phase 1

```bash
bun run build 2>&1 | grep -E "(Error|error|lemonsqueezy|payrex)" | head -20
```

**Expected:** No lemonsqueezy/payrex errors in output

---

## PHASE 2: RUNTIME DISABLE

### 2.1 Create Feature Flag - `src/lib/constants/feature-flags.ts` (NEW FILE)

```typescript
/**
 * Feature flags for SlateCamp
 * Use process.env.NEXT_PUBLIC_* for client-accessible flags
 */

/**
 * Payment gateway functionality
 * - false (default): All payment features disabled, users get full free access
 * - true: Payment gateways active, normal tiered access
 */
export const FEATURE_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

/**
 * Debug: Log payment-related operations
 */
export const DEBUG_PAYMENTS = process.env.NEXT_PUBLIC_DEBUG_PAYMENTS === 'true';

if (FEATURE_PAYMENTS_ENABLED) {
  console.log('[PAYMENTS] Payment features ENABLED');
} else {
  console.log('[PAYMENTS] Payment features DISABLED - Free Mode');
}
```

### 2.2 Update Payment Provider - `src/lib/payments/provider.ts`

**Current function to modify:**
```typescript
export async function createCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const provider = getPaymentProvider();

  if (provider === "lemonsqueezy") {
    return createLemonSqueezyCheckout(params);
  }
  return createPayRexCheckout(params);
}
```

**Replace with:**
```typescript
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

/**
 * Returns mock checkout result when payments are disabled.
 * This ensures the UI doesn't break while waiting for backend response.
 */
function getDisabledCheckoutResult(): CheckoutResult {
  return {
    url: null,
    id: 'payments-disabled',
    provider: 'none',
  };
}

export async function createCheckout(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  // If payments disabled, return mock result
  if (!FEATURE_PAYMENTS_ENABLED) {
    console.log('[PAYMENTS] createCheckout called but payments are disabled');
    return getDisabledCheckoutResult();
  }

  const provider = getPaymentProvider();

  if (provider === "lemonsqueezy") {
    return createLemonSqueezyCheckout(params);
  }
  return createPayRexCheckout(params);
}

/**
 * Check if payment features are available
 */
export function isPaymentEnabled(): boolean {
  return FEATURE_PAYMENTS_ENABLED;
}
```

### 2.3 Disable Checkout API - `src/app/api/payments/checkout/route.ts`

**Add at top of POST function (after auth check):**
```typescript
import { isPaymentEnabled } from '@/lib/payments/provider';

export async function POST(request: Request) {
  // Existing demo mode check
  if (isDemoMode()) {
    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    return NextResponse.json({
      url: `${origin}/dashboard/settings/billing?success=true`,
      id: "demo-checkout",
      provider: "demo",
    });
  }

  // NEW: Check if payments are disabled
  if (!isPaymentEnabled()) {
    return NextResponse.json({
      error: "Payments are currently disabled",
      code: "PAYMENTS_DISABLED",
    }, { status: 503 });
  }

  // ... rest of existing code
}
```

### 2.4 Disable Webhook Routes

#### `src/app/api/webhooks/lemonsqueezy/route.ts`

**Add at start of POST:**
```typescript
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

export async function POST(request: Request) {
  // Early return if payments disabled - prevents any DB writes
  if (!FEATURE_PAYMENTS_ENABLED) {
    console.log('[WEBHOOK] LemonSqueezy webhook received but payments disabled');
    return NextResponse.json({
      received: true,
      status: 'disabled',
      timestamp: new Date().toISOString(),
    });
  }

  // ... rest of existing webhook handling
}
```

#### `src/app/api/webhooks/payrex/route.ts`

**Same pattern:**
```typescript
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

export async function POST(request: Request) {
  if (!FEATURE_PAYMENTS_ENABLED) {
    console.log('[WEBHOOK] PayRex webhook received but payments disabled');
    return NextResponse.json({
      received: true,
      status: 'disabled',
      timestamp: new Date().toISOString(),
    });
  }

  // ... rest of existing webhook handling
}
```

### 2.5 Verify Phase 2

```bash
# Check that checkout API returns disabled response
curl -X POST http://localhost:3000/api/payments/checkout \
  -H "Content-Type: application/json" \
  -d '{"tier":"pro"}' 2>/dev/null | jq .

# Should return: { "error": "Payments are currently disabled", "code": "PAYMENTS_DISABLED" }

# Check webhooks return disabled
curl -X POST http://localhost:3000/api/webhooks/lemonsqueezy \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null | jq .

# Should return: { "received": true, "status": "disabled" }
```

---

## PHASE 3: PAYWALL LIBERATION

### 3.1 Modify Paywall Access - `src/lib/paywall/check-access.ts`

**Current logic checks subscription tier for feature access. Modify to bypass:**

```typescript
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

// Existing PAID_TIERS array...

export const checkFeatureAccess = async (featureKey: FeatureKey): Promise<AccessResult> => {
  // NEW: If payments disabled, allow all features
  if (!FEATURE_PAYMENTS_ENABLED) {
    const supabase = await createClient();
    const { data: { user } } = await getUser();
    const userTier: UserTier = user ? 'free' : 'free';

    return {
      allowed: true,
      userTier,
      requiredTier: [],
      reason: undefined,
    };
  }

  // ... existing tier-based logic
};

export const isPaidUser = async (): Promise<boolean> => {
  // NEW: If payments disabled, always return false (everyone gets free access)
  if (!FEATURE_PAYMENTS_ENABLED) {
    return false;
  }

  // ... existing paid tier check
};

export const getUserTier = async (): Promise<UserTier> => {
  // NEW: If payments disabled, return 'free'
  if (!FEATURE_PAYMENTS_ENABLED) {
    return 'free';
  }

  // ... existing tier logic
};
```

### 3.2 Handle Daily Cap - `src/lib/paywall/daily-cap.ts`

**Two options:**

**Option A (Recommended): Remove cap entirely when payments disabled**
```typescript
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

export const checkDailyCap = async (userId: string): Promise<DailyCapResult> => {
  // If payments disabled, no cap
  if (!FEATURE_PAYMENTS_ENABLED) {
    return {
      allowed: true,
      remaining: 999999,
      resetAt: null,
    };
  }

  // ... existing cap logic
};
```

**Option B: Keep but set to very high**
```typescript
const FREE_DAILY_LIMIT = FEATURE_PAYMENTS_ENABLED ? 20 : 999999;
```

### 3.3 Handle Score Reveal - `src/lib/paywall/score-reveal.ts`

```typescript
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

export const checkScoreRevealAccess = async (userId: string): Promise<ScoreRevealResult> => {
  // If payments disabled, always allow score reveal
  if (!FEATURE_PAYMENTS_ENABLED) {
    return { allowed: true, hasRevealed: false };
  }

  // ... existing logic
};
```

### 3.4 Handle Subscription Getter - `src/lib/subscription/get-tier.ts`

```typescript
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags';

export const getUserTier = cache(async (): Promise<UserTier> => {
  // If payments disabled, return 'free'
  if (!FEATURE_PAYMENTS_ENABLED) {
    return 'free';
  }

  // ... existing database lookup
});
```

### 3.5 Verify Phase 3

- [ ] Access dashboard without login restrictions
- [ ] Complete 25+ questions without hitting cap
- [ ] View readiness score without restrictions
- [ ] Access all 3D Lab modules
- [ ] All paywall-gated features work

---

## PHASE 4: UI UPDATES

### 4.1 Pricing Page - `src/app/pricing/pricing-content.tsx`

**Add conditional rendering:**
```typescript
import { isPaymentEnabled } from '@/lib/payments/provider';

export function PricingContent() {
  const paymentsEnabled = isPaymentEnabled();

  // Track view regardless of payment status
  useEffect(() => {
    trackEvent({ event_name: 'upgrade_page_viewed' });
  }, []);

  if (!paymentsEnabled) {
    return <FreeAccessMessage />;
  }

  return <PricingTabs />;
}

function FreeAccessMessage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Free Access</h1>
      <p className="text-xl text-muted-foreground mb-8">
        All features are currently available for free.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
```

### 4.2 Welcome Pro Page - `src/app/dashboard/welcome-pro/page.tsx`

**Current uses `isPaidUser()`. With payments disabled, this always returns false, which is correct for display logic.**

Verify the page still renders correctly - no changes needed if paywall logic is updated.

### 4.3 Upgrade Page - `src/app/dashboard/upgrade/page.tsx`

**Option A: Redirect to dashboard**
```typescript
import { isPaymentEnabled } from '@/lib/payments/provider';

export default function UpgradePage() {
  if (!isPaymentEnabled()) {
    redirect('/dashboard');
  }
  // ... rest of page
}
```

**Option B: Show informational message**

Either approach ensures users aren't stuck on a non-functional upgrade flow.

### 4.4 Settings/Billing Page - Check for any payment-specific UI

Search for billing-related components that might need disabling:
```bash
grep -r "billing\|subscription\|upgrade\|checkout" src/app/dashboard/settings/ --include="*.tsx"
```

Update any found to show "Coming Soon" or redirect.

---

## PHASE 5: VERIFICATION & DOCUMENTATION

### 5.1 Build Verification

```bash
# Clean build
bun run clean && bun run build

# Expected: SUCCESS with no payment-related errors
```

### 5.2 Runtime Verification Checklist

| Feature | Test | Expected Result |
|---------|------|-----------------|
| Dashboard Load | Visit `/dashboard` | Loads without errors |
| Quiz/Drills | Complete 30 questions | No cap reached |
| Score Reveal | Visit `/dashboard/score-reveal` | Shows score immediately |
| 3D Lab | Access all modules | All modules accessible |
| Wiki | Full access | No restrictions |
| Analytics | View all charts | Full data visible |
| Settings | Visit `/dashboard/settings` | No payment errors |
| API Checkout | POST `/api/payments/checkout` | Returns disabled error |
| Webhook LS | POST `/api/webhooks/lemonsqueezy` | Returns disabled |
| Webhook PX | POST `/api/webhooks/payrex` | Returns disabled |

### 5.3 Update Documentation

#### Developer Portal - `src/app/developer/architecture/page.tsx`

Add disabled status indicator:

```typescript
// In components table
{
  component: 'Payments',
  pkg: 'lemonsqueezy + payrex-node',
  version: '20.4.1 / 1.7.3',
  notes: FEATURE_PAYMENTS_ENABLED ? '' : 'DISABLED'
},

// In environment variables section, add:
/*
# Payment Feature Flag
NEXT_PUBLIC_PAYMENTS_ENABLED=true  # Set to enable payment features
*/
```

#### API Reference - `src/app/developer/api-reference/page.tsx`

Mark checkout/webhook endpoints with status:

```typescript
// Add to checkout endpoint
badges: isPaymentEnabled() ? ['Active'] : ['Disabled'],
status: isPaymentEnabled() ? 'active' : 'disabled',
```

### 5.4 State Files Update

Update `.ai/state/current-task.md`:
```markdown
CURRENT DOMAIN: Payment Gateway Decoupling
STATUS: COMPLETE

COMPLETED:
- Phase 1: Build fixes (lemonsqueezy/payrex SDK stubs)
- Phase 2: Runtime disable (feature flag, API guards)
- Phase 3: Paywall liberation (all features free)
- Phase 4: UI updates (pricing, upgrade pages)
- Phase 5: Verification (build + runtime tests)

NEXT ACTION: None - payments disabled, free mode active
```

Update `.ai/state/memory.md`:
```markdown
### Session 2026-04-07: Payment Gateway Decoupling Complete
- Build fixed: stubbed lemonsqueezy SDK, guarded payrex SDK
- Feature flag: FEATURE_PAYMENTS_ENABLED controls all payment logic
- Paywall disabled: all users get full free access
- UI updated: pricing shows free message, upgrade redirects
- Verified: build passes, all features accessible
- Re-enablement documented in payment_decoupling_plan.md
```

---

## RE-ENABLEMENT GUIDE

### Quick Re-enable (30 minutes)

1. **Install packages:**
   ```bash
   bun add @lemonsqueezy/lemonsqueezy.js payrex-node
   ```

2. **Update `.env.local`:**
   ```bash
   # Enable payments
   NEXT_PUBLIC_PAYMENTS_ENABLED=true

   # PayRex (primary)
   PAYREX_SECRET_KEY=sk_live_xxx
   PAYREX_WEBHOOK_SECRET=whsec_xxx

   # LemonSqueezy (optional/backup)
   LEMONSQUEEZY_API_KEY=xxx
   LEMONSQUEEZY_WEBHOOK_SECRET=xxx
   ```

3. **Undo code changes:**
   - Restore `src/lib/lemonsqueezy/config.ts` (uncomment import, remove stub)
   - Remove null-check guard from `src/lib/payrex/config.ts`
   - Remove `if (!FEATURE_PAYMENTS_ENABLED)` guards from:
     - `src/lib/payments/provider.ts`
     - `src/app/api/payments/checkout/route.ts`
     - `src/app/api/webhooks/*/route.ts`
     - `src/lib/paywall/*`
   - Restore pricing page UI

4. **Verify:**
   ```bash
   bun run build
   curl -X POST http://localhost:3000/api/payments/checkout \
     -H "Content-Type: application/json" \
     -d '{"tier":"pro"}' | jq .url
   # Should return actual checkout URL
   ```

5. **Deploy:**
   ```bash
   git add -A && git commit -m "feat: re-enable payment gateways"
   git push
   ```

---

## ROLLBACK PROCEDURE

If something breaks:

1. **Quick fix (immediate):**
   ```bash
   # Disable payments via env
   echo "NEXT_PUBLIC_PAYMENTS_ENABLED=false" >> .env.local
   ```

2. **Revert code:**
   ```bash
   git checkout -- src/
   ```

3. **Database fix (if needed):**
   ```sql
   -- If users got wrong tiers, reset to free
   UPDATE user_subscriptions SET tier = 'free' WHERE tier != 'free';
   ```

---

## DEPENDENCY GRAPH

```
Phase 1 (Build)
├── src/lib/lemonsqueezy/config.ts
└── src/lib/payrex/config.ts

Phase 2 (Runtime)
├── Requires: Phase 1
├── src/lib/constants/feature-flags.ts (NEW)
├── src/lib/payments/provider.ts
├── src/app/api/payments/checkout/route.ts
├── src/app/api/webhooks/lemonsqueezy/route.ts
└── src/app/api/webhooks/payrex/route.ts

Phase 3 (Paywall)
├── Requires: Phase 2
├── src/lib/paywall/check-access.ts
├── src/lib/paywall/daily-cap.ts
├── src/lib/paywall/score-reveal.ts
└── src/lib/subscription/get-tier.ts

Phase 4 (UI)
├── Requires: Phase 2
├── src/app/pricing/pricing-content.tsx
├── src/app/dashboard/upgrade/page.tsx
└── Check: settings, welcome-pro

Phase 5 (Verify)
├── Requires: All above
└── Run full test suite
```

---

## RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users can't access paid features | Low | High | All features now free, no paid tier |
| Build still fails | Low | High | Comprehensive stubs in Phase 1 |
| Webhooks corrupt data | Low | High | Early return prevents writes |
| UI broken on pricing page | Medium | Low | Feature flag guard handles this |
| CEO analytics broken | Medium | Low | MRR calc still works (shows 0) |
| TypeScript errors remain | Low | Medium | Stub functions typed correctly |
| DB migration needed | Low | Low | No schema changes required |

---

## FILES SUMMARY

| Phase | Files | Type |
|-------|-------|------|
| 1 | 2 | Modify (stub) |
| 2 | 5 | Modify (guard) + 1 new |
| 3 | 4 | Modify (bypass) |
| 4 | 3+ | Modify (UI) |
| 5 | 2+ | Documentation |
| **Total** | **~17** | |

---

## INTEGRATION AUDIT - COMPLETE REFERENCE

### Core Payment Files (6)
- `src/lib/lemonsqueezy/config.ts` - LemonSqueezy client + plans
- `src/lib/payrex/config.ts` - PayRex client + plans
- `src/lib/payments/provider.ts` - Provider abstraction
- `src/app/api/webhooks/lemonsqueezy/route.ts` - LS webhook handler
- `src/app/api/webhooks/payrex/route.ts` - PayRex webhook handler
- `src/app/api/payments/checkout/route.ts` - Checkout creation

### Paywall/Access Control (5)
- `src/lib/paywall/check-access.ts` - Feature gating
- `src/lib/paywall/daily-cap.ts` - Daily cap (20 Q/day)
- `src/lib/paywall/score-reveal.ts` - Score reveal limit
- `src/lib/paywall/index.ts` - Barrel exports
- `src/lib/subscription/get-tier.ts` - Tier getter

### Consumer Files (5)
- `src/app/dashboard/welcome-pro/page.tsx` - Uses isPaidUser()
- `src/app/dashboard/score-reveal/page.tsx` - Uses checkScoreRevealAccess
- `src/app/dashboard/upgrade/page.tsx` - Tracks upgrade events
- `src/app/pricing/pricing-content.tsx` - Pricing UI
- `src/lib/validations/index.ts` - checkoutSchema

### Documentation (10+)
- Developer portal pages, AGENTS.md files, TypeScript types

---

## TESTING COMMANDS

```bash
# 1. Build check
bun run build

# 2. Type check
bun run type-check

# 3. Lint
bun run lint

# 4. API checkout disabled
curl -s -X POST localhost:3000/api/payments/checkout \
  -H "Content-Type: application/json" \
  -d '{"tier":"pro"}' | jq '.error, .code'

# 5. Webhook disabled
curl -s -X POST localhost:3000/api/webhooks/payrex \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.status'

# 6. Full feature access
# - Complete 30+ quiz questions
# - View readiness score
# - Access 3D Lab modules
# - View analytics dashboard
```

---

**Plan perfected with exact code changes, dependency ordering, verification steps, rollback procedure, and re-enablement guide.**
