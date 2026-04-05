# LEAN TECH CLEANUP ROADMAP
## SlateCamp — 2026-03-25

---

## Executive Summary

SlateCamp's codebase is the work of a solo developer shipping at extraordinary velocity — 273 commits in 18 days, 105 pages, 7 testing modes, a genuine pedagogical engine. The architecture has several gold-standard subsystems (analytics Suspense pattern, wiki widget lazy-loading, 3D Lab demand rendering). But the speed has produced structural debt that will compound into fragility if not addressed before the first ALE exam cycle.

This roadmap targets the three categories of waste that most directly threaten SlateCamp's path to Gate 1 (₱10,000 MRR from ~30 Pro subscribers):

**What this cleanup achieves:**

| Metric | Before | After (Estimated) |
|--------|--------|-------------------|
| Client component ratio | 56% (387/692 files) | ~40% (remove 60–70 unnecessary `'use client'`) |
| Waterfall pages | 22 pages with sequential awaits | 0 (all parallelized with `Promise.all`) |
| `select('*')` overfetch queries | 47 | 0 (all explicit column lists) |
| Inline Supabase queries in pages | 40+ page files | 0 (all moved to `src/lib/queries/`) |
| Unused dependencies | 9 packages | 0 |
| Orphaned components | 9 files (1,292 lines) | 0 |
| Dead utility exports | 78 exports | 0 |
| Duplicate route trees | 3 pairs | 0 |
| Bundle size reduction | ~200KB shader gradient + ~60KB dual icons + unused deps | ~280KB+ savings |
| Hardcoded hex colors | 2,576 | ~496 (top 10 values = 81% migrated) |
| Server actions without error handling | 79% (44/56 files) | 0% |
| Server actions missing `"use server"` | 93% (52/56 files) | 0% |

**Why this matters for survival:** Every 100ms of page load latency increases bounce rate. The 22 waterfall pages waste 300–500ms each in sequential database round-trips. The 47 `select('*')` queries fetch full table rows where 3–5 columns are needed, increasing Supabase egress costs as users scale. Payment buttons are non-functional — revenue is literally blocked. Fixing these issues is not polish; it is the difference between a product that can charge money and one that cannot.

**Total estimated effort: 70–95 engineering hours (solo dev), phased over 3–4 weeks.**

---

## Step 1: The Purge

**Goal:** Delete everything that doesn't serve the core loop. Less code = fewer bugs, faster builds, easier future refactors.

**Verification gate:** `npm run build` must pass with zero errors after this step.

---

### 1A. Packages to Uninstall

| Package | Reason | Command |
|---------|--------|---------|
| `camera-controls` | Zero imports in `src/` | `bun remove camera-controls` |
| `katex` | Zero imports in `src/` | `bun remove katex` |
| `next-devtools-mcp` | Zero imports in `src/` | `bun remove next-devtools-mcp` |
| `pdf-parse` | Zero imports in `src/` | `bun remove pdf-parse` |
| `react-markdown` | Zero imports — custom MDX renderer used instead | `bun remove react-markdown` |
| `rehype-katex` | Zero imports in `src/` | `bun remove rehype-katex` |
| `remark-math` | Zero imports in `src/` | `bun remove remark-math` |
| `shadcn-ui` | Duplicate of `shadcn` v4.1.0 | `bun remove shadcn-ui` |
| `three-stdlib` | Zero imports in `src/` | `bun remove three-stdlib` |

**Misplaced dependencies (move to devDependencies):**

| Package | Action |
|---------|--------|
| `@types/dompurify` | `bun remove @types/dompurify && bun add -d @types/dompurify` |
| `@types/papaparse` | `bun remove @types/papaparse && bun add -d @types/papaparse` |
| `supabase` (CLI) | `bun remove supabase && bun add -d supabase` |

**One-shot command:**
```bash
bun remove camera-controls katex next-devtools-mcp pdf-parse react-markdown rehype-katex remark-math shadcn-ui three-stdlib
bun run build
```

---

### 1B. Orphaned Components to Delete

