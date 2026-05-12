# IMPLEMENTATION BLUEPRINT: API ROUTES
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### API Route Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/app/api/ai/generate-questions/route.ts` | EXPAND | Add tier-based quota check |
| `src/app/api/ai/tutor/route.ts` | EXPAND | Add tier-based quota check |
| `src/app/api/ai/study-agent/route.ts` | EXPAND | Add tier-based quota check |
| `src/app/api/ai/embed/route.ts` | EXPAND | Add tier-based quota check |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | REWRITE | Add idempotency + transaction |
| `src/app/api/webhooks/payrex/route.ts` | REWRITE | Add idempotency + transaction |
| `src/app/api/cron/blindspot-scan/route.ts` | EXPAND | Add IP allowlist check |
| `src/app/api/cron/compute-signals/route.ts` | EXPAND | Add IP allowlist check |

### New Files (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/api/require-admin.ts` | CREATE | Reusable admin authorization helper |
| `src/lib/api/require-role.ts` | CREATE | Reusable role-based authorization |
| `src/lib/api/rate-limit-tier.ts` | CREATE | Tier-based rate limiting |
| `supabase/migrations/NEW_webhook_idempotency.sql` | CREATE | Webhook event tracking table |

### Library Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/rate-limit.ts` | EXPAND | Add persistent rate limiting (Upstash) |

---

## 2. Dependency Prerequisites

1. **Database Migration First:**
   - Run `NEW_webhook_idempotency.sql` to create `processed_webhook_events` table

2. **NPM Packages:**
   - `@vercel/kv` - for production rate limiting (optional, can use in-memory for now)

3. **Environment Variables:**
   - `CRON_SECRET` - already exists
   - `VERCEL_IP_ALLOWLIST` - need to add for cron security

---

## 3. The Execution Steps (Micro-Granular)

### Step 1: Create Reusable Admin Authorization Helper
- **File:** `src/lib/api/require-admin.ts`
- **Action:** CREATE new file
- **Logic Required:**
  ```typescript
  // src/lib/api/require-admin.ts
  import { createClient } from "@/lib/supabase/server";
  import { NextResponse } from "next/server";

  export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    // Check user_roles for admin/super_admin
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin'])
      .maybeSingle();

    if (!role) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { user, role: role.role };
  }
  ```

### Step 2: Create Tier-Based Rate Limiter
- **File:** `src/lib/api/rate-limit-tier.ts`
- **Action:** CREATE new file
- **Logic Required:**
  ```typescript
  // src/lib/api/rate-limit-tier.ts
  import { createClient } from "@/lib/supabase/server";

  const TIER_QUOTAS = {
    free: { ai_generate: 0, ai_tutor: 0, ai_embed: 50 },
    camp: { ai_generate: 10, ai_tutor: 100, ai_embed: 500 },
    insurance: { ai_generate: 50, ai_tutor: 500, ai_embed: 2000 },
    institutional: { ai_generate: -1, ai_tutor: -1, ai_embed: -1 } // unlimited
  }

  export async function checkTierQuota(endpoint: 'ai_generate' | 'ai_tutor' | 'ai_embed') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { allowed: false, error: 'Unauthorized' };

    // Get user tier
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle();

    const tier = sub?.tier || 'free';
    const quota = TIER_QUOTAS[tier]?.[endpoint];

    if (quota === 0) {
      return { allowed: false, upgradeUrl: '/pricing', tier };
    }

    if (quota === -1) return { allowed: true, tier }; // unlimited

    // Check usage and return allowed
    return { allowed: true, remaining: quota, tier };
  }
  ```

### Step 3: Add Tier Quotas to AI Endpoints
- **File:** `src/app/api/ai/generate-questions/route.ts`
- **Action:** ADD tier quota check after rate limit
- **Logic Required:**
  ```typescript
  // After line 42 (rate limit check):
  const tierCheck = await checkTierQuota('ai_generate')
  if (!tierCheck.allowed) {
    return NextResponse.json(
      { error: 'Upgrade required for AI generation', upgradeUrl: tierCheck.upgradeUrl },
      { status: 403 }
    )
  }
  ```
- **Apply same pattern to:** `tutor`, `study-agent`, `embed` routes

### Step 4: Add Webhook Idempotency
- **File:** `supabase/migrations/NEW_webhook_idempotency.sql`
- **Action:** CREATE migration
- **SQL Required:**
  ```sql
  CREATE TABLE IF NOT EXISTS processed_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'lemonsqueezy' or 'payrex'
    event_id TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(provider, event_id)
  );

  CREATE INDEX idx_processed_webhook_events_provider
  ON processed_webhook_events(provider, event_id);
  ```

