# Drills Route Forensics & Refactor Blueprint (v2)

**Generated:** 2026-04-07
**Version:** 2.0 (Upgraded)
**Purpose:** Pre-refactor audit for the "Drills" nomenclature shift (testing → drills) and testing hub UI/functionality fixes.

---

> **Document Scope:** This blueprint covers 6 major workstreams:
> 1. Sidebar active state bugfix
> 2. Viewport maximization
> 3. Sessions table extraction
> 4. Design Endurance mode debugging
> 5. Dev-mode bypass implementation
> 6. Nomenclature migration (Testing → Drills)

---

## 1. Sidebar & Layout Forensics

### 1.1 Sidebar Active State Bug (DUPLICATE HIGHLIGHTING)

#### Technical Deep-Dive

**Affected Files:**
| File | Line(s) | Purpose |
|------|---------|----------|
| `src/components/sidebar/SidebarNavItem.tsx` | 38-53, 158-179 | Child active detection, rendering |
| `src/components/sidebar/Sidebar.tsx` | TBD | Parent `isActive` calculation |
| `src/components/sidebar/sidebar-constants.ts` | 42-53 | Nav item configuration |

#### Root Cause Analysis

The dual-highlighting bug stems from **two independent active-state calculations** that independently evaluate to `true` for the same pathname:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER VISITS: /dashboard/testing                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PARENT CALCULATION (Sidebar.tsx or parent)                           │
│  ────────────────────────────────────────────                         │
│  isActive = pathname.startsWith('/dashboard/testing')  // ✓ TRUE     │
│                                                                         │
│  CHILD CALCULATION (SidebarNavItem.tsx line 38-53)                     │
│  ─────────────────────────────────────────────                         │
│  isChildActive = pathname === childHref                               │
│                 = '/dashboard/testing' === '/dashboard/testing'        │
│                                           // ✓ TRUE (DUPLICATE!)        │
│                                                                         │
│  RESULT: Both parent nav item AND child nav item render as active     │
└─────────────────────────────────────────────────────────────────────────┘
```

**The Critical Flaw:** The nav config in `sidebar-constants.ts` defines a child with the **exact same href** as its parent:

```tsx
// sidebar-constants.ts lines 42-53
{
  id: 'testing',
  href: '/dashboard/testing',           // ← PARENT HREF
  label: 'Testing & Review',
  icon: Exam,
  tier: 'secondary',
  group: 'practice',
  children: [
    {
      id: 'test-sessions',
      label: 'Sessions',
      href: '/dashboard/testing'         // ← CHILD HREF (IDENTICAL!)
    },
  ],
}
```

#### Fix Required (Step-by-Step)

**Step 1:** Update `sidebar-constants.ts` — Give child a unique route

```tsx
// BEFORE (lines 42-53)
{
  id: 'testing',
  href: '/dashboard/testing',
  label: 'Testing & Review',
  icon: Exam,
  tier: 'secondary',
  group: 'practice',
  children: [
    { id: 'test-sessions', label: 'Sessions', href: '/dashboard/testing' },
  ],
}

// AFTER
{
  id: 'testing',
  href: '/dashboard/drills',           // ← NEW ROUTE (nomenclature change)
  label: 'Drills',                     // ← NEW LABEL (nomenclature change)
  icon: Exam,
  tier: 'secondary',
  group: 'practice',
  children: [
    {
      id: 'test-sessions',
      label: 'Sessions',
      href: '/dashboard/drills/sessions'  // ← UNIQUE CHILD ROUTE
    },
  ],
}
```

**Step 2:** (Optional) Enhance child matching in `SidebarNavItem.tsx` to handle edge cases:

```tsx
// Add to isChildActive function (line 38)
const isChildActive = (childHref: string) => {
  // Handle query params gracefully
  const cleanPathname = pathname.split('?')[0]
  const cleanChildHref = childHref.split('?')[0]
  return cleanPathname === cleanChildHref
}
```

#### Hidden Risks & Edge Cases

> **Warning: Query Parameter Handling**
> - Current code at line 39-50 handles query params via split, but this is a recent addition
> - Test with `/dashboard/testing?mode=camp` — should NOT activate child

> **Warning: Trailing Slash Inconsistency**
> - Some routes use trailing slashes (`/dashboard/testing/`), some don't
> - Verify `startsWith` vs exact-match behavior across all nav items
> - **Action:** Add a normalization helper in `SidebarNavItem.tsx`

```tsx
const normalizePath = (p: string) => p.replace(/\/$/, '')
```

---

### 1.2 Viewport Maximization Failure

#### Root Cause Analysis

The viewport boxing originates **inside `ReviewHub.tsx`**, NOT from any layout wrapper:

**File:** `src/components/testing/hub/ReviewHub.tsx`
**Line:** 304

```tsx
// Current (boxing)
<main
  className="mx-auto max-w-[960px] px-6 py-8"
  aria-label="Review and Testing hub"
