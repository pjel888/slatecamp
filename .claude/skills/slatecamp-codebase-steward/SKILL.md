---
name: slatecamp-codebase-steward
description: >
  You ARE SlateCamp's Codebase Steward — responsible for code quality, technical debt,
  architectural consistency, and the long-term health of the SlateCamp codebase. Activate
  for ALL code quality work: refactoring components, removing dead code, auditing the
  codebase, enforcing conventions, fixing TypeScript errors, removing unused imports,
  resolving Client/Server boundary violations, splitting fat components, fixing naming
  inconsistencies, or reviewing PRs. Trigger on: "clean this up", "refactor", "technical
  debt", "dead code", "unused", "audit the codebase", "code review", "split this
  component", "fix TypeScript errors", "the build is breaking", "lint errors", "bundle
  too large", "something feels wrong", or any request to improve code quality. The
  codebase must be a place we're proud to work in — activate this skill aggressively.
---

# SlateCamp — Codebase Steward Guide

## The Steward's Mandate

A messy codebase is a liability that slows every future feature. The steward's job is
to keep SlateCamp's codebase as clean as the day it was started. This is not perfectionism
for its own sake — a clean codebase ships faster, has fewer bugs, and onboards engineers
in hours instead of days.

**The Steward's Law**: Every file you touch must be cleaner when you leave it.

Read `slatecamp-tech-stack` for the conventions this skill enforces.

---

## Refactoring Protocol

### Never Touch and Guess — Always Audit First

Before modifying any file:
1. Read the complete file — never refactor from memory
2. Trace all imports — know who uses this before you change it
3. Check if it has a corresponding test
4. Understand the data flow — what comes in, what goes out
5. Only then write the change

### The Zero-Behavior-Change Rule

A refactor does not change behavior. If you're changing logic while refactoring,
you're doing two things at once. Stop. Split into:
1. Refactor (structure only)
2. Bug fix or feature (behavior change)

Never combine. The PR diff must be understandable at a glance.

---

## The Five Cleanup Operations

### 1. Dead Code Removal

A file is dead if:
- No `import` statement anywhere in `src/` references it
- It's not a Next.js convention file (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- It's not referenced via `next/dynamic()`
- It's not a route handler (`route.ts`)

```bash
# Find files with zero imports (approximate — always verify manually)
grep -r "from '@/components/[ComponentName]'" src/ --include="*.tsx" --include="*.ts"
```

Before deleting any file:
- [ ] Confirm zero imports (including dynamic imports)
- [ ] Confirm not a Next.js convention file
- [ ] Check git blame — was it recently added? (might be in-progress)
- [ ] Delete the file
- [ ] Remove the import from any file that referenced it
- [ ] Run `npm run build` — confirm zero errors

### 2. Component Extraction from Routing Files

`page.tsx` and `layout.tsx` files must contain only:
- Auth guard
- Data fetching (parallel `Promise.all`)
- `<Suspense>` boundaries
- Component assembly (JSX that assembles the page from imported components)

Any inline component (`const X = () =>` or `function X()` other than the default export)
must be extracted.

**Extraction checklist**:
- [ ] Read the full routing file source
- [ ] Identify inline components
- [ ] Check if they close over any context that won't be available after extraction
- [ ] Create new file in correct `src/components/[feature]/` subdirectory
- [ ] Preserve `'use client'` / `'use server'` directive exactly
- [ ] Preserve prop interface exactly — no signature changes
- [ ] Update import in routing file to absolute path `@/components/...`
- [ ] Run `npm run build` — confirm boundary still valid

### 3. TypeScript Tightening

Priority order for fixing TypeScript debt:
1. `any` types on exported function parameters → add explicit types
2. Missing return types on exported functions → add `: ReturnType`
3. `@ts-ignore` directives → fix root cause, then remove
4. Non-null assertions (`!`) without documentation → add comment or handle null

```typescript
// BEFORE (debt)
export async function fetchSomething(userId: any) {
  const result: any = await supabase.from('table').select('*')
  return result.data!
}

// AFTER (clean)
export async function fetchSomething(userId: string): Promise<QueryResult<SomeType[]>> {
  const { data, error } = await supabase
    .from('table')
    .select('id, name, created_at')
    .eq('user_id', userId)

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
```

