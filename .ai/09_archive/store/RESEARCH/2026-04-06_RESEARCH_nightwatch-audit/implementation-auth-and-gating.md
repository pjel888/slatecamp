# IMPLEMENTATION BLUEPRINT: AUTH & GATING
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### Server Actions / TypeScript Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/actions/quiz-v2/start-session.ts` | REWRITE | Replace throw with typed rejection |
| `src/lib/actions/quiz-v2/submit-answer.ts` | AUDIT | Check for throw patterns, replace if found |
| `src/lib/actions/mastery/*.ts` | AUDIT | Check for throw patterns, replace if found |
| `src/lib/supabase/middleware.ts` | EXPAND | Add role-based admin gating |
| `src/lib/context/tier-context.tsx` | REWRITE | Add useCallback for hasAccess |
| `src/lib/admin/roles.ts` | CREATE | Consolidate all role checks |

### Layout Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/app/admin/layout.tsx` | VERIFY | Already has role check, verify it's robust |

### New Files (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/rbac/index.ts` | CREATE | Unified RBAC exports |

---

## 2. Dependency Prerequisites

1. **No database migrations required** - logic changes only
2. **No external NPM packages required** - all native TypeScript/React patterns
3. **Testing prerequisite:** Test existing login/redirect flows before changes

---

## 3. The Execution Steps (Micro-Granular)

### Step 1: Create Typed Rejection Pattern
- **File:** `src/lib/actions/quiz-v2/start-session.ts`
- **Action:** REPLACE throw pattern at lines 78-80
- **Logic Required:**
  ```typescript
  // BEFORE (line 78-80):
  if (!isPro && !isDevBypass) {
    throw new Error(`The ${modeDef.label} mode requires a Pro subscription.`)
  }

  // AFTER (new pattern):
  if (!isPro && !isDevBypass) {
    return {
      success: false,
      error: 'TIER_INSUFFICIENT',
      errorCode: 'PRO_MODE_REQUIRED',
      upgradeUrl: '/pricing',
      currentTier: subscription?.tier || 'free',
      requiredTier: 'camp'
    } as StartSessionResult
  }
  ```
- **Update return type:** Ensure `StartSessionResult` union type supports error responses
- **Apply to:** Any other server actions with tier enforcement throws

### Step 2: Update Client Error Handling
- **File:** Client components calling `startSession`
- **Action:** ADD error handling for TIER_INSUFFICIENT
- **Logic Required:**
  ```typescript
  const result = await startSession(input)
  if (!result.success && result.error === 'TIER_INSUFFICIENT') {
    // Redirect to upgrade page with modal
    router.push(`/pricing?required=${result.requiredTier}`)
    return
  }
  ```

### Step 3: Add Middleware Role Gating
- **File:** `src/lib/supabase/middleware.ts`
- **Action:** EXPAND after line 73 (logged-in user check)
- **Logic Required:**
  ```typescript
  // ADMIN ROLE GATING
  const ADMIN_PATHS = ['/admin/']
  const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path))

  if (isAdminPath && user) {
    // Query user_roles table for admin/sme role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin', 'sme'])
      .maybeSingle()

    if (!roleData) {
      // User is logged in but not admin - redirect to dashboard
      return redirectWithCookies(ROUTES.DASHBOARD)
    }
  }
  ```

### Step 4: Stabilize hasAccess with useCallback
- **File:** `src/lib/context/tier-context.tsx`
- **Action:** ADD useCallback to stabilize hasAccess function
- **Logic Required:**
  ```typescript
  import { useCallback, useMemo } from 'react'

  // Inside TierProvider component (line 66-67):
  const hasAccess = useCallback((requiredTier: UserTier) => {
    return TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier]
  }, [effectiveTier])

  // Memoize capabilities to prevent unnecessary re-computation
  const capabilities = useMemo(() =>
    TIER_CAPABILITIES[effectiveTier],
    [effectiveTier]
  )
  ```

### Step 5: Pass Server-Verified Tier to Provider
- **File:** Root layout or dashboard layout
- **Action:** UPDATE to pass verified tier from server
- **Logic Required:**
  ```typescript
  // In layout.tsx (Server Component):
  const { tier, effectiveTier, isDevMode } = await getUserTierContext()

  // Pass to TierProvider as props (not from localStorage):
  <TierProvider tier={tier} effectiveTier={effectiveTier} isDevMode={isDevMode}>
  ```