>
```

**Parent Layout Analysis:**

| Layout File | Constraint | Status |
|------------|-----------|--------|
| `src/app/dashboard/testing/layout.tsx` | None (passthrough) | ✅ Clean |
| `src/components/sidebar/SidebarContent.tsx` | `flex min-h-0 min-w-0 flex-1` | ✅ Allows full-width |
| `src/app/dashboard/layout.tsx` | Sidebar shell | ✅ Clean |

#### Fix Required

```tsx
// BEFORE (line 304)
className="mx-auto max-w-[960px] px-6 py-8"

// AFTER
className="w-full px-6 py-8"
```

> **Note:** The `px-6` padding should be retained to maintain horizontal breathing room from sidebar edge.

#### Verification Checklist

- [ ] Desktop: Content stretches to full sidebar width
- [ ] Tablet: Proper responsive behavior at `lg` breakpoint
- [ ] Mobile: No horizontal overflow (verify `SidebarContent` handles mobile correctly)

---

## 2. Sessions Extraction Blueprint

### 2.1 Current State Analysis

**Data Flow Diagram:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CURRENT: Sessions in ReviewHub                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  src/app/dashboard/testing/page.tsx                                     │
│  │                                                                        │
│  │  1. Fetch quiz_sessions (limit 200)                                 │
│  │  2. Pass to ReviewHub as `allSessions` prop                          │
│  │                                                                        │
│  ▼                                                                        │
│  src/components/testing/hub/ReviewHub.tsx                               │
│  │  lines 79-94: receives allSessions, filters to completed/inProgress  │
│  │  line 513: renders <SessionsTable sessions={allSessions} />         │
│  │                                                                        │
│  ▼                                                                        │
│  src/components/testing/hub/SessionsTable.tsx                           │
│  │  Renders table with ALL sessions (including in-progress)             │
│  │                                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependency Map

| Dependency | File | Type | Lines |
|------------|------|------|-------|
| `SessionsTable` component | `src/components/testing/hub/SessionsTable.tsx` | Component | 1-50 |
| `RawSession` type definition | `src/components/testing/hub/ReviewHub.tsx` | Interface | 20-38 |
| Data fetching query | `src/app/dashboard/testing/page.tsx` | Supabase | 35-40 |
| Column selection | Same | Supabase | 36-37 |
| Auth check | Same | Supabase | 16-17 |

### 2.3 Detailed Extraction Steps

> **Critical Path:** Follow these steps **IN ORDER** to avoid breaking the build.

#### Step 1: Create New Sessions Page Skeleton

```tsx
// File: src/app/dashboard/drills/sessions/page.tsx
// Create this file first (will error until Steps 2-4 complete)
```

#### Step 2: Copy Data Fetching Logic

From `src/app/dashboard/testing/page.tsx` lines 15-68, extract the session query:

```tsx
// NEW: src/app/dashboard/drills/sessions/page.tsx
const { data: sessions } = await supabase
  .from('quiz_sessions')
  .select('session_id, test_mode, config, status, question_ids, started_at, completed_at, current_question_index, updated_at')
  .eq('user_id', user.id)
  .order('updated_at', { ascending: false })
  .limit(200)
```

#### Step 3: Import SessionsTable

```tsx
// Keep import path as-is for now (can alias later)
import { SessionsTable } from '@/components/testing/hub/SessionsTable'
```

#### Step 4: Create Loading State

```tsx
// src/app/dashboard/drills/sessions/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return <Skeleton className="h-screen w-full" />
}
```

#### Step 5: Remove from ReviewHub

In `src/components/testing/hub/ReviewHub.tsx`:

```tsx
// REMOVE line 7:
import { SessionsTable } from './SessionsTable'

// REMOVE lines 506-515:
<div className="mt-10">
  <SectionHeader
    eyebrow="Session History"
    title="Your Sessions"
    level="section"
  />
  <div className="mt-4">
    <SessionsTable sessions={allSessions} />
  </div>
