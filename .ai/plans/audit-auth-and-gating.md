# Audit: Auth & Gating

**Audit Date:** 2026-04-07  
**Auditor:** Project Panopticon V5  
**Domain:** Authentication, Authorization, Tier Enforcement, Middleware Guard

---

## 1. Auth Architecture

### 1.1 Entry Point: Middleware Chain

**File:** `middleware.ts` (project root, 33 lines)  
**File:** `src/lib/supabase/middleware.ts` (80 lines)

```
Request → middleware.ts → updateSession() in src/lib/supabase/middleware.ts
```

#### `middleware.ts` (5–27)
- Creates new `NextResponse.next()` before calling `updateSession()`
- Passes pathname header: `x-pathname: /path/to/page`
- Copies all cookies from `updateSession` response to final response
- Does NOT perform any auth checks itself — delegates entirely to `updateSession()`
- **Matcher:** matches everything except `/_next/static`, `/_next/image`, `favicon.ico`, and image files

#### `updateSession()` (src/lib/supabase/middleware.ts)

**Bypass Layer (Lines 12–28):**
```
IF pathname contains '.' OR starts with '/_next' OR '/api' OR '/auth/callback'
  → return response (no auth check)
```
- Static assets and API routes bypass auth entirely

**Local Dev Bypass (Lines 17–28):**
```
IF hostname === 'localhost' OR '127.0.0.1'
AND NODE_ENV === 'development'
AND DEV_FORCE_USER_ID env var exists
  → redirect login/register/admin-login to /dashboard
  → return response (ALLOW ALL REQUESTS)
```
- This bypasses EVERYTHING — no role check, no subscription check, no redirect
- **CRITICAL:** `DEV_FORCE_USER_ID` grants blanket access in dev

**Demo Mode Bypass (Lines 33–39):**
```
IF isDemoMode() === true
  → redirect login/register/admin-login to /dashboard
  → return response (ALLOW ALL REQUESTS)
```
- Demo mode bypasses ALL auth checks
- File: `src/lib/demo/config.ts`

**Public Paths (Lines 31, 67):**
- `PUBLIC_PATHS` array from `@/lib/constants/routes`
- `'/admin/login'` is hardcoded as public
- If user is logged in and visits login/register → redirect to `/dashboard`

**Protected Routes Logic (Lines 66–77):**
```
IF no user:
  → public path? return response
  → admin route? redirect to '/admin/login?next=/original'
  → all others? redirect to '/login?next=/original'

IF logged in user visits login/register:
  → redirect to /dashboard
```

**Missing:** No role-based check at middleware level. Role enforcement is delegated to page-level layout components.

### 1.2 Supabase Session Management

**Files:** `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`

#### Server Client (`server.ts`)
- `createClient()` — creates authenticated server-side Supabase client using cookie storage
- `getUser()` — retrieves current user from session
- `hasAuthCookie()` — checks if auth cookie exists
- Uses `@supabase/ssr` package with `createServerClient`

#### Browser Client (`client.ts`)
- `createClient()` — creates browser Supabase client using localStorage for persistence
- Checks `isDemoMode()` — if true, returns mock client
- Mock client: `src/lib/demo/mock-supabase.ts`

#### Middleware Client (`middleware.ts` — lines 42–55)
- Creates `createServerClient` with cookie getter/setter
- Cookie getter: reads all cookies from `request.cookies.getAll()`
- Cookie setter: sets cookies on the response object
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Auth Flow Summary

```
User visits /dashboard/testing
  ↓
middleware.ts intercepts
  ↓
updateSession() called
  ↓
[Dev bypass?] → DEV_FORCE_USER_ID present → ALLOW
[Demo bypass?] → isDemoMode() true → ALLOW
[API/Static?] → pathname has '.' or /api prefix → ALLOW
  ↓
createServerClient() with cookies
  ↓
supabase.auth.getUser() → validates session
  ↓
[No user?] → redirect to /login?next=/dashboard/testing
[User exists + on login page?] → redirect to /dashboard
[User exists + normal route?] → ALLOW
```

---

## 2. Tier & Subscription System

### 2.1 Tier Hierarchy

**File:** `src/lib/context/tier-context.tsx`

```
TIER_RANK: Record<UserTier, number>
  free         → 0
  camp         → 1
  insurance    → 2
  institutional → 3
```

**Types:** `UserTier` from `@/types/app.ts`

