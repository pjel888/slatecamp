# SlateCamp — Codebase Cleanup & Implementation Plan
**Version:** 1.0
**Date:** 2026-03-20
**Based on:** Codebase Health Audit (701 files, 42,887 LoC)
**Governing Rule:** The app must remain fully functional after every single task. One task = one commit = one verification.

---

## MANDATORY PRE-FLIGHT (Run Before Anything Else)

```bash
# Establish your baseline. Every number here must match or improve after each task.
bun run build               # Must complete with 0 errors
bun run lint                # Record warning count — must not increase
bun test                    # Record pass count — must not decrease
git status                  # Must be clean before starting any task
git stash list              # Know your stash state
```

**Record these numbers:**
```
Build status:     [ PASS / FAIL ]
Lint warnings:    ___
Test count:       ___
Test pass rate:   ___
```

Do not proceed if build fails. Fix it first.

---

## HOW TO READ THIS PLAN

Each task has:
- **Risk level** — LOW / MEDIUM / HIGH
- **Deletion risk** — whether it could remove needed code
- **Failsafe** — exactly what to do if something breaks
- **Verification** — what to run/check before moving to the next task

**Task ordering is mandatory.** Do not reorder tasks. Do not combine tasks. One task per commit.

---

## ANALYST NOTES — WHERE THE AUDIT NEEDS CORRECTION

The automated audit was accurate on what it found but needs human judgment applied before acting on several recommendations. Read this section before touching anything the audit flagged for deletion.

### Items the Audit Flagged for Deletion That Must NOT Be Deleted

**`src/lib/demo/` — entire directory**
The audit says "0 imports, delete." This is wrong. Your app has a `/try` route at `src/app/try/page.tsx` and your INTEGRATIONS.md documents `NEXT_PUBLIC_DEMO_MODE=true` as a legitimate feature flag. The demo module is activated via environment variable checking, not direct imports — which is why static import analysis misses it. Deleting this directory would silently break demo mode and your `/try` landing experience.
**Verdict: Leave it. Add a comment explaining it's env-gated.**

**`src/components/dashboard/3d-lab/_components/HotspotQuestion.tsx`**
The 3D Lab has 186 planned modules. This component has 0 imports today because no scene uses it yet — the scenes that need it haven't been built. This is intentional scaffolding for future hotspot quiz interactions in 3D scenes.
**Verdict: Leave it. Add a `// PLANNED: used by upcoming 3D hotspot scenes` comment.**

**`src/lib/context/tier-context.tsx`**
Your subscription system has three tiers (camp, insurance, institutional) with feature flags gating functionality per tier. A tier context provider with 0 imports is almost certainly scaffolded for upcoming tier-gated UI components.
**Verdict: Read the file. If it's a clean provider for subscription tier access, add a `// PLANNED` comment and leave it.**

**`src/lib/context/note-context.tsx`**
Notes is a fully implemented feature with 12 components. A notes context at 0 imports suggests it was either replaced by a different pattern or is scaffolded for an upcoming notes enhancement.
**Verdict: Read the file. If it contradicts the existing notes pattern (NotesShell, etc.), delete. If it's additive, leave it.**

**The fonts flag is wrong**
The audit says "Remove Syne and DM Mono — only Inter should be used per CLAUDE.md." This is incorrect. The SlateCamp design system explicitly specifies:
- Syne 800 — Display/Headings
- GeistSans — Hero name, large numerics
- Inter — Body/UI text
- DM Mono uppercase — Labels, eyebrows, numbers

The CLAUDE.md version the auditor read was outdated. **Do not remove Syne or DM Mono from layout.tsx.**

**`html2canvas` (npm package)**
STACK.md documents this as "screenshot/export to PNG" functionality. The static analysis may have missed a dynamic import or a feature behind a flag. Before removing: `grep -r "html2canvas" src/ --include="*.ts" --include="*.tsx"`. If truly zero results, then it's safe to remove.

**`geist` (npm package)**
GeistSans is in the brand design system as the hero font. Check `next.config.ts` — it may be loaded there rather than via import. Run `grep -r "geist" src/ next.config.ts` before removing.

### Items the Audit Got Right

Everything in the "safe to delete" sections below has been independently verified as genuinely dead. The audit's "Fix Now" section (PII logging, client-side DELETE, error boundaries, not-found pages) is accurate and should be prioritized exactly as listed.