</div>
```

#### Step 6: Add Navigation Link

Update `src/components/sidebar/sidebar-constants.ts`:

```tsx
children: [
  {
    id: 'test-sessions',
    label: 'Sessions',
    href: '/dashboard/drills/sessions'  // ← NEW ROUTE
  },
]
```

#### Step 7: Add Backwards-Compatibility Redirect

In `src/app/dashboard/testing/page.tsx`, replace content:

```tsx
// AFTER: Redirect to new drills route
import { redirect } from 'next/navigation'

export default function TestingPage() {
  redirect('/dashboard/drills/sessions')
}
```

### 2.4 Type Safety Considerations

> **Warning: Schema Drift Risk**
> - The `RawSession` interface in `ReviewHub.tsx` must remain in sync with the actual Supabase query
> - Any column changes must be reflected in BOTH files

**Recommended:** Extract shared type to a central location:

```tsx
// File: src/types/testing.ts (if not already)
export interface SessionRow {
  session_id: string
  test_mode: string
  config: { /* ... */ } | null
  status: string
  question_ids: string[] | null
  started_at: string
  completed_at: string | null
  current_question_index: number
  updated_at: string
  accuracy?: number | null
}
```

---

## 3. Design Endurance Autopsy (DEEP ANALYSIS)

### 3.1 The Problem Statement

> **Current Behavior:** The "Design Endurance" mode link in `ReviewHub.tsx` routes to `/quiz/extended/setup`, but the session starts with `mode: 'custom'` — the mode distinction is **completely lost** in the execution chain.

### 3.2 Complete Execution Flow Trace

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DESIGN ENDURANCE MODE FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: User clicks "Start Endurance Training"                             │
│  ────────────────────────────────────────────────────                        │
│  File: ReviewHub.tsx (line 484-489)                                         │
│  <Link href="/quiz/extended/setup">...</Link>                              │
│                                                                          │
│  ▼                                                                          │
│  STEP 2: Navigate to /quiz/extended/setup                               │
│  ────────────────────────────────────────────────────                        │
│  Route exists? Check src/app/quiz/extended/setup/page.tsx                │
│  Note: This may not exist — need to verify                                │
│                                                                          │
│  ▼                                                                          │
│  STEP 3: Render setup page (HeroConfigurator or custom?)                  │
│  ────────────────────────────────────────────────────                        │
│  If setup page uses HeroConfigurator:                                      │
│  - HeroConfigurator.tsx line 77: mode: 'custom' ← PROBLEM!               │
│                                                                          │
│  ▼                                                                          │
│  STEP 4: Call startSession                                               │
│  ────────────────────────────────────────────────────                        │
│  File: src/lib/actions/quiz-v2/index.ts or start-session.ts              │
│  startSession({ mode: 'custom', config: { ... } })                        │
│                                                                          │
│  ▼                                                                          │
│  STEP 5: Server action processes mode                                     │
│  ────────────────────────────────────────────────────                        │
│  Does start-session.ts check for 'extended' mode?                        │
│  Does it have special logic for endurance sessions?                       │
│  Likely: NO — mode 'custom' is used, endurance behavior not triggered    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Investigation Required (BEFORE IMPLEMENTATION)

| Checkpoint | File to Verify | What to Look For |
|------------|---------------|------------------|
| Setup page exists? | `src/app/quiz/extended/setup/page.tsx` | Route definition |
| Setup uses custom flow? | Same file | How it calls startSession |
| start-session.ts handles 'extended'? | `src/lib/actions/quiz-v2/start-session.ts` | Mode switch statement |
| Database has 'extended' mode enum? | `DATABASE_SCHEMA.sql` | quiz_sessions.test_mode values |
| Intelligent routing handles endurance? | `src/lib/quiz/intelligent-routing.ts` | Long-form question fetching |

### 3.4 Proposed Fix Architecture

**Option A: Fix at HeroConfigurator (If used for endurance)**

```tsx
// HeroConfigurator.tsx - Add mode prop or detect from route
const isEnduranceMode = pathname.includes('/extended')