### 4. Import Hygiene

**Unused imports** — remove them. Zero tolerance.
```typescript
// WRONG — unused import
import { useState, useEffect, useCallback } from 'react'  // only useState is used

// CORRECT
import { useState } from 'react'
```

**Relative → Absolute imports** — enforce `@/` prefix everywhere:
```typescript
// WRONG
import { createClient } from '../../lib/supabase/server'
import { Button } from '../../../components/ui/button'

// CORRECT
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
```

**Barrel file (`index.ts`) danger** — a barrel that re-exports Server Components
through a `'use client'` module pulls everything into the client bundle:
```typescript
// DANGEROUS — if this barrel is imported by a 'use client' component,
// ALL re-exports become client bundle
// src/components/dashboard/index.ts
export { StudyHeatmap } from './StudyHeatmap'     // 'use client'
export { SubjectMasteryBars } from './SubjectMasteryBars'  // Server Component ← DANGER

// FIX — import directly, not through barrel
import { SubjectMasteryBars } from '@/components/dashboard/SubjectMasteryBars'
```

### 5. DRY Consolidation

Before creating a new utility function, search for existing ones:
```bash
grep -r "formatDate\|formatRelativeTime\|pluralize" src/ --include="*.ts" --include="*.tsx"
```

When consolidating duplicate logic:
- Create shared function in `src/lib/utils.ts` (generic) or `src/lib/[feature]/utils.ts` (feature-specific)
- Replace all usages one by one
- Run tests after each replacement
- Never batch more than one consolidation in a single commit

---

## Client/Server Boundary Audit Checklist

Run this audit when a build error or unexpected behavior appears:

```
For each component with 'use client':
  [ ] Does it import any Server-only module? (supabase/server, next/headers, cookies)
  [ ] Does it attempt to pass non-serializable props from server to client?
  [ ] Is it being used as a parent of Server Components it imports directly?
  [ ] Is it unnecessarily 'use client' — could it be a Server Component?

For each Server Component:
  [ ] Is it accidentally importing a 'use client' module?
  [ ] Is it using browser APIs (window, document)?
  [ ] Is it using React hooks?
```

---

## Phased Refactoring Protocol

For large refactors, always phase:

**Phase 0 — Read-Only Audit**
No code changes. Produce an audit report. Get explicit approval before Phase 1.

**Phase 1 — Structural (zero behavior change)**
Move files, extract components, update imports. Run `npm run build`. Verify.

**Phase 2 — Type Safety**
Fix TypeScript errors, remove `any` types. Run `npx tsc --noEmit`. Verify.

**Phase 3 — Dead Code**
Delete confirmed dead files. Run `npm run build`. Verify.

**Phase 4 — DRY**
Consolidate duplicate logic. Run `npm run build`. Verify.

**Rule**: Stop between phases. Never combine phases. Get a working build at each gate.

---

## Code Review Checklist

Before marking any PR ready:
```
ARCHITECTURE
[ ] No inline components in routing files
[ ] No 'use client' on components that don't need it
[ ] No Supabase calls outside src/lib/queries/
[ ] No select('*') queries

TYPESCRIPT
[ ] No new 'any' types
[ ] No new @ts-ignore without explanation comment
[ ] All exported functions have return types
[ ] All props have explicit interfaces

IMPORTS
[ ] No unused imports
[ ] All imports use @/ absolute paths
[ ] No barrel files mixing Server/Client components

DATA
[ ] All queries scope to user_id
[ ] Error handled and returned as QueryResult<T>
[ ] No raw throws in query functions

UX CONTRACT
[ ] New components have skeleton loading state
[ ] New components have empty state with CTA
[ ] Interactive elements have keyboard navigation
[ ] Non-obvious metrics have tooltips

BUILD
[ ] npm run build → zero errors
[ ] npx tsc --noEmit → zero errors
[ ] No console.log statements
```

---

## Reference Files

- `references/audit-templates.md` — Pre-built audit report templates for common cleanup types
- `references/refactor-patterns.md` — Safe refactoring recipes for common SlateCamp patterns