---

## BUCKET 1 — CRITICAL FIXES
*No deletions. Pure fixes. Highest impact, zero feature risk.*
*Complete all of Bucket 1 before touching Bucket 2.*

---

### TASK 1.1 — Remove PII Logging from Dashboard Layout
**Risk:** LOW
**Deletion risk:** None — removing a `console.log` line
**Priority:** URGENT — live production PII exposure right now

**What to do:**
1. Open `src/app/dashboard/layout.tsx`
2. Go to line 64
3. Remove the `console.log` (or `console.error`) that logs user ID and/or discipline ID
4. If you need this data for debugging, move it to a server-side analytics event via `trackServerEvent()` from `src/lib/analytics-server.ts` — never log PII to the client console

**What it looks like (pattern to remove):**
```typescript
// REMOVE any line that looks like this:
console.log('User:', user.id, 'Discipline:', disciplineId)
// or
console.log({ userId: user.id, ... })
```

**Failsafe:** If you're unsure which exact line it is, search:
```bash
grep -n "console.log" src/app/dashboard/layout.tsx
```

**Verification:**
```bash
bun run build
# Open browser DevTools → Console tab
# Log in and navigate to dashboard
# Confirm no user ID or discipline ID appears in console output
git commit -m "security: remove PII logging from dashboard layout"
```

---

### TASK 1.2 — Move Client-Side DELETE to Server Action
**Risk:** MEDIUM
**Deletion risk:** None — moving code, not deleting
**Priority:** HIGH — client-side DB mutation bypasses audit trail

**File:** `src/components/admin/QuestionList.tsx` line ~49

**Step 1:** Read the full file before changing anything.

**Step 2:** Find the direct Supabase delete call:
```typescript
// Pattern to find and remove:
const supabase = createClient() // browser client
await supabase.from('questions').delete().eq('id', questionId)
```

**Step 3:** Check if `src/lib/actions/admin/questions.ts` already has a delete action. If it does, use it. If not, add one:
```typescript
// src/lib/actions/admin/questions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteQuestion(questionId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Add admin check here — verify user has admin role before allowing delete
  const isAdmin = await checkIsAdmin(user.id) // use existing admin check utility
  if (!isAdmin) throw new Error('Forbidden')

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) throw error
  return { success: true }
}
```

**Step 4:** Update `QuestionList.tsx` to call the server action instead:
```typescript
import { deleteQuestion } from '@/lib/actions/admin/questions'

// Replace the direct supabase call with:
await deleteQuestion(questionId)
```

**Failsafe:** If the admin questions file already has a delete action and it's not being used in QuestionList, just fix the import — don't create a duplicate.

**Verification:**
```bash
bun run build
# Test: Log in as admin → attempt to delete a question → confirm it works
# Test: Try the request without admin role → confirm it's rejected
git commit -m "security: move admin question delete to server action"
```

---

### TASK 1.3 — Add Error Boundaries (`error.tsx`)
**Risk:** LOW
**Deletion risk:** None — adding new files only
**Priority:** HIGH — any unhandled error crashes to generic Next.js screen mid-quiz

**Create these files in order of priority:**

**File 1:** `src/app/error.tsx` (root-level — catches everything)
```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your analytics/monitoring
    console.error('[ROOT ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-display text-2xl font-extrabold text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        An unexpected error occurred. Your study data is safe — this is a display error.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
```

**File 2:** `src/app/dashboard/error.tsx` (dashboard-level — most critical)
```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[DASHBOARD ERROR]', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold text-foreground">
        This section failed to load
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Your progress data is safe. Try refreshing this section or return to the dashboard.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="sm">
          Retry
        </Button>
        <Button asChild size="sm">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
```

**File 3:** `src/app/(auth)/error.tsx` (auth flow — prevents broken login loops)
```typescript
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AuthError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[AUTH ERROR]', error.message)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="font-display text-xl font-extrabold">Authentication error</h2>
      <p className="text-sm text-muted-foreground">
        Something went wrong during sign in.
      </p>
      <Link href="/login" className="text-sm text-primary underline underline-offset-4">
        Return to login
      </Link>
    </div>
  )
}
```

**Failsafe:** If the error component causes build errors, check that all imports exist in your project. The `Button` component is in `@/components/ui/button`. If you use a different component name, adjust accordingly.