### Step 5: Rewrite LemonSqueezy Webhook with Idempotency
- **File:** `src/app/api/webhooks/lemonsqueezy/route.ts`
- **Action:** REWRITE with idempotency + transaction
- **Logic Required:**
  ```typescript
  // Add after signature verification, before event processing:
  const eventId = event.id;

  // Check idempotency
  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('provider', 'lemonsqueezy')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  // Process event (existing logic)
  // ...

  // Mark as processed (in same transaction or after success)
  await supabase.from('processed_webhook_events').insert({
    provider: 'lemonsqueezy',
    event_id: eventId
  })
  ```

### Step 6: Add Optimistic Locking to PATCH Routes
- **File:** Any PATCH API routes (if exist)
- **Action:** ADD updated_at check
- **Logic Required:**
  ```typescript
  // In PATCH handler:
  const { updated_at: clientUpdatedAt } = await request.json();

  if (clientUpdatedAt) {
    const { data: current } = await supabase
      .from('questions')
      .select('updated_at')
      .eq('id', questionId)
      .single();

    if (new Date(current.updated_at) > new Date(clientUpdatedAt)) {
      return NextResponse.json(
        { error: 'Conflict: resource was modified' },
        { status: 409 }
      )
    }
  }
  ```

### Step 7: Add Cron IP Allowlist
- **File:** `src/app/api/cron/blindspot-scan/route.ts`
- **Action:** ADD IP verification
- **Logic Required:**
  ```typescript
  // At start of handler:
  const headersList = await headers();
  const auth = headersList.get('authorization');

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Optional: Verify x-forwarded-for against Vercel IPs
  const forwardedFor = headersList.get('x-forwarded-for');
  // Add Vercel IP range check if needed
  ```
- **Apply to:** Both cron routes

### Step 8: Add Retry Logic to AI Endpoints
- **File:** `src/app/api/ai/tutor/route.ts` (and others)
- **Action:** ADD exponential backoff retry
- **Logic Required:**
  ```typescript
  // Wrapper for AI calls with retry
  async function callAIWithRetry(prompt: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        return await ai.generateCompletion(prompt);
      } catch (err: any) {
        if (err.status === 429 && i < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); // exponential backoff
          continue;
        }
        throw err;
      }
    }
    throw new Error('Max retries exceeded');
  }
  ```

### Step 9: Add Schema Validation
- **File:** Create or update validation schemas
- **Action:** ADD Zod validation to API routes
- **Logic Required:**
  ```typescript
  // In generate-questions route, after auth:
  const GenerateQuestionSchema = z.object({
    chunkContent: z.string().min(100).max(50000),
    profession: z.string().min(1),
    examTarget: z.string().min(1),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    count: z.number().int().min(1).max(20).optional()
  });

  const parsed = GenerateQuestionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }
  ```

---

## 4. Testing & Validation Protocol

### Manual Verification
1. **Auth Test:** Verify non-admin cannot access admin API routes
2. **Tier Test:** Free user attempting AI generation should get 403 with upgrade URL
3. **Webhook Test:** Send same LemonSqueezy webhook twice - second should return idempotent=true
4. **Cron Test:** Call cron endpoint without CRON_SECRET - should return 401

### Automated Checks
```bash
# Run existing tests
bun test

# Run lint
bun run lint

# Run type-check
bun run type-check
```

### Load Testing
```bash
# Test rate limiting
for i in {1..15}; do curl -X POST /api/ai/generate-questions; done
# Should get 429 after 10 requests
```

---

## 5. Rollback Strategy

### If Webhook Breaks
- **Disable idempotency check:** Comment out the processed_webhook_events check temporarily
- **Manual cleanup:** Delete duplicate subscription records

### If Rate Limiting Blocks Valid Users
- **Increase limits:** Adjust MAX_REQUESTS in rate-limit.ts
- **Disable temporarily:** Comment out tier check

### If Cron Jobs Stop Working
- **Verify CRON_SECRET:** Check environment variable is set
- **Test manually:** Call endpoint with correct Bearer token

---

## 6. Implementation Notes

### Key Files Referenced
- `src/app/api/ai/generate-questions/route.ts` - needs tier quota check
- `src/app/api/webhooks/lemonsqueezy/route.ts` - needs idempotency
- `src/app/api/cron/blindspot-scan/route.ts` - needs auth verification
- `src/lib/rate-limit.ts` - existing rate limiter

### Success Criteria
1. Non-admin users cannot create/modify/delete via API
2. Free users cannot access AI generation endpoints
3. Duplicate webhook events are rejected
4. Cron endpoints verify CRON_SECRET
5. PATCH requests handle concurrent updates