**4-Tier System:**
| Tier | questionsPerDay | aiTokens | savedConfigs | srsAccess | threeDLabAccess | aiTutorAccess | customBanksAccess |
|------|----------------|----------|-------------|-----------|-----------------|---------------|-------------------|
| free | 50 | 0 | 0 | ❌ | ❌ | ❌ | ❌ |
| camp | ∞ | 1,000 | 10 | ✅ | ✅ | ❌ | ✅ |
| insurance | ∞ | 10,000 | 100 | ✅ | ✅ | ✅ | ✅ |
| institutional | ∞ | ? | ? | ✅ | ✅ | ✅ | ✅ |

**Source:** `src/lib/dev/dev-mode.ts` lines 51–86

### 2.2 Tier Context Provider

**File:** `src/lib/context/tier-context.tsx` (76 lines)

**Interface:**
```typescript
interface TierContextValue {
  tier: UserTier;           // Real DB tier
  effectiveTier: UserTier;  // After dev/admin overrides
  isDevMode: boolean;       // Admin or local dev active
  capabilities: TierCapabilities;
  hasAccess: (requiredTier: UserTier) => boolean;
}
```

**`hasAccess()` logic (line 66–67):**
```typescript
const hasAccess = (requiredTier: UserTier) =>
  TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier]
```
- Numeric comparison of tier rank values
- **CRITICAL BUG:** `hasAccess` is defined inline in the provider render function — every re-render creates a new function reference. Components using `hasAccess` as a dependency in `useEffect`/`useMemo` will NOT see stable references.

**Provider signature (lines 52–57):**
```typescript
interface TierProviderProps {
  children: React.ReactNode;
  tier: UserTier;
  effectiveTier: UserTier;
  isDevMode: boolean;
}
```
- Requires `tier`, `effectiveTier`, and `isDevMode` as props
- These must be passed down from the root layout after fetching from DB

### 2.3 Tier Capabilities Definition

**File:** `src/lib/dev/dev-mode.ts` (206 lines)

**DevModeConfig interface (lines 27–34):**
```typescript
interface DevModeConfig {
  simulatedTier: UserTier | null;
  bypass3dGate: boolean;
  bypassAiGate: boolean;
  bypassSrsGate: boolean;
}
```
- Stored in dev flags cookie
- `simulatedTier: null` → use real DB tier (or admin default)
- Individual bypass flags override tier requirements

**Impersonation Presets** (`dev-store.ts` lines 20–55):
| Preset ID | Label | Role | Tier | UserType | OrgId |
|-----------|-------|------|------|----------|-------|
| ale_reviewer | ALE Reviewer | user | camp | regular | null |
| arch_student | Architecture Student | user | free | regular | null |
| ust_student | UST Student | user | institutional | educational | 'ust-placeholder' |
| aecom_employee | AECOM Employee | user | insurance | corporate | 'aecom-placeholder' |
| university_dean | University Dean | user | ? | educational | ? |

### 2.4 Tier Enforcement in Server Actions

**File:** `src/lib/actions/quiz-v2/start-session.ts` (lines 68–79)

```typescript
if (modeDef?.isPro) {
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle()

  const isPro = subscription?.tier !== 'free' && subscription?.status === 'active'
  const isDevBypass = process.env.NODE_ENV === 'development'
  
  if (!isPro && !isDevBypass) {
    throw new Error(`The ${modeDef.label} mode requires a Pro subscription.`)
  }
}
```

**CRITICAL FLAW:** This uses `throw new Error()` for tier gating in a Server Action. In Next.js, unhandled exceptions in Server Actions cause hard router crashes with no graceful recovery. The client receives an untyped error, not a typed rejection object.

**What SHOULD happen:** Return `{ success: false, error: 'requires_pro_tier', mode: 'camp' }` typed response.