| File Path | Lines | Reason |
|-----------|-------|--------|
| `src/components/dashboard/TestingHub.tsx` | 301 | Superseded by `testing/hub/ReviewHub` |
| `src/components/marketing/FloatingTestimonialMarquee.tsx` | 288 | Unused marketing animation |
| `src/components/dashboard/QuizRenderer.test.tsx` | 261 | Orphaned test file (references deleted component) |
| `src/components/dashboard/ModeIntroScreen.tsx` | 178 | Large unused intro screen |
| `src/components/shared/TransitionLink.tsx` | 103 | Unused navigation component |
| `src/components/shared/TierBadge.tsx` | 77 | Unused pricing component |
| `src/components/dashboard/GradientImage.tsx` | 44 | Dead — also eliminates `@shadergradient/react` (~200KB) |
| `src/components/auth/SignOutButton.tsx` | 27 | Replaced by LogoutButton |
| `src/components/ceo/skeletons/TableSkeleton.tsx` | 13 | Possible WIP — verify before deleting |

**Total: 1,292 lines of dead code.**

**After deleting `GradientImage.tsx`**, also remove its sole dependency:
```bash
bun remove @shadergradient/react
```
This single deletion saves ~200KB of bundled Three.js shader pipeline.

---

### 1C. Duplicate Route Trees to Delete

| Duplicate Tree | Canonical Tree | Action |
|----------------|---------------|--------|
| `src/app/dashboard/developer/*` (7 pages) | `src/app/(protected)/developer/*` (20 pages) | Delete entire `dashboard/developer/` directory |
| `src/app/dashboard/trails/*` | `src/app/dashboard/camptrails/*` | Delete `trails/` — it's a redirect shim |
| `src/app/admin/wiki/*` | `src/app/admin/articles/*` | Delete `wiki/` — it's a redirect shim |

**Estimated: ~2,000+ lines removed.**

---

### 1D. Dead Utility Files to Delete

| File | Dead Exports | Reason |
|------|-------------|--------|
| `src/lib/demo/data.ts` | 11 | Entire file unused — demo data never consumed |
| `src/lib/workflow/content-workflow.ts` | 6 | Workflow engine never integrated |
| `src/lib/constants/ads.ts` | all | Ad system never implemented |
| `src/lib/admin/permissions.ts` | all | Permission system unused |
| `src/lib/wiki/wiki-actions.ts` | all | Duplicate wiki actions (canonical is elsewhere) |
| `src/lib/wiki-markdown.ts` | all | Markdown conversion unused |

**Additional dead exports:** 78 total across the codebase (~1,500 lines). After deleting entire dead files above, audit remaining exports with:
```bash
# For each exported function, verify at least one import exists
grep -r "functionName" src/ --include="*.ts" --include="*.tsx" | grep -v "export"
```

---

### 1E. Empty/Stub Files to Delete

13 empty or placeholder files identified in the audit. Delete after verifying they are not Next.js convention files or in-progress work.

---

### 1F. Stale Dev-Only Data

| File | Lines | Action |
|------|-------|--------|
| 6 dev-only data files | ~886 | Move to `src/lib/__dev__/` or delete if unused |

---

### 1G. Font Cleanup

| Action | File | Savings |
|--------|------|---------|
| Remove GeistSans font loading | `src/app/layout.tsx` | Eliminates font file load for 1 component |
| Replace GeistSans usage in `HeroHeadline.tsx` | `src/components/marketing/HeroHeadline.tsx` | Use `font-display` (Syne) instead |

---

### 1H. Purge Verification

After completing all deletions:
```bash
bun run build
# Expected: zero errors
# If errors: restore the file that caused breakage, investigate import chain
```

---

## Step 2: Database & Data Flow

**Goal:** Fix the 5 highest-impact architectural violations. These cause the most performance damage and developer friction.

**Verification gate:** `bun run build && npx tsc --noEmit` must pass after this step.

---

### Violation 1: No Query Abstraction Layer (CRITICAL — highest impact)

**Where:** 40+ `page.tsx` files contain inline Supabase queries. Only 5 files exist in `src/lib/queries/`.

**Impact:** Zero query reuse. No caching boundary. No type safety at the data boundary. Changing a table name requires editing 40+ files. Every page that fetches data is a potential source of inconsistent error handling.

**Fix — Create domain-scoped query modules:**