### Step 6: Create Unified RBAC Module
- **File:** `src/lib/rbac/index.ts`
- **Action:** CREATE new file
- **Logic Required:**
  ```typescript
  // src/lib/rbac/index.ts
  import { canReviewContent, canManageUsers, canPublish, isSuperAdmin } from '@/lib/admin/roles'
  import { getUserRole } from '@/lib/admin/roles'

  export const RBAC = {
    canReviewContent,
    canManageUsers,
    canPublish,
    isSuperAdmin,
    getUserRole,
  }

  // Helper for checking multiple roles
  export const hasAnyRole = (...roles: string[]) => async () => {
    const userRole = await getUserRole()
    return roles.includes(userRole)
  }
  ```

### Step 7: Add Dev-Mode Production Guard
- **File:** `src/stores/dev-store.ts` (or wherever DevStore is initialized)
- **Action:** ADD NODE_ENV check
- **Logic Required:**
  ```typescript
  // At store initialization:
  const initializeDevStore = () => {
    // Prevent dev store from persisting in production
    if (process.env.NODE_ENV === 'production') {
      return
    }
    // ... rest of initialization
  }
  ```

### Step 8: Add Session Re-Fetch After Payment
- **File:** Payment webhook handler or profile page
- **Action:** ADD revalidate trigger
- **Logic Required:**
  ```typescript
  // After successful payment webhook:
  import { revalidatePath } from 'next/cache'

  // Force refresh of user data after subscription update
  revalidatePath('/dashboard')
  revalidatePath('/api/user/profile')
  ```

### Step 9: Verify Admin Layout Guard (Existing)
- **File:** `src/app/admin/layout.tsx`
- **Action:** VERIFY existing guards are robust
- **Logic Required:**
  - Lines 25-28: Already checks `canReviewContent()` - verify this queries DB, not localStorage
  - Lines 30-33: Already checks `getUserRole()` - verify role is fetched server-side
  - **No changes needed** if verified working correctly

---

## 4. Testing & Validation Protocol

### Manual Verification
1. **Tier Rejection Test:** User with free tier attempts Pro mode - should see upgrade prompt, not 500 error
2. **Admin Gating Test:** Non-admin user attempts `/admin/` - should be redirected to dashboard
3. **Hydration Test:** Check console for unnecessary re-renders after tier context changes
4. **Dev Mode Test:** Verify dev store does not persist in production build

### Automated Checks
```bash
# Run existing tests
bun test

# Run lint
bun run lint

# Run type-check
bun run type-check
```

### Security Verification
```bash
# Test unauthenticated access to /admin/*
curl -I http://localhost:3000/admin/
# Should redirect to /admin/login

# Test non-admin access to /admin/
# Login as regular user, navigate to /admin/
# Should redirect to /dashboard
```

---

## 5. Rollback Strategy

### If Tier Gating Breaks
- **Revert start-session.ts:** `git checkout HEAD~1 -- src/lib/actions/quiz-v2/start-session.ts`
- **Temporary fix:** Revert to throw pattern if UI work not complete

### If Middleware Blocks Valid Admins
- **Disable temporarily:** Comment out role check lines in middleware
- **Debug:** Check user_roles table has correct data for test admin user

### If Context Causes Hydration Errors
- **Revert tier-context.tsx:** Remove useCallback additions
- **Test:** Verify hasAccess works without memoization

---

## 6. Implementation Notes

### Key Files Referenced
- `src/lib/actions/quiz-v2/start-session.ts` (lines 68-80) - tier throw issue
- `src/lib/supabase/middleware.ts` (lines 57-79) - needs role gating
- `src/lib/context/tier-context.tsx` (lines 66-67) - hasAccess inline definition
- `src/app/admin/layout.tsx` (lines 25-33) - existing role checks
- `src/lib/admin/roles.ts` - existing role helpers

### Success Criteria
1. Pro mode access for free users shows upgrade UI, not 500 error
2. Non-admin users cannot access /admin/* routes via middleware
3. hasAccess function reference stable across re-renders
4. Dev store does not persist in production
5. Subscription updates reflect immediately on next navigation