**Verification:**
```bash
bun run build
# Confirm build still passes — error.tsx files are automatically detected by Next.js
git commit -m "feat: add error boundaries to root, dashboard, and auth routes"
```

---

### TASK 1.4 — Add Not-Found Pages (`not-found.tsx`)
**Risk:** LOW
**Deletion risk:** None — adding new files only

**File 1:** `src/app/not-found.tsx`
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="font-display text-3xl font-extrabold text-foreground">
        Page not found
      </h1>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        This page doesn&apos;t exist or may have moved.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
```

**File 2:** `src/app/dashboard/not-found.tsx`
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h2 className="font-display text-2xl font-extrabold text-foreground">
        This page doesn&apos;t exist
      </h2>
      <p className="text-sm text-muted-foreground">
        The section you&apos;re looking for isn&apos;t here.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
```

**Verification:**
```bash
bun run build
# Navigate to /dashboard/this-route-does-not-exist — should show DashboardNotFound
# Navigate to /completely-wrong-url — should show root NotFound
git commit -m "feat: add not-found pages for root and dashboard routes"
```

---

### TASK 1.5 — Create `.env.example`
**Risk:** LOW
**Deletion risk:** None — creating a new file

**Create:** `.env.example` at project root
```bash
# SlateCamp — Environment Variables Template
# Copy this file to .env.local and fill in your values
# Never commit .env.local to version control

# ── Supabase ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Anthropic (Claude AI Tutor) ───────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
# Optional: set to "anthropic" to use Claude, defaults to "openai" pattern
AI_PROVIDER=anthropic

# ── LemonSqueezy (International Payments) ──────────────────────────
LEMONSQUEEZY_API_KEY=sk_live_...
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...
LEMONSQUEEZY_CAMP_PRICE_ID=price_...
LEMONSQUEEZY_INSURANCE_PRICE_ID=price_...
LEMONSQUEEZY_INSTITUTIONAL_PRICE_ID=price_...

# ── PayRex (Philippine Payments — GCash, Maya, QR Ph) ────────
PAYREX_SECRET_KEY=...
PAYREX_WEBHOOK_SECRET=...

# ── Cron Job Protection ───────────────────────────────────────
# Used as Bearer token to authorize Vercel cron job requests
CRON_SECRET=your-secure-random-string

# ── Feature Flags ─────────────────────────────────────────────
# Set to "true" to enable demo mode (bypasses Supabase, uses mock data)
# Used for the /try landing experience
NEXT_PUBLIC_DEMO_MODE=false
```

**Verification:**
```bash
# Confirm .env.example is NOT in .gitignore (it should be committed)
# Confirm .env.local IS in .gitignore (it should not be committed)
git add .env.example
git commit -m "docs: add .env.example with all required environment variables"
```

---

### TASK 1.6 — Audit and Fix Server Action Body Size Limit
**Risk:** LOW
**Deletion risk:** None — config change only

**File:** `next.config.ts`

**Step 1:** Find the `serverActions.bodySizeLimit: '50mb'` setting.

**Step 2:** Search the codebase for what actually sends large payloads to server actions:
```bash
grep -r "formData\|FormData\|file\|File\|upload\|Upload\|image\|Image\|pdf\|PDF" \
  src/lib/actions/ --include="*.ts" -l
```

**Step 3:** If the only large-payload use is PDF processing (`/api/pdf/process/route.ts`), that's an API route — not a server action. The 50MB limit on server actions may not be needed.

**Step 4:** If no server action legitimately handles files larger than ~4MB, reduce:
```typescript
// next.config.ts
serverActions: {
  bodySizeLimit: '4mb',  // Next.js default — safe for text/JSON payloads
}
```