| Module | Queries to Extract From | Pattern |
|--------|------------------------|---------|
| `src/lib/queries/testing.ts` | `testing/page.tsx`, `testing/session/*/page.tsx`, `testing/session/*/debrief/page.tsx` | Testing hub, session loading, debrief data |
| `src/lib/queries/dashboard.ts` | `dashboard/page.tsx`, `dashboard/layout.tsx` | Dashboard stats, user profile, readiness |
| `src/lib/queries/assessment.ts` | `assessment/page.tsx`, `score-reveal/page.tsx` | Assessment questions, score computation |
| `src/lib/queries/wiki.ts` | `wiki/*/page.tsx`, `wiki/page.tsx` | Article fetching, taxonomy browsing |
| `src/lib/queries/trails.ts` | `camptrails/*/page.tsx` | Trail enrollment, daily prescriptions |
| `src/lib/queries/analytics.ts` | `analytics/page.tsx` | All 8 analytics visualizations |
| `src/lib/queries/admin.ts` | `admin/*/page.tsx` | Admin dashboard, content management |
| `src/lib/queries/ceo.ts` | `ceo/*/page.tsx` | CEO command center, financials, behavioral |

**Every query function must follow this template:**
```typescript
// src/lib/queries/testing.ts

import { createClient } from '@/lib/supabase/server'
import type { QueryResult } from '@/types/app'

// TESTING: TestingHub — session list
export async function fetchUserSessions(
  userId: string
): Promise<QueryResult<SessionSummary[]>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('id, mode, status, score_percent, subject_name, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return { data, error: null }
  } catch (err) {
    console.error('[TESTING: TestingHub] fetchUserSessions:', err)
    return { data: null, error: 'Failed to load sessions.' }
  }
}
```

**Rules for every extracted query:**
1. Comment with `// FEATURE: ComponentName` 
2. Explicit column list — never `select('*')`
3. Always `.eq('user_id', userId)` — even with RLS
4. Return typed `QueryResult<T>` — never raw Supabase response
5. Transform data in the query function, not in the component
6. Handle errors: return `{ data: null, error: message }` — never throw

**Effort: 8–12 hours**
**Risk: Medium** — behavior change possible if query columns differ from current `select('*')`. Test each page after migration.

---

### Violation 2: 22 Waterfall Pages (CRITICAL — 300–500ms latency waste)

**Where:** 22 pages with sequential `await` calls that are independent of each other.

**Impact:** Each sequential await adds a full database round-trip (~50ms per query). The onboarding page has 10 sequential awaits (~500ms wasted). The testing hub has 8 (~400ms wasted). Users feel this as sluggishness on every page load.

**Fix — Parallelize with `Promise.all()`:**

**Priority order (by user traffic × latency waste):**

| Priority | Page | Sequential Awaits | Fix |
|----------|------|-------------------|-----|
| P1 | `dashboard/testing/page.tsx` | 8 | Wrap all independent queries in `Promise.all()` |
| P1 | `dashboard/testing/session/[sessionId]/page.tsx` | 6 | Parallelize session + questions + user data |
| P1 | `dashboard/testing/session/[sessionId]/debrief/page.tsx` | 7 | Parallelize debrief data fetches |
| P1 | `dashboard/score-reveal/page.tsx` | 6 | Parallelize score + profile + readiness |
| P2 | `(auth)/onboarding/page.tsx` | 10 | Parallelize onboarding data fetches |
| P2 | `dashboard/testing/simulation/[sessionId]/results/page.tsx` | 6 | Parallelize results data |
| P2 | `dashboard/welcome-pro/page.tsx` | 5 | Parallelize welcome data |
| P2 | `dashboard/assessment/page.tsx` | 4 | Parallelize assessment setup |
| P3 | `(protected)/ceo/financials/page.tsx` | 4 | Parallelize financial data |
| P3 | `dashboard/layout.tsx` | 4 | Parallelize layout data |
| P3 | 12 additional pages | 3 each | Parallelize remaining |