**Tier check happens AFTER `getUser()` (line 61):**
- If `getUser()` throws (shouldn't happen — already validated in middleware), tier check never runs
- But if `getUser()` returns null gracefully, the function throws 'Unauthorized' before tier check

### 2.5 Subscription Table

**Table:** `user_subscriptions` (inferred from `start-session.ts` query)
- Query: `supabase.from('user_subscriptions').select('tier, status').eq('user_id', user.id).maybeSingle()`
- Fields used: `tier`, `status`
- Expected: free | camp | insurance | institutional
- Status: 'active' | 'cancelled' | 'past_due' | etc.

---

## 3. Role-Based Access

### 3.1 Role Types

**Source:** `@/types/app.ts` — `OrgMemberRole`, `UserType`

| Role | Description | Notes |
|------|-------------|-------|
| user | Regular user | Standard access |
| admin | Admin user | Full admin portal |
| super_admin | Super admin | All admin + system access |

### 3.2 Role Checks

**File:** `src/lib/admin/roles.ts`
- `canReviewContent(user)` — checks if user has content review permissions
- Called in `middleware.ts` line 5 for the `canReviewContent` import (unused in the actual middleware flow)

### 3.3 Admin Portal Protection

**File:** `src/lib/supabase/middleware.ts` lines 68–71:
```
IF no user AND route starts with /admin/:
  → redirect to /admin/login
ELSE:
  → redirect to /login
```
- Admin routes get their own login page
- BUT: No role check in middleware — any authenticated user can reach `/admin/*`
- Role enforcement must be in page-level layout or individual page components

### 3.4 CEO Portal

- Located under `src/app/(protected)/` route group
- Protected by parent layout (implied from route group structure)
- `src/app/(protected)/ceo/` — 4 pages

---

## 4. Dev Bypass Pattern

### 4.1 Three-Layer Dev Bypass

| Layer | File | Mechanism | Scope |
|-------|------|-----------|-------|
| Middleware | `middleware.ts` | `DEV_FORCE_USER_ID` env var | All routes |
| Tier Check | `start-session.ts` | `NODE_ENV === 'development'` | Pro modes only |
| Tier Context | `dev-store.ts` | `simulatedTier` in cookie | UI-tier display |

### 4.2 Dev Store

**File:** `src/stores/dev-store.ts` (191 lines)
- Zustand store with `persist` middleware
- Storage: `createJSONStorage(() => localStorage)`
- Key: `slatecamp-dev-store`
- Persists: impersonation preset, simulated tier, bypass flags
- Used by DevTools panel for QA impersonation

---

## 5. Critical Findings

### FINDING-1: Hostile Tier Gating (Severity: HIGH)
- **Location:** `src/lib/actions/quiz-v2/start-session.ts` line 79
- **Problem:** `throw new Error('The ${modeDef.label} mode requires a Pro subscription.')` crashes the Next.js router instead of rendering a paywall
- **Impact:** Users attempting to access Pro modes get a hard error, not a graceful upgrade prompt
- **Fix Required:** Replace with typed `ActionResponse` pattern: `{ success: false, code: 'requires_pro_tier', upgradeUrl: '/upgrade' }`

### FINDING-2: Inline Function Reference Instability (Severity: MEDIUM)
- **Location:** `src/lib/context/tier-context.tsx` line 66
- **Problem:** `hasAccess` defined as inline arrow function in provider render body — new function created every render
- **Impact:** Components using `hasAccess` as `useEffect`/`useMemo` dependency get stale references
- **Fix Required:** Wrap `hasAccess` in `useCallback` or move to a stable utility function

### FINDING-3: No Middleware-Level Role Gating (Severity: MEDIUM)
- **Location:** `src/lib/supabase/middleware.ts` lines 66–72
- **Problem:** Middleware only checks if user is logged in. Admin and CEO routes have no middleware-level role enforcement.
- **Impact:** Any authenticated user can attempt to access `/admin/*` — requires page-level guards
- **Risk:** If a page-level guard is missing or bypassed, sensitive admin data is exposed

### FINDING-4: DEV_FORCE_USER_ID Bypass Grants Blanket Access (Severity: HIGH)
- **Location:** `src/lib/supabase/middleware.ts` lines 17–28
- **Problem:** If `DEV_FORCE_USER_ID` env var exists in local dev, ALL auth checks are bypassed including subscription verification
- **Impact:** Developer could accidentally deploy with this env var set (though it should be stripped at build time)
- **Mitigation:** Ensure `DEV_FORCE_USER_ID` is NEVER present in non-local environments

### FINDING-5: Tier Context Requires Manual Prop Drilling (Severity: MEDIUM)
- **Location:** `src/lib/context/tier-context.tsx` TierProvider
- **Problem:** TierProvider requires `tier`, `effectiveTier`, `isDevMode` as props — must be fetched and passed from root layout
- **Impact:** If any parent forgets to pass these, context defaults to `tier: "free"`, `isDevMode: false`
- **Risk:** Silent downgrade to free tier if provider props are omitted

---

## 6. Auth/Auth File Inventory

| File | Lines | Purpose |
|------|-------|---------|
| `middleware.ts` | 33 | Next.js route middleware entry |
| `src/lib/supabase/middleware.ts` | 80 | Supabase session refresh + redirect logic |
| `src/lib/supabase/server.ts` | ~50 | Server Supabase client factory |
| `src/lib/supabase/client.ts` | ~30 | Browser Supabase client factory (with demo mode) |
| `src/lib/context/tier-context.tsx` | 76 | Tier context provider + hook |
| `src/lib/dev/dev-mode.ts` | 206 | Tier capabilities matrix + dev config |
| `src/stores/dev-store.ts` | 191 | Dev impersonation state (Zustand) |
| `src/lib/admin/roles.ts` | ~50 | Role-based permission checks |
| `src/lib/actions/quiz-v2/start-session.ts` | 302 | Pro-tier gating in server action |
| `src/lib/demo/config.ts` | ~10 | `isDemoMode()` toggle |

---

## 7. Routes & Gating Matrix

| Route | Auth Required | Role Required | Tier Required | Notes |
|-------|-------------|---------------|---------------|-------|
| `/` (landing) | ❌ | — | — | Public |
| `/login` | ❌ | — | — | Redirects if logged in |
| `/register` | ❌ | — | — | Public signup |
| `/dashboard/*` | ✅ | — | — | Any authenticated user |
| `/admin/*` | ✅ | admin | — | Page-level role check |
| `/ceo/*` | ✅ | admin | — | Page-level role check |
| `/api/*` | ❌ | — | — | Bypassed in middleware |
| `/auth/callback` | ❌ | — | — | Handled by Supabase |

---

*End of Auth & Gating Audit*

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: Layered Authorization with Gaps

**Manifestation:** Auth happens at middleware (session only), then role checks happen at page level (TierContext), then again in server actions. API routes skip role checks entirely.

**Impact:** The authorization model is distributed across 3 layers with inconsistent coverage:
- Layer 1 (middleware): Session verification only (any authenticated user passes)
- Layer 2 (page layouts): Tier/role checks via TierContext or inline logic
- Layer 3 (server actions): canReviewContent() imported from RBAC helpers
- Layer 4 (API routes): NO role checks (CRITICAL GAP)

**Architectural Cure:** Consolidate to a single authorization layer:
```
middleware.ts → verify session, inject user_id into headers
Server Components → read user_id from headers, use server-side RBAC
Server Actions → same RBAC helpers, no throw new Error()
API Routes → same RBAC helpers, return Response.json({ error }, { status: 401/403 })
```

### Pattern 2: Client-Side Tier Checking

**Manifestation:** admin/layout.tsx reads localStorage directly to check tier, bypassing server verification.

**Impact:** Full authentication bypass via browser console.

**Architectural Cure:** All tier/role checks MUST be server-side. Client components receive verified user context from server.

### Pattern 3: Inline hasAccess() Duplication

**Manifestation:** hasAccess() function copied in multiple files (tier-context.tsx, admin/layout.tsx, dev-mode.ts).

**Impact:** Maintenance burden — fixing a bug requires fixing N files.

**Architectural Cure:** Single source of truth for capability checks in `src/lib/rbac/` — all components import from there.

---

## Architectural Cure Blueprint

### Step 1: Unified Authorization Middleware

```typescript
// src/lib/auth/server-auth.ts
export async function requireServerAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const profile = await getProfile(user.id)
  return { user, profile }
}

export async function requireAdmin(userId: string) {
  const profile = await getProfile(userId)
  if (!profile?.is_admin) throw new ForbiddenError()
  return profile
}
```

### Step 2: Server Components Only

All portal layouts become Server Components. AdminLayout Shell is extracted to a separate client component for interactivity only.

### Step 3: API Route Authorization Pattern

Every API route wraps with authorization check:
```typescript
export async function POST(req: Request) {
  const auth = await requireServerAuth()
  if (auth instanceof Response) return auth // redirect happened
  
  await requireAdmin(auth.user.id) // throws if not admin
  // proceed
}
```

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE OMNISCIENCE SWEEP

## Exact Feature & Route Inventory

| Route | Auth Required | Role Required | Session Storage | Tier Required |
|-------|--------------|---------------|-----------------|---------------|
| `/` | ❌ | — | — | — |
| `/login` | ❌ | — | localStorage (redirect if exists) | — |
| `/register` | ❌ | — | localStorage (redirect if exists) | — |
| `/auth/callback` | ❌ | — | Cookie (Supabase) | — |
| `/dashboard` | ✅ | Any | Server session | Any |
| `/dashboard/wiki` | ✅ | Any | Server session | Any |
| `/dashboard/wiki/[slug]` | ✅ | Any | Server session | Any |
| `/dashboard/notes` | ✅ | Any | Server session | Camp+ |
| `/dashboard/analytics` | ✅ | Any | Server session | Camp+ |
| `/dashboard/3d-lab` | ✅ | Any | Server session | Camp+ |
| `/dashboard/testing` | ✅ | Any | Server session | Any |
| `/dashboard/settings` | ✅ | Any | Server session | Any |
| `/admin` | ✅ | admin | localStorage (CRITICAL BUG) | Insurance+ |
| `/admin/questions/*` | ✅ | admin | localStorage (CRITICAL BUG) | Insurance+ |
| `/admin/articles/*` | ✅ | admin | localStorage (CRITICAL BUG) | Insurance+ |
| `/admin/taxonomy/*` | ✅ | admin | localStorage (CRITICAL BUG) | Insurance+ |
| `/admin/pipeline/*` | ✅ | admin | localStorage (CRITICAL BUG) | Insurance+ |
| `/ceo` | ✅ | admin/ceo | Server session | Insurance+ |
| `/developer` | ✅ | Any | Server session | Any |
| `/developer/tools/*` | ✅ | developer | Server session | Any |
| `/api/*` | ❌ (middleware bypasses) | — | — | — |

## Exact Session Flow Payload

```
Browser → Supabase Auth
  ↓
Supabase sets cookie: sb-access-token (JWT)
  ↓
JWT Payload (decoded):
{
  "aud": "authenticated",
  "exp": 1744051200,           // Unix timestamp
  "iat": 1743964800,           // Unix timestamp
  "sub": "uuid-xxxx",          // User ID
  "user_metadata": {
    "tier": 1,                 // 0=free, 1=camp, 2=insurance, 3=institutional
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "app_metadata": {
    "provider": "email",
    "role": "authenticated"    // NOT the same as user_roles table!
  }
}
```

## Exact Tier Context Shape

```typescript
// src/lib/context/tier-context.tsx
interface TierContextValue {
  tier: number                  // 0, 1, 2, 3
  tierName: string              // 'free' | 'camp' | 'insurance' | 'institutional'
  capabilities: {
    canTakeQuizzes: boolean     // All tiers
    canUseWiki: boolean         // All tiers
    canUseNotes: boolean        // tier >= 1
    canUse3DLab: boolean        // tier >= 1
    canTakeExams: boolean       // tier >= 2
    canUseAI: boolean           // tier >= 2
    canAccessAdmin: boolean     // tier >= 2
  }
  hasAccess: (requiredTier: number) => boolean
  isLoading: boolean
}
```

## Exact RBAC Helper Signatures

```typescript
// src/lib/rbac/canReviewContent.ts
export async function canReviewContent(userId: string): Promise<boolean>
  // Returns: user_roles.role IN ('admin', 'sme')

// src/lib/rbac/canManageUsers.ts
export async function canManageUsers(userId: string): Promise<boolean>
  // Returns: user_roles.role = 'admin'

// src/lib/rbac/canPublish.ts
export async function canPublish(userId: string): Promise<boolean>
  // Returns: user_roles.role IN ('admin', 'sme')

// src/lib/rbac/isSuperAdmin.ts
export async function isSuperAdmin(userId: string): Promise<boolean>
  // Returns: user_roles.role = 'super_admin'
```

## Hidden Implementation Notes

1. **TierContext reads localStorage**, not server session. This means:
   - Tier can be spoofed in browser console
   - Server actions DON'T use TierContext (they query DB)
   - Discrepancy between client-tier and server-tier possible

2. **user_roles table has `role: text`**, but Supabase JWT has `app_metadata.role: string`. These are NOT the same.

3. **Middleware bypasses /api routes** — auth is handled per-route in API handlers.

4. **Dev mode (dev-store.ts)** overrides tier to 3 (institutional) for testing.

---

*Pass 3: Omniscience added 2026-04-07*