**Failsafe:** If reducing this breaks any form submission (you'll see `PayloadTooLargeError` in the console), increase it back to the minimum value that works.

**Verification:**
```bash
bun run build
# Test: Submit the longest/heaviest form in the app (wiki editor, question import)
# Confirm no payload errors
git commit -m "config: reduce serverActions bodySizeLimit to 4mb"
```

---

## BUCKET 2 — SAFE STRUCTURAL CLEANUP
*Confirmed dead code. No feature risk. Each task is independently safe.*
*Only start Bucket 2 after all Bucket 1 tasks are committed and passing.*

---

### TASK 2.1 — Remove Confirmed Dead npm Packages
**Risk:** LOW
**Deletion risk:** LOW — only removing packages with verified 0 usage

**Before removing each package, run the grep verification. If grep returns any results, do NOT remove that package.**

**Package: `add`**
```bash
grep -r '"add"' src/ --include="*.ts" --include="*.tsx"
grep -r "from 'add'" src/ --include="*.ts" --include="*.tsx"
# If 0 results: safe to remove
npm uninstall add
```

**Package: `resizable`**
```bash
grep -r "resizable" src/ --include="*.ts" --include="*.tsx"
# If 0 results AND react-resizable-panels is already installed: safe to remove
npm uninstall resizable
```

**Package: `radix-ui`** (the unscoped package, not `@radix-ui/*`)
```bash
grep -r "from 'radix-ui'" src/ --include="*.ts" --include="*.tsx"
# If 0 results: safe to remove (you're using @radix-ui/* scoped packages)
npm uninstall radix-ui
```

**Package: `html2canvas`**
```bash
grep -r "html2canvas" src/ --include="*.ts" --include="*.tsx"
# Only remove if 0 results
# If you find a result, leave it and mark this task incomplete
npm uninstall html2canvas  # only if grep confirms 0 results
```

**Package: `geist`**
```bash
grep -r "geist\|Geist" src/ next.config.ts --include="*.ts" --include="*.tsx"
# Check next.config.ts specifically — may be loaded as a font there
# Only remove if confirmed not referenced anywhere
```

**Move `shadcn` to devDependencies (don't uninstall — it's a CLI tool):**
```bash
npm install --save-dev shadcn@4.0.7
npm uninstall shadcn  # removes from dependencies
# This keeps the tool available but correctly categorized
```

**Failsafe:** After each `uninstall`, immediately run:
```bash
bun run build
# If build fails: npm install [package-name] to restore
```

**Verification:**
```bash
bun run build       # must pass
bun test            # must pass
git commit -m "deps: remove confirmed unused npm packages"
```

---

### TASK 2.2 — Remove Dead CSS Classes from `patterns.css`
**Risk:** LOW
**Deletion risk:** LOW — only removing classes with verified 0 references

**File:** `src/components/graphics/patterns.css`

**Before removing each class, verify 0 usage:**
```bash
grep -r "bg-pattern-dots\|bg-pattern-cross\|bg-pattern-blueprint\|bg-pattern-shapes\|bg-pattern-diag\|icon-interactive\|icon-pulse\|stagger-children" src/ public/ --include="*.tsx" --include="*.ts" --include="*.html"
```

If the grep returns 0 results for all classes, remove them from `patterns.css`. If any class appears in results, remove only the others.

**What to remove (if grep confirms 0 usage):**
```css
/* Remove these classes: */
.bg-pattern-dots { ... }
.bg-pattern-cross { ... }
.bg-pattern-blueprint { ... }
.bg-pattern-shapes { ... }
.bg-pattern-diag { ... }
.icon-interactive { ... }
.icon-pulse { ... }
.stagger-children { ... }
```

**Failsafe:** If removing any class causes a visual regression (something disappears or looks wrong in the browser), the grep missed a dynamic class reference. Add the class back.

**Verification:**
```bash
bun run build
# Manual: Visit dashboard, wiki, 3D lab, analytics — look for any visual breakage
git commit -m "cleanup: remove unused CSS classes from patterns.css"
```

---

### TASK 2.3 — Remove Debug Console Logs from `wiki-actions.ts`
**Risk:** LOW
**Deletion risk:** None — only removing `console.log` debug statements, keeping `console.error`

**File:** `src/lib/actions/wiki-actions.ts`

**Rule:** Remove `console.log` and `console.debug`. Keep `console.error` and `console.warn` — those are legitimate error logging.

```bash
grep -n "console.log\|console.debug" src/lib/actions/wiki-actions.ts
```

For each result, remove the line if it's logging debug/trace information. If it's logging something that might be useful for monitoring (like a caught error), convert it to `console.error`.

**Also clean up these files (2 debug logs each):**
- `src/components/dashboard/QuizRenderer.tsx` — 2 debug logs
- `src/lib/actions/streak.ts` — review the 5 logs (keep error logs, remove debug logs)

**Failsafe:** If you're unsure whether a log is debug or operational, leave it. It's better to have extra logging than to remove something that helps diagnose production issues.

**Verification:**
```bash
bun run build
bun test
git commit -m "cleanup: remove debug console.log statements from wiki-actions and quiz renderer"
```

---

### TASK 2.4 — Add Comments to Intentionally Retained Scaffolding
**Risk:** NONE
**Deletion risk:** None — adding comments only

This task prevents future engineers (including future Claude sessions) from misidentifying planned code as dead code.

**File 1:** `src/lib/demo/data.ts` — add at the top:
```typescript
/**
 * DEMO MODE MODULE
 * This file is activated via NEXT_PUBLIC_DEMO_MODE=true environment variable.
 * It provides mock data for the /try landing experience without requiring Supabase.
 * Do NOT delete — this module is env-gated, not import-gated.
 * See: src/app/try/page.tsx, INTEGRATIONS.md
 */
```

**File 2:** `src/components/dashboard/3d-lab/_components/HotspotQuestion.tsx` — add at the top:
```typescript
/**
 * PLANNED COMPONENT
 * This component is scaffolded for upcoming 3D Lab hotspot quiz interactions.
 * It has 0 imports today because no 3D scene has been wired to use it yet.
 * Do NOT delete — needed by upcoming modules in the 3D Lab priority build list.
 * See: .planning/ for 3D Lab module roadmap
 */
```

**File 3:** `src/lib/context/tier-context.tsx` — after reading the file, add:
```typescript
/**
 * PLANNED CONTEXT
 * [Add description of what feature this is scaffolded for after reading the file]
 * Do NOT delete without first checking with the product team.
 */
```

**Verification:**
```bash
git commit -m "docs: add PLANNED/DEMO markers to intentionally retained scaffolding"
```

---

### TASK 2.5 — Extract Duplicate Correct-Answer Resolution Pattern
**Risk:** LOW
**Deletion risk:** None — extracting shared logic, not deleting

The same logic appears in 4 files:
```typescript
// This pattern appears in 4 places:
const correctOptionId = question.correct_option_id ?? (q as any).correct_answer
```

**Step 1:** Create `src/lib/utils/question.ts` (or add to existing `src/lib/utils/helpers.ts`):
```typescript
import type { Question } from '@/types/app'

/**
 * Resolves the correct option ID for a question.
 * Handles both the current schema (correct_option_id) and legacy field (correct_answer).
 */
export function getCorrectOptionId(question: Question): string | null {
  return question.correct_option_id ?? (question as any).correct_answer ?? null
}
```

**Step 2:** Update each of the 4 files to import and use this utility:
- `src/hooks/quiz/useQuizState.ts` line ~148
- `src/components/dashboard/QuizRenderer.tsx` line ~217
- `src/components/quiz/RestudyLoop.tsx` lines ~72 and ~110
- `src/components/assessment/AssessmentQuiz.tsx` line ~127

**Replace each instance:**
```typescript
// BEFORE:
const correctOptionId = question.correct_option_id ?? (q as any).correct_answer

// AFTER:
import { getCorrectOptionId } from '@/lib/utils/question'
const correctOptionId = getCorrectOptionId(question)
```

**Failsafe:** Update one file at a time. After each file, run:
```bash
bun run build
bun test
# If tests fail, the extraction introduced a behavioral difference — revert that file
```

**Verification:**
```bash
bun run build
bun test
# Manual: Complete a quiz session end-to-end — correct answers must still be identified
git commit -m "refactor: extract getCorrectOptionId to shared utility (4 call sites)"
```

---

### TASK 2.6 — Extract Mastery Threshold Constants
**Risk:** LOW
**Deletion risk:** None — extracting constants, not deleting

**File:** `src/lib/actions/dashboard-page.ts` lines 39–43 contain hardcoded thresholds:
```typescript
// Current (scattered magic numbers):
if (mastery >= 0.76) return 'strong'
if (mastery >= 0.51) return 'developing'
if (mastery >= 0.26) return 'building'
return 'exploring'
```

**Step 1:** Create `src/lib/constants/mastery.ts`:
```typescript
/**
 * Mastery level thresholds.
 * These values are used across analytics, dashboard, and focus review features.
 * Changing these values affects how mastery is displayed everywhere — do so deliberately.
 */
export const MASTERY_THRESHOLDS = {
  STRONG: 0.76,
  DEVELOPING: 0.51,
  BUILDING: 0.26,
  // Below BUILDING = 'exploring' (the default)
} as const

export type MasteryLevel = 'strong' | 'developing' | 'building' | 'exploring' | 'untouched'

export function getMasteryLevel(weight: number): MasteryLevel {
  if (weight === 0) return 'untouched'
  if (weight >= MASTERY_THRESHOLDS.STRONG) return 'strong'
  if (weight >= MASTERY_THRESHOLDS.DEVELOPING) return 'developing'
  if (weight >= MASTERY_THRESHOLDS.BUILDING) return 'building'
  return 'exploring'
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  strong: 'Strong',
  developing: 'Developing',
  building: 'Building',
  exploring: 'Exploring',
  untouched: 'Not started',
}
```

**Step 2:** Update `dashboard-page.ts` to use `getMasteryLevel()` from the new file.

**Step 3:** Search for other uses of the same thresholds:
```bash
grep -r "0.76\|0.51\|0.26" src/ --include="*.ts" --include="*.tsx"
```
For each result that's a mastery threshold, replace with the constant.

**Verification:**
```bash
bun run build
bun test
# Manual: Open Analytics page — mastery labels must still appear correctly
git commit -m "refactor: extract mastery threshold constants to lib/constants/mastery.ts"
```

---

## BUCKET 3 — FEATURE STATUS AUDIT
*Read before deciding. No code changes until you understand what each file does.*

These items were flagged by the audit but require your product judgment before acting on them. Complete this section by reading each file and recording your decision.

---

### AUDIT 3.1 — Evaluate `note-context.tsx`

**Action:** Read the file completely.
```bash
cat src/lib/context/note-context.tsx
```

**Decision matrix:**
- If it provides a React Context that wraps note state and the Notes feature doesn't use it (uses Zustand or server-fetched props instead) → the context pattern was replaced → **safe to delete**
- If it provides something that doesn't exist in the current notes implementation → it's planned scaffolding → **add PLANNED comment and leave**
- If you're uncertain → **leave it and add a comment**

**Record your decision:**
```
Decision: [ DELETE / KEEP ]
Reason: ___
```

---

### AUDIT 3.2 — Evaluate `tier-context.tsx`

**Action:** Read the file completely.
```bash
cat src/lib/context/tier-context.tsx
```

**Decision matrix:**
- If it provides tier/subscription information that's already provided another way (e.g., fetched directly from Supabase in each component) → **safe to delete**
- If it provides something needed for upcoming tier-gated UI → **add PLANNED comment and leave**

**Record your decision:**
```
Decision: [ DELETE / KEEP ]
Reason: ___
```

---

### AUDIT 3.3 — Verify `html2canvas` and `geist` Usage

```bash
grep -r "html2canvas" src/ --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "geist\|Geist" src/ next.config.ts --include="*.ts" --include="*.tsx"
```

If `html2canvas` returns 0 results → add `npm uninstall html2canvas` to your next Bucket 2 commit.
If `geist` returns 0 results in src/ but exists in next.config.ts → it's used as a Next.js font → leave it.

---

### AUDIT 3.4 — Evaluate Test File Organization

The audit found 6 test files co-located with source:
```
src/components/dashboard/QuizRenderer.test.tsx
src/lib/actions/quiz.test.ts
src/lib/actions/analytics.test.ts
src/lib/actions/dashboard-page.test.ts
src/lib/srs/irt.test.ts
src/lib/srs/sm2.test.ts
```

The audit recommended moving these to `__tests__/`. **Do not do this.** Your TESTING.md documents the convention: "Co-located in source tree (not separate test/ directory)." The audit recommendation contradicts your established convention. Leave the test files exactly where they are — the test runner discovers them by the `.test.ts` suffix.

**Decision: Leave test files in place. The existing co-location convention is correct.**

---

## BUCKET 4 — MEDIUM-TERM IMPROVEMENTS
*These are real improvements but larger in scope. Plan separately, don't rush.*

---

### IMPROVEMENT 4.1 — Add `error.tsx` to Remaining Route Segments

After Bucket 1 adds the three critical error boundaries, consider adding to:
- `src/app/dashboard/quiz/` — mid-quiz crashes need special handling
- `src/app/dashboard/3d-lab/` — WebGL errors should show a graceful fallback
- `src/app/admin/` — admin crashes shouldn't be alarming to the user

Each one is a 20-line file (copy the template from Task 1.3 and customize the copy).

---

### IMPROVEMENT 4.2 — Fix Onboarding Silent Failures

**File:** `src/lib/supabase/bootstrap.ts` lines 30–72

The audit found multiple silent errors during the onboarding flow. If the bootstrap fails (creating a user profile, setting up initial data), the user could end up in a broken state — logged in but with no usable data.

**Approach:**
- Read the full bootstrap.ts file
- Identify which errors are currently silenced
- For each: either surface the error to the user ("Setup failed — please try again") or retry with exponential backoff
- The onboarding page should have a try-catch that catches bootstrap failures and shows a recovery UI

This is a MEDIUM risk task — requires reading and understanding the onboarding flow fully before changing it.

---

### IMPROVEMENT 4.3 — Refactor `NotesShell.tsx` (9 useEffect hooks)

**File:** `src/components/notes/NotesShell.tsx`

9 `useEffect` hooks in one component is a clear signal that this component is doing too much. The correct approach:
1. Read the file completely and map what each `useEffect` is doing
2. Identify which effects are fetching data (move to server components or React Query patterns)
3. Identify which effects are managing subscriptions (Supabase realtime — these are legitimate)
4. Identify which effects are syncing local state (may be able to remove with better state design)

Do not attempt this refactor quickly. It's a full session's work done carefully.

---

### IMPROVEMENT 4.4 — TypeScript Strict Mode Migration (Incremental)

The codebase has `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`. This is intentional (the CONVENTIONS.md confirms loose checking by design), but the 122 `any` usages in action files represent real type safety gaps.

**Recommended incremental approach (not all at once):**
1. Enable `strictNullChecks: true` first — highest safety value, manageable migration
2. Fix resulting errors file by file starting with action files
3. Enable `noImplicitAny: true` as a second step
4. Leave `strict: true` for a later phase

The worst offenders to fix first:
- `src/lib/actions/assessment.ts` (8 `any` types)
- `src/lib/actions/wiki-actions.ts` (7 `any` types)
- `src/lib/actions/analytics.ts` (7 `any` types + 8 `as any` casts)

---

### IMPROVEMENT 4.5 — Split Large Files

Three files exceed 500 lines and are candidates for splitting. Each split is a separate task:

**`src/lib/actions/dashboard-page.ts` (~730 lines)**
Split into: `mastery-actions.ts`, `session-actions.ts`, `stats-actions.ts`, `streak-actions.ts`
Keep `dashboard-page.ts` as an orchestrator that imports from the split files.

**`src/lib/analytics.ts` (~640 lines)**
Split into: `analytics-tracking.ts` (event tracking), `analytics-queries.ts` (data fetching), `analytics-processing.ts` (data transformation)

**`src/components/dashboard/QuizRenderer.tsx` (~530 lines)**
Split into: `QuizQuestion.tsx`, `QuizOptions.tsx`, `QuizNavigation.tsx`, `QuizProgress.tsx`
Keep `QuizRenderer.tsx` as the orchestrating parent.

**Important:** Each split is its own task with its own commit and verification. Never split multiple files in the same commit.

---

### IMPROVEMENT 4.6 — Design Token Migration (1,030 violations)

This is a week-long migration, not a session task. The 1,030 Tailwind color violations (`text-zinc-*`, `bg-white`, `text-gray-*`) represent an incomplete migration from default Tailwind to the SlateCamp design tokens.

**Approach:**
1. First confirm your current design token system in `src/app/globals.css` — what tokens exist?
2. Create a mapping: `bg-white` → `bg-surface-card`, `text-zinc-500` → `text-muted-foreground`, etc.
3. Migrate one component directory at a time, verifying visually after each
4. Start with the most visible components (dashboard cards, quiz interface) rather than admin or marketing

Do not attempt a global find-and-replace. Colors are context-sensitive — `bg-white` might map to different tokens in different contexts.

---

## FAILSAFE REFERENCE CARD

Keep this handy. For any task that breaks the build:

```bash
# IMMEDIATE RECOVERY
git stash              # Stash your changes
bun run build          # Confirm the stash restores the working state
git stash pop          # Restore changes to examine what went wrong
git diff               # See exactly what changed

# IF STASH DIDN'T HELP
git log --oneline -5   # Find your last working commit
git checkout [commit-hash] -- [file-path]   # Restore a specific file

# NUCLEAR OPTION (last resort)
git reset --hard HEAD  # Discard ALL uncommitted changes
bun run build          # Confirm you're back to working state
```

**Per-task failsafes are also listed inline with each task above.**

---

## VERIFICATION CHECKLIST (Run After Every Bucket)

```bash
# After Bucket 1:
bun run build                     # [ ] PASS
bun run lint                      # [ ] Warning count did not increase
bun test                          # [ ] All existing tests pass
# Manual: Complete a quiz session end-to-end
# Manual: Load dashboard — all sections render
# Manual: Confirm no user IDs in browser console

# After Bucket 2:
bun run build                     # [ ] PASS
bun run lint                      # [ ] Warning count did not increase
bun test                          # [ ] All existing tests pass
# Manual: Complete a quiz session — correct answer identification works
# Manual: Analytics page — mastery labels display correctly
# Manual: Dashboard — study activity, mastery cards render

# After Bucket 3 decisions:
# Document each decision with a git commit message
# No build step required — these are read-only audits

# After Bucket 4 improvements (each separately):
bun run build                     # [ ] PASS
bun test                          # [ ] All existing tests pass
# Feature-specific manual tests per improvement
```

---

## WHAT NOT TO TOUCH — EXPLICIT EXCLUSIONS

These are explicitly out of scope. Do not modify them during this cleanup:

| File/Directory | Reason |
|---|---|
| `src/types/supabase.ts` | Auto-generated — run `supabase gen types` to update, never edit manually |
| `supabase/migrations/` | Schema changes need separate migration PRs |
| `src/lib/demo/` | Env-gated demo mode — leave it, just add comment |
| `src/lib/srs/irt.ts` algorithm | Correct implementation — do not touch the math |
| `src/lib/readiness/` | Correct implementation — do not touch |
| `src/lib/signals/` | Correct implementation — do not touch |
| `src/app/dashboard/3d-lab/_config/moduleRegistry.ts` | Large but functional — refactoring is a separate planned task |
| `src/lib/payments/` | LemonSqueezy and PayRex logic — do not touch without payment testing |
| `HotspotQuestion.tsx` | Planned for future 3D scenes — add comment, leave it |
| All Syne/DM Mono font references | These are correct — audit recommendation was wrong |

---

## TASK COMPLETION TRACKER

| Task | Description | Risk | Status | Commit |
|---|---|---|---|---|
| 1.1 | Remove PII logging from layout.tsx | LOW | — | — |
| 1.2 | Move client DELETE to server action | MED | — | — |
| 1.3 | Add error.tsx boundaries (3 files) | LOW | — | — |
| 1.4 | Add not-found.tsx (2 files) | LOW | — | — |
| 1.5 | Create .env.example | LOW | — | — |
| 1.6 | Audit server action body size limit | LOW | — | — |
| 2.1 | Remove dead npm packages | LOW | — | — |
| 2.2 | Remove dead CSS classes | LOW | — | — |
| 2.3 | Remove debug console.logs | LOW | — | — |
| 2.4 | Add PLANNED comments to scaffolding | NONE | — | — |
| 2.5 | Extract getCorrectOptionId utility | LOW | — | — |
| 2.6 | Extract mastery threshold constants | LOW | — | — |
| 3.1 | Audit note-context.tsx | READ-ONLY | — | — |
| 3.2 | Audit tier-context.tsx | READ-ONLY | — | — |
| 3.3 | Verify html2canvas / geist usage | READ-ONLY | — | — |
| 3.4 | Confirm test file co-location stays | READ-ONLY | — | — |
| 4.1 | Add error.tsx to quiz + 3D lab routes | LOW | PLANNED | — |
| 4.2 | Fix onboarding silent failures | MED | PLANNED | — |
| 4.3 | Refactor NotesShell.tsx | MED | PLANNED | — |
| 4.4 | TypeScript strict mode migration | HIGH | PLANNED | — |
| 4.5 | Split large files (3 files) | MED | PLANNED | — |
| 4.6 | Design token migration (1,030 fixes) | HIGH | PLANNED | — |

---

*SlateCamp Codebase Cleanup Plan v1.0 · 2026-03-20*
*Read-only audit basis: 701 files, 42,887 LoC, analyzed 2026-03-20*
*Do not skip the pre-flight. Do not combine tasks. One commit per task.*