**Pattern:**
```typescript
// BEFORE (waterfall — 300ms wasted)
const user = await getUser()
const sessions = await fetchSessions(user.id)
const readiness = await fetchReadiness(user.id)
const mastery = await fetchMastery(user.id)

// AFTER (parallel — single round-trip)
const user = await getUser()
const [sessions, readiness, mastery] = await Promise.all([
  fetchSessions(user.id),
  fetchReadiness(user.id),
  fetchMastery(user.id),
])
```

**Note:** Auth must remain sequential (need `user.id` for all subsequent queries). Only data queries that don't depend on each other's results should be parallelized.

**Effort: 3 hours**
**Risk: Low** — `Promise.all` preserves behavior; just changes execution order.

---

### Violation 3: 47 `select('*')` Overfetching Queries (CRITICAL)

**Where:** Distributed across actions and queries. Worst offenders:

| File | `select('*')` Count |
|------|---------------------|
| `src/lib/actions/wiki-actions.ts` | 10 |
| `src/lib/actions/trails.ts` | 6 |
| `src/lib/queries/trails.ts` | 5 |
| Remaining 26 files | 1–3 each |

**Impact:** Full table scans return every column when only 3–5 are needed. Increases Supabase egress bandwidth (cost at scale), response parsing time, and memory usage. On tables like `quiz_sessions` (15+ columns) or `wiki_articles` (10+ columns including full `content` text), this is significant.

**Fix:** Replace every `select('*')` with explicit column list matching what the consuming component actually renders.

**Process per query:**
1. Find the `select('*')` call
2. Trace which fields the component uses from the response
3. Replace with explicit column list: `.select('id, title, status, created_at')`
4. Update the TypeScript type to match the narrower response
5. Run `bun run build` — confirm no missing field errors

**Effort: 4–6 hours**
**Risk: Medium** — must verify every consuming component gets all fields it needs.

---

### Violation 4: 106 Unnecessary `'use client'` Directives (CRITICAL — bundle bloat)

**Where:** 387 of 692 `.tsx` files (56%) have `'use client'`. Target is <40%. Estimated 60–70 can be removed.

**Worst offender categories:**

| Category | Files with Suspect `'use client'` | Likely Removable |
|----------|----------------------------------|------------------|
| Marketing/landing pages | 10 | 8–10 (display-only components) |
| CEO charts | 8 | 3–5 (some need Recharts interactivity) |
| Analytics charts | 7 | 3–5 (some need Recharts interactivity) |
| Testing debrief | 6 | 4–5 (display-only result summaries) |
| Portal shells | 3 | 2–3 (layout-only wrappers) |
| Remaining | ~70 | ~40–45 |

**Decision tree for each file:**
```
Does the component use useState, useEffect, useRef, useCallback, useMemo?
  YES → keep 'use client'
  NO  ↓
Does it use browser APIs (window, document, navigator)?
  YES → keep 'use client'
  NO  ↓
Does it use event handlers (onClick, onChange, onSubmit)?
  YES → keep 'use client' (unless it's a form action or simple link)
  NO  ↓
Does it use a Zustand store?
  YES → keep 'use client'
  NO  → REMOVE 'use client'
```

**Process:** Work through files in batches by directory. Remove directive, run `bun run build`. If build fails, the component needs `'use client'` — restore it.

**Effort: 4–6 hours**
**Risk: Low** — build will catch any incorrect removals immediately.

---

### Violation 5: Mixed Queries/Actions + Missing Error Handling

**Where:** `src/lib/actions/` contains both read queries and write mutations with no separation. 79% of action files (44/56) have no try/catch. 93% (52/56) are missing `"use server"` directives.

**Impact:** No read/write separation means no caching boundary. Missing error handling means raw Supabase errors (including table names and SQL state codes) leak to the client. Missing `"use server"` directives mean these functions could theoretically be imported client-side.

**Fix — Three parallel tasks:**

**5A. Add `"use server"` to all 52 action files:**
```bash
# Scriptable — add directive to top of each file
for file in src/lib/actions/**/*.ts; do
  if ! head -1 "$file" | grep -q "use server"; then
    sed -i '1s/^/"use server"\n\n/' "$file"
  fi
done
```
**Effort: 15 minutes**

**5B. Add try/catch to all 44 unhandled action files:**