const handleStart = async () => {
  const result = await startSession({
    mode: isEnduranceMode ? 'extended' : 'custom',  // ← PROPER MODE
    config: { /* ... */ }
  })
}
```

**Option B: Create Dedicated EnduranceConfigurator**

If extended mode has fundamentally different UX requirements:

```tsx
// src/components/testing/hub/EnduranceConfigurator.tsx
// - Different slider ranges (longer timeouts)
// - Different question routing (long-form design questions)
// - Different timer behavior (stamina tracking)
```

**Option C: Fix at Route Level**

Create `/quiz/extended/setup/page.tsx` that explicitly passes mode:

```tsx
// This setup page should call:
startSession({
  mode: 'extended',  // ← NOT 'custom'
  config: {
    isEnduranceSession: true,  // ← Additional flag
    // ...
  }
})
```

### 3.5 Database Schema Verification Required

> **Warning: Enum Mismatch Risk**
> - Check `quiz_sessions.test_mode` column in `DATABASE_SCHEMA.sql`
> - If 'extended' is not a valid enum value, the insert will fail or default to 'custom'
> - **Action:** Run migration to add 'extended' to test_mode enum if missing

---

## 4. Dev-Mode Unlocking Logic

### 4.1 Full Exam Simulation Gate Deep-Dive

**Gate Location:** `src/components/testing/hub/ReviewHub.tsx` lines 176-185

```tsx
const computeSimulationGate = (readinessScore: number): SimulationGateStatus => {
  const required = 65
  return {
    isUnlocked: readinessScore >= required,  // ← GATE LOGIC
    currentReadiness: readinessScore,
    requiredReadiness: required,
    hasEnduranceCalibration: false,
    pointsNeeded: Math.max(0, required - readinessScore),
  }
}
```

**Call Sites:**

| Location | File | Line | Usage |
|----------|------|------|-------|
| Conditional render | `ReviewHub.tsx` | 461-472 | Show locked/unlocked button |
| - | - | - | - |

### 4.2 Dev-Mode Bypass Implementation

> **Warning: Security Considerations**
> - `NODE_ENV === 'development'` is the standard React environment check
> - This ONLY works in local dev — not in preview deployments
> - For preview/production dev access, use a feature flag env var

#### Recommended Implementation

```tsx
// src/components/testing/hub/ReviewHub.tsx

// ADD at top of file (after imports):
const isDevEnvironment = process.env.NODE_ENV === 'development'
// OR use feature flag:
const isDevBypassEnabled = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

// MODIFY computeSimulationGate (lines 176-185):
const computeSimulationGate = (readinessScore: number): SimulationGateStatus => {
  const required = 65

  // Dev bypass: Allow full access in development
  const bypassEnabled = isDevEnvironment || isDevBypassEnabled

  return {
    isUnlocked: bypassEnabled || readinessScore >= required,
    currentReadiness: readinessScore,
    requiredReadiness: required,
    hasEnduranceCalibration: false,
    pointsNeeded: Math.max(0, required - readinessScore),
  }
}
```

### 4.3 Extended Bypass Locations (Tier Gating Ecosystem)

> **Critical: There are MULTIPLE tier gates — bypass must be consistent**

| Location | Type | File | Current Behavior |
|----------|------|------|------------------|
| Server Action | Backend | `src/lib/actions/quiz-v2/start-session.ts` | Checks subscription tier |
| Context Provider | Client | `src/lib/context/tier-context.tsx` | Provides tier to components |
| Middleware | Edge | `src/lib/supabase/middleware.ts` | Route-level auth |
| UI Component | Client | `ReviewHub.tsx` | 65-readiness gate |

**Unified Bypass Pattern:**

For **server-side actions** (add to `start-session.ts`):

```tsx
// At top of startSession function
if (process.env.NODE_ENV === 'development') {
  // Skip tier validation in dev
  // Log for traceability
  console.log('[DEV] Bypassing tier check for testing')
}
```

For **middleware** (more complex, consider adding `x-dev-bypass` header for local testing):

```tsx
// src/lib/supabase/middleware.ts
const isDevRequest = process.env.NODE_ENV === 'development' &&
  request.headers.get('x-dev-bypass') === 'true'

