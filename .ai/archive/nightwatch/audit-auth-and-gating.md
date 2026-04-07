# MASTER ARCHITECTURE BLUEPRINT: AUTH & GATING
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Hostile Tier Gating (UX Crash):** Server actions (e.g., `start-session.ts`) use `throw new Error()` for tier enforcement. In Next.js, this causes a hard router crash instead of a paywall/redirect, resulting in a 500-level error for users attempting to access Pro modes without an active subscription.
2. **HIGH: No Middleware Role Gating (Admin Exposure):** Middleware only verifies the existence of a session. It does NOT check for `admin` or `sme` roles. Any authenticated user can access `/admin/*` routes unless page-level layout guards (which currently rely on spoofable `localStorage`) are perfectly implemented.
3. **MEDIUM: Stable Reference Bug (Hydration):** `TierContext` defines the `hasAccess` function inline during provider render. This creates a new function reference on every re-render, triggering unnecessary `useEffect` runs in downstream consumers and potentially causing stale closure bugs during hydration.

## 2. Exhaustive System Inventory

### 2.1 Auth Flow Registry
- **Entry Middleware:** `middleware.ts` → `updateSession()` in `src/lib/supabase/middleware.ts`.
- **Gating Logic:**
    - `DEV_FORCE_USER_ID`: Blanket dev access bypass.
    - `isDemoMode()`: Mock auth bypass.
    - `PUBLIC_PATHS`: `/`, `/login`, `/register`, `/admin/login`.
- **Auth Service Clients:**
    - `src/lib/supabase/server.ts`: Authenticated server-side client.
    - `src/lib/supabase/client.ts`: Browser client with demo mode fallback.
    - `src/lib/supabase/middleware.ts`: Cookie-based session refresh client.

### 2.2 Tier & Capability Hierarchy
| Tier | Rank | questionsPerDay | aiTokens | srsAccess | aiTutorAccess |
|------|------|----------------|----------|-----------|---------------|
| free | 0 | 50 | 0 | ❌ | ❌ |
| camp | 1 | ∞ | 1,000 | ✅ | ❌ |
| insurance | 2 | ∞ | 10,000 | ✅ | ✅ |
| institutional | 3 | ∞ | ? | ✅ | ✅ |

### 2.3 Role-Based Access (RBAC)
- **Roles:** `user`, `admin`, `super_admin`, `sme`, `developer`.
- **Helpers (`src/lib/rbac/`):** `canReviewContent()`, `canManageUsers()`, `canPublish()`, `isSuperAdmin()`.

## 3. Data Flow & Exact Payloads

### 3.1 JWT Session Payload (Supabase)
```json
{
  "sub": "uuid-xxxx",
  "user_metadata": {
    "tier": 1,
    "full_name": "John Doe"
  },
  "app_metadata": { "role": "authenticated" }
}
```
*Note:* The JWT `tier` is the source of truth for the client, but the `user_subscriptions` table is the source of truth for server actions.

### 3.2 Tier Context Shape (`TierContextValue`)
```typescript
interface TierContextValue {
  tier: UserTier;           // Real DB tier
  effectiveTier: UserTier;  // After dev/admin overrides
  isDevMode: boolean;       // Admin or local dev active
  capabilities: {
    canTakeQuizzes: boolean;
    canUse3DLab: boolean;
    canUseAI: boolean;
    // ... other flags
  };
  hasAccess: (requiredTier: UserTier) => boolean;
}
```

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Tier Sync Latency:** If a user upgrades their subscription (via LemonSqueezy webhook), the DB updates immediately, but the JWT in the browser remains stale until the next session refresh. During this window, server actions might pass, but the UI continues to show "Free" status.
- **Idempotency: Redirect Loops:** In `updateSession`, redirecting a user who is "logged in but on the login page" to `/dashboard` must be carefully checked to ensure no infinite loop occurs if the dashboard layout itself triggers a secondary redirect.
- **Hydration: localStorage Spoofing:** `AdminLayout` reads `localStorage` for `tier >= 2`. Attacker can spoof this to gain access to admin UI components, though API requests will (ideally) still fail on the server.
- **Dev-Mode Leakage:** If `slatecamp-dev-store` persists in production, a developer visiting the site might accidentally trigger "impersonation" behavior in their own session.

## 5. The Unified Resolution Blueprint

### 5.1 Gating & UX Correction
1. **Typed Rejection Pattern:** Replace all `throw new Error()` in server actions with:
    `{ success: false, error: 'TIER_INSUFFICIENT', upgradeUrl: '/upgrade' }`.
2. **Middleware Role Gating:** Implement `ADMIN_PATHS` check in `src/lib/supabase/middleware.ts` that queries `user_roles` if the path starts with `/admin`.

### 5.2 Context Optimization
1. **Stabilize `hasAccess`:** Wrap `hasAccess` in `useCallback()` within `TierProvider`.
2. **Server-Side Initialization:** Pass the verified user tier from `layout.tsx` (Server Component) as a prop to `TierProvider` to eliminate `localStorage` dependencies.

### 5.3 Security Hardening
1. **RBAC Unification:** Consolidate all role checks into `src/lib/rbac/`.
2. **Dev-Mode Guard:** Add `process.env.NODE_ENV === 'development'` check to `DevStore` initialization to prevent production persistence.
3. **Session Re-Fetch:** Add `revalidate` trigger to the profile query in `layout.tsx` to force a JWT update after a successful payment webhook event.