Template for every server action:
```typescript
'use server'

export async function someAction(args: ValidatedInput) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in.' }

    const { error } = await supabase.from('table').update(args).eq('id', args.id).eq('user_id', user.id)
    if (error) throw error

    revalidatePath('/relevant-path')
    return { success: true }
  } catch (err) {
    console.error('[FEATURE: ActionName] someAction:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
```
**Effort: 4–6 hours**

**5C. Separate reads from writes:**
Move all read-only functions from `src/lib/actions/` to `src/lib/queries/` (this overlaps with Violation 1). Actions files should only contain mutations (insert, update, delete, upsert).

**Effort: Included in Violation 1 estimate**

---

### Step 2 Verification

After completing all five violations:
```bash
bun run build        # Zero errors
npx tsc --noEmit     # Zero type errors
```

---

## Step 3: Component Unification

**Goal:** Eliminate duplicated UI logic. Every component follows the Rams Standard: every element earns its place.

**Verification gate:** `bun run build` must pass after each component extraction or merge.

---

### 3A. Inline Components to Extract from Routing Files

`page.tsx` and `layout.tsx` files must contain only: auth guard, data fetching, `<Suspense>` boundaries, and component assembly. Any inline function component must be extracted.

**Files to audit (from churn hotspot data):**

| Routing File | Inline Components to Extract | Target Path |
|-------------|------------------------------|-------------|
| `src/app/dashboard/page.tsx` (29 changes — HIGH churn) | Audit for inline components | `src/components/dashboard/` |
| `src/app/dashboard/layout.tsx` (27 changes — HIGH churn) | Audit for inline layout components | `src/components/dashboard/` |
| `src/components/dashboard/ResultsSummary.tsx` | `CalibrationSection` (TODO at line 161) | `src/components/dashboard/CalibrationSection.tsx` |
| `src/components/dashboard/ResultsSummary.tsx` | `ErrorPatternSection` (TODO at line 245) | `src/components/dashboard/ErrorPatternSection.tsx` |
| `src/components/dashboard/QuizRenderer.tsx` | `NoQuestionsLoaded` fallback (TODO at line 598) | `src/components/dashboard/NoQuestionsLoaded.tsx` |