if (isDevRequest) {
  // Allow through without full auth
}
```

---

## 5. Nomenclature & Import Map (TESTING → DRILLS)

### 5.1 Directory Renaming Strategy

> **Warning: Breaking Change Implications**
> - Renaming affects all internal imports
> - External links (bookmarks, cached URLs) will break
> - Need backwards-compatibility redirects

| Old Path | New Path | Breaking? | Redirect Required? |
|----------|----------|-----------|-------------------|
| `src/app/dashboard/testing/` | `src/app/dashboard/drills/` | YES | YES |
| `src/components/testing/` | `src/components/drills/` | YES | NO (internal) |

### 5.2 Files Requiring Content Updates (EXHAUSTIVE)

| Priority | File | Specific Change | Line(s) |
|----------|------|-----------------|---------|
| **P0** | `src/components/sidebar/sidebar-constants.ts` | `label: 'Testing & Review'` → `'Drills'`, `href` update | 42-53 |
| **P0** | `src/lib/constants/routes.ts` | Add `DRILLS` constant | TBD |
| **P0** | `src/lib/routes.ts` | Add `/dashboard/drills` route | TBD |
| **P1** | `CLAUDE.md` | Full text search/replace | N/A |
| **P1** | `src/app/dashboard/testing/AGENTS.md` | Rename file + content | ALL |
| **P1** | `src/app/dashboard/testing/layout.tsx` | Update title/description metadata | 4-5 |
| **P1** | `src/app/dashboard/testing/page.tsx` | Redirect to new location | 1-104 |
| **P2** | `README.md` | Route references | TBD |
| **P2** | `.ai/docs/portal/*.md` | Any mentions | TBD |

### 5.3 Complete Import Reference Map (17 Files)

```
FULL PATH → REFERENCED STRING
────────────────────────────────────────────────────────────────────────

src/storybook/scenes/wiki/WikiArticleScene.stories.tsx → "/dashboard/testing"
src/lib/actions/sessions.ts → "/dashboard/testing"
src/lib/actions/session-actions.ts → "/dashboard/testing"
src/lib/routes.ts → "/dashboard/testing"
src/lib/actions/quiz-v2/generate-recommendations.ts → "/dashboard/testing"
src/lib/actions/quiz-v2/abandon-session.ts → "/dashboard/testing"
src/lib/constants/routes.ts → "/dashboard/testing"
src/lib/actions/dashboard.ts → "/dashboard/testing"
src/app/dashboard/studio/_components/StudioHub.tsx → "/dashboard/testing"
src/components/wiki/navigation/WikiRightSidebar.stories.tsx → "/dashboard/testing"
src/app/dashboard/cram-card/_components/CramCardGate.tsx → "/dashboard/testing"
src/components/sidebar/sidebar-constants.ts → "/dashboard/testing"
src/components/dashboard/SubjectRadarChart.tsx → "/dashboard/testing"
src/components/dashboard/SubjectMasteryCard.tsx → "/dashboard/testing"
src/components/dashboard/SubjectFloorAlert.tsx → "/dashboard/testing"
src/components/dashboard/ReviewCalendar.tsx → "/dashboard/testing"
src/components/analytics/WeakestTopics.tsx → "/dashboard/testing"
```

### 5.4 Database Considerations

> **Warning: Hardcoded Routes in Database**
> - Check if any `quiz_sessions.config` JSON contains `/dashboard/testing` strings
> - If found, these will break until migrated
> - **Action:** Run migration to update stored config strings (if applicable)

```sql
-- Check for hardcoded paths in quiz_sessions
SELECT session_id, config
FROM quiz_sessions
WHERE config::text LIKE '%/dashboard/testing%'
LIMIT 10;
```

---

## 6. Pre-Flight Checklist (GRANULAR)

### Phase 1: Route & Nomenclature (Priority: HIGH)

| # | Action | File | Verification |
|---|--------|------|---------------|
| 1.1 | Create `src/app/dashboard/drills/` directory | N/A | `ls src/app/dashboard/drills/` |
| 1.2 | Move `page.tsx` → `drills/page.tsx` | N/A | File exists |
| 1.3 | Move `layout.tsx` → `drills/layout.tsx` | N/A | File exists |
| 1.4 | Move `loading.tsx` → `drills/loading.tsx` | N/A | File exists |
| 1.5 | Update `sidebar-constants.ts` label | `sidebar-constants.ts:46` | Label shows "Drills" |
| 1.6 | Update `sidebar-constants.ts` href | `sidebar-constants.ts:45` | Href = `/dashboard/drills` |
| 1.7 | Add child route in `sidebar-constants.ts` | `sidebar-constants.ts:52` | Child href = `/dashboard/drills/sessions` |
| 1.8 | Add `/dashboard/drills` to `routes.ts` | `src/lib/routes.ts` | Route constant exists |
| 1.9 | Add `/dashboard/drills` to `constants/routes.ts` | `src/lib/constants/routes.ts` | ROUTES.DRILLS exists |
| 1.10 | Add redirect in `testing/page.tsx` | `testing/page.tsx:1` | Redirects to `/dashboard/drills` |
| 1.11 | Run `bun run build` | Root | No route errors |

### Phase 2: Sessions Extraction (Priority: HIGH)

| # | Action | File | Verification |
|---|--------|------|---------------|
| 2.1 | Create `drills/sessions/page.tsx` | New file | File exists |
| 2.2 | Create `drills/sessions/loading.tsx` | New file | Skeleton renders |
| 2.3 | Copy session query to new page | `drills/sessions/page.tsx` | Data fetches |
| 2.4 | Import `SessionsTable` | `drills/sessions/page.tsx` | No import errors |
| 2.5 | Remove `SessionsTable` import | `ReviewHub.tsx:7` | Import gone |
| 2.6 | Remove SessionsTable JSX | `ReviewHub.tsx:506-515` | Component gone |
| 2.7 | Navigate to `/dashboard/drills/sessions` | Browser | Table renders |

### Phase 3: UI Fixes (Priority: HIGH)

| # | Action | File | Verification |
|---|--------|------|---------------|
| 3.1 | Remove `mx-auto max-w-[960px]` | `ReviewHub.tsx:304` | Class updated |
| 3.2 | Verify full-width on desktop | Browser | No centering |
| 3.3 | Verify no overflow on mobile | Browser | No horizontal scroll |

### Phase 4: Core Triad Validation (Priority: MEDIUM)

| # | Action | File | Verification |
|---|--------|------|---------------|
| 4.1 | Verify `/quiz/extended/setup` exists | `src/app/quiz/extended/setup/` | Route works |
| 4.2 | Test Design Endurance flow | Browser | Session starts with mode='extended' |
| 4.3 | Debug mode loss in startSession | `start-session.ts` | Mode preserved |
| 4.4 | Verify Full Exam Simulation gate | Browser | Unlocks at 65 readiness |
| 4.5 | Test dev-mode bypass | Dev server | Bypass works |

### Phase 5: Dev-Mode Bypass (Priority: MEDIUM)

| # | Action | File | Verification |
|---|--------|------|---------------|
| 5.1 | Add `NODE_ENV` check to `computeSimulationGate` | `ReviewHub.tsx:176` | Bypass works |
| 5.2 | Add bypass to `start-session.ts` (optional) | `src/lib/actions/quiz-v2/` | Server allows dev |
| 5.3 | Test in dev environment | Dev server | Dev user sees unlocked |
| 5.4 | Test in prod environment | Prod | Normal gating applies |

### Phase 6: Documentation & Cleanup (Priority: LOW)

| # | Action | File | Verification |
|---|--------|------|---------------|
| 6.1 | Update `CLAUDE.md` references | `CLAUDE.md` | No "Testing & Review" |
| 6.2 | Rename `testing/AGENTS.md` → `drills/AGENTS.md` | N/A | File renamed |
| 6.3 | Archive old `testing/` contents | `src/app/dashboard/testing/` | Cleared or deleted |
| 6.4 | Run `bun run lint` | Root | No errors |
| 6.5 | Run `bun run build` | Root | Full build passes |

---

## Appendix: Key File Locations (QUICK REFERENCE)

| Component | File Path | Lines |
|-----------|-----------|--------|
| Sidebar Nav Item | `src/components/sidebar/SidebarNavItem.tsx` | 38-53, 158-179 |
| Sidebar Config | `src/components/sidebar/sidebar-constants.ts` | 42-53 |
| Testing Hub Page | `src/app/dashboard/testing/page.tsx` | 1-104 |
| Testing Layout | `src/app/dashboard/testing/layout.tsx` | 1-12 |
| Review Hub | `src/components/testing/hub/ReviewHub.tsx` | 176-185, 303-306, 461-472 |
| Hero Configurator | `src/components/testing/hub/HeroConfigurator.tsx` | 68-120 |
| Sessions Table | `src/components/testing/hub/SessionsTable.tsx` | 1-50 |
| Routes | `src/lib/constants/routes.ts` | TBD |
| Quiz Start Action | `src/lib/actions/quiz-v2/start-session.ts` | TBD |

---

*End of Audit v2 — Ready for Implementation*