**Extraction checklist per component:**
- [ ] Read full source of routing file
- [ ] Identify inline components (any `const X = () =>` or `function X()` that isn't the default export)
- [ ] Check if component closes over context not available after extraction
- [ ] Create new file in `src/components/[feature]/`
- [ ] Preserve `'use client'` directive exactly
- [ ] Define explicit props interface
- [ ] Update import in routing file to `@/components/...`
- [ ] Run `bun run build`

---

### 3B. Card Component Migration (465 → shared Card)

**Current state:** 465 ad-hoc card `div`s with manual `rounded-xl border bg-card p-4` styling. Only 37 uses of the shared `Card` component (92% bypass rate).

**Fix:** Migrate ad-hoc card divs to `<Card>` from `src/components/ui/card.tsx` in priority order:

| Directory | Ad-hoc Card Estimate | Priority |
|-----------|---------------------|----------|
| `src/components/dashboard/` | ~120 | P1 (student-facing, highest traffic) |
| `src/components/testing/` | ~80 | P1 (core product) |
| `src/components/wiki/` | ~70 | P2 (content pages) |
| `src/components/admin/` | ~100 | P3 (admin-only, lower traffic) |
| `src/app/(protected)/ceo/` | ~50 | P3 (CEO-only) |
| Remaining | ~45 | P4 |

**Effort: 8–12 hours**
**Risk: Low** — purely visual, no behavior change.

---

### 3C. Icon Library Consolidation

**Current state:** Two icon libraries with no domain boundary:
- Lucide React: 189 files (0.577.0)
- Phosphor Icons: 135 files (2.1.10)

**Decision:** Pick **one** primary library. The audit shows Phosphor in 135 files — if Phosphor is the preferred library per SlateCamp design system, migrate the 57 Lucide-only files (Lucide also appears in files where both are used). If Lucide is preferred, migrate the Phosphor files.

**Process:**
1. Create a mapping file: `icon-migration-map.ts` with `LucideIconName → PhosphorEquivalent`
2. Migrate one directory at a time
3. Run `bun run build` after each directory
4. After all migrations: `bun remove lucide-react` (or `@phosphor-icons/react`)

**Effort: 4–6 hours**
**Savings: ~60KB+ bundle reduction**

---

### 3D. Hardcoded Hex → Design Token Migration

**Current state:** 2,576 hardcoded hex colors in Tailwind classes. Design tokens are defined in `globals.css` but massively bypassed.

**Strategy:** Migrate the top 10 hex values first (covers 81% of instances):

| Hex | Count | Replace With |
|-----|-------|-------------|
| `#1B3FC4` | 406 | `text-primary` / `bg-primary` |
| `#D4DAE3` | 343 | `border-border` |
| `#8896A7` | 315 | `text-muted-foreground` |
| `#4A5568` | 223 | `text-text-secondary` |
| `#1A2332` | 221 | `text-foreground` |
| `#EEF2FC` | 141 | `bg-primary-50` |
| `#D64545` | 113 | `text-destructive` |
| `#D4951A` | 110 | `text-warning` |
| `#1535A8` | 106 | `text-primary-700` |
| `#2D9F6F` | 102 | `text-success` |

**Process per hex value:**
```bash
# Find all instances
grep -rn "\\[#1B3FC4\\]" src/ --include="*.tsx" --include="*.ts"

# Replace (verify context — bg vs text vs border)
# bg-[#1B3FC4] → bg-primary
# text-[#1B3FC4] → text-primary
# border-[#1B3FC4] → border-primary
```

**Prevention:** The ESLint hex-color rule already exists — enable it as an error (not warning) after migration to prevent regressions.

**Also resolve dual token system:** Deprecate either the Camp Standard tokens (`--camp-cobalt`, `--camp-red`, etc.) or the shadcn semantic tokens — not both. Unify to one set in `globals.css`.

**Effort: 8–12 hours**
**Risk: Low** — purely visual, no behavior change. But review in browser to catch edge cases where hex value was intentionally different from the token.

---

### 3E. Missing Loading & Empty States

**Current state:** 87/105 pages (83%) have `loading.tsx` — good coverage. But individual data-dependent components within pages may lack skeleton and empty state variants.

**Audit these high-traffic components:**

| Component | Has Skeleton? | Has Empty State? | Action |
|-----------|--------------|-----------------|--------|
| All components in `src/components/dashboard/` | Audit | Audit | Create `skeletons/` subdirectory if missing |
| All components in `src/components/testing/` | Audit | Audit | Create `skeletons/` subdirectory if missing |
| `PacingInsights` (55 props — churn risk) | Audit | Audit | Needs both + prop simplification |

**Template for skeleton:**
```tsx
// src/components/dashboard/skeletons/ComponentNameSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ComponentNameSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-48 mb-4" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
```

**Effort: 4–6 hours (depends on component count)**

---

### 3F. Voice Guide Compliance

**"drill" → "practice" / "review"** across 28+ instances:

| Type | Files to Rename |
|------|----------------|
| Component files | `RecallDrill.tsx` → `RecallPractice.tsx`, `DimensionDrill.tsx` → `DimensionPractice.tsx`, `SpatialQualityDrill.tsx` → `SpatialQualityPractice.tsx`, `BodyDimensionDrill.tsx` → `BodyDimensionPractice.tsx` |
| UI labels | All "drill" text in JSX |
| Mission IDs | All "drill" in data constants |

**Process:** Global find-and-replace with case sensitivity, then run `bun run build`.

**Effort: 2 hours**

---

## Execution Rules

These rules are non-negotiable for the entire cleanup.

### PR Strategy
- **One PR per cleanup category:** Purge (Step 1), Data Flow (Step 2), Component Unification (Step 3)
- Within each PR, commit granularly: one commit per file deletion, one per query extraction, one per component merge
- Never combine structural refactors with behavior changes (Zero-Behavior-Change Rule)

### Build Gates
- Run `bun run build` after every file deletion or move
- Run `npx tsc --noEmit` after any TypeScript changes
- If the build breaks, revert the last change and investigate before proceeding

### Quality Gates (New Code Only)
- No new `any` types
- No new `@ts-ignore` without documented reason in a comment
- No new `select('*')` queries
- No new hardcoded hex colors (use design tokens)
- All new query functions return `QueryResult<T>`
- All new server actions have try/catch with structured error returns
- Every extracted component gets a skeleton loading state
- Every data component gets an empty state with CTA

### What NOT to Do During Cleanup
- Do not enable `strictNullChecks` yet — that is a separate initiative with its own error remediation (8–16 hours estimated). Do it after the structural cleanup is complete.
- Do not add new features. This is a hardening sprint.
- Do not refactor the SRS/IRT reconnection as part of this cleanup — that is a behavior change (wiring `updateSrsSchedule()` into `saveTestingInteraction()`). It belongs in a separate, tested PR.
- Do not start the hex migration until the Purge and Data Flow steps are complete — you'll be editing files that might get deleted or moved.

---

## Post-Cleanup Checklist

Run this checklist against the cleaned codebase. Every box must be checked before considering the cleanup complete.

```
ARCHITECTURE
[ ] No inline components in routing files (page.tsx, layout.tsx)
[ ] No 'use client' on components that don't use hooks, browser APIs, or event handlers
[ ] No Supabase calls outside src/lib/queries/ (reads) or src/lib/actions/ (writes)
[ ] No select('*') queries anywhere in the codebase
[ ] All 22 waterfall pages converted to Promise.all()
[ ] Duplicate route trees deleted (dashboard/developer, trails, admin/wiki)

TYPESCRIPT
[ ] No new 'any' types introduced
[ ] No new @ts-ignore without explanation comment
[ ] All exported query functions have return types (QueryResult<T>)
[ ] All server action files have "use server" directive

ERROR HANDLING
[ ] All server action files have try/catch
[ ] All query functions return { data, error } — never throw
[ ] No raw Supabase error messages leak to client

IMPORTS
[ ] No unused imports
[ ] All imports use @/ absolute paths
[ ] No barrel files mixing Server/Client component re-exports
[ ] 9 unused dependencies removed
[ ] Misplaced dependencies moved to devDependencies

DESIGN SYSTEM
[ ] Top 10 hardcoded hex values migrated to design tokens (2,080 instances)
[ ] Dual token system resolved (one system, not two)
[ ] ESLint hex-color rule set to error

DEAD CODE
[ ] 9 orphaned components deleted
[ ] 6 dead utility files deleted
[ ] 78 dead exports removed
[ ] 3 duplicate route trees deleted
[ ] 13 stub files deleted or completed
[ ] GeistSans font removed

BUILD
[ ] bun run build → zero errors
[ ] npx tsc --noEmit → zero errors
[ ] No console.log statements in production code paths
```

---

## Priority Sequencing (Recommended Order)

| Week | Step | Focus | Hours |
|------|------|-------|-------|
| Week 1 | Step 1 | The Purge — delete deps, orphans, route trees, dead utils | 6–8 |
| Week 1 | Step 2A | Query layer — extract inline queries to `src/lib/queries/` | 8–12 |
| Week 2 | Step 2B | Waterfalls — parallelize all 22 pages | 3 |
| Week 2 | Step 2C | `select('*')` — replace all 47 with explicit columns | 4–6 |
| Week 2 | Step 2D | `'use client'` — remove 60–70 unnecessary directives | 4–6 |
| Week 2 | Step 2E | Error handling — add try/catch to 44 action files + `"use server"` to 52 | 4–6 |
| Week 3 | Step 3A | Inline component extraction | 4–6 |
| Week 3 | Step 3B | Hex → token migration (top 10 values) | 8–12 |
| Week 3 | Step 3C | Card component migration | 8–12 |
| Week 4 | Step 3D | Icon library consolidation | 4–6 |
| Week 4 | Step 3E | Skeleton + empty states | 4–6 |
| Week 4 | Step 3F | Voice guide compliance ("drill" → "practice") | 2 |

**Total: 70–95 hours across 4 weeks.**

After this cleanup, the codebase is ready for: `strictNullChecks` enablement, Vitest + CI setup, SRS reconnection, IRT integration, and payment button wiring — all as separate, behavior-changing PRs with their own test coverage.

---

*Generated 2026-03-25 from GLOBAL-CODEBASE-AUDIT-REPORT.md. All file paths, line counts, and estimates are drawn directly from the audit evidence.*
