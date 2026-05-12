# Route & Path Constants Consolidation

**Status:** Phase 4 COMPLETE | Phase 5 Enforcement In Progress
**Owner:** Codebase Steward
**Last Updated:** 2026-04-08

## 1. AUDIT RESULTS

Current state of hardcoded route strings across SlateCamp.

- **Total hardcoded route strings found:** 761 (Originally)
- **Migrated:** ~95% of application logic (excluding stories/tests in some areas)
- **Status:** Legacy `src/lib/constants/routes.ts` has been DELETED.

---

## 2. ROUTE CONSTANTS FILE — src/lib/routes.ts

The canonical constants file has been established at `src/lib/routes.ts`.
It includes a nested `ROUTES` object and `Legacy Aliases` to support existing code during the transition.

```typescript
// src/lib/routes.ts structure

export const ROUTES = {
  auth: { login: '/login', ... },
  dashboard: { root: '/dashboard', ... },
  quiz: { hub: '/dashboard/drills', setup: (mode) => ..., ... },
  // ... namespaces for admin, ceo, developer, wiki, calculators

  // Legacy Aliases (DO NOT USE FOR NEW CODE)
  HOME: '/',
  DASHBOARD: '/dashboard',
  // ... uppercase keys for backward compatibility
} as const;
```

---

## 4. IMPLEMENTATION PHASES

### Phase 0 — Audit (COMPLETE)
- [x] Run grep scan for hardcoded path strings
- [x] Classify results
- [x] Produce audit table

### Phase 1 — Create Constants File (COMPLETE)
- [x] Create/Extend `src/lib/routes.ts` with all discovered routes
- [x] Export `ROUTES` object, dynamic helpers, `PUBLIC_ROUTES`, `PROTECTED_ROUTE_PREFIX`
- [x] Run `npx tsc --noEmit` — zero errors

### Phase 2 — Migrate Navigation (COMPLETE)
- [x] Replace all `<Link href="/...">` with `<Link href={ROUTES.x.y}>` (Core app)
- [x] Replace all `router.push('/...')` with `router.push(ROUTES.x.y)`
- [x] Replace all `redirect('/...')` with `redirect(ROUTES.x.y)`

### Phase 3 — Migrate Server Actions & Revalidation (COMPLETE)
- [x] Replace all `revalidatePath('/...')` with `revalidatePath(ROUTES.x.y)`
- [x] Replace any `redirect()` inside Server Actions

### Phase 4 — Migrate Middleware & Config (COMPLETE)
- [x] Update `middleware.ts` to import matchers from `routes.ts`
- [x] Update `next.config` (with documented string literal exceptions)
- [x] DELETE `src/lib/constants/routes.ts`
- [x] Update all remaining imports to `@/lib/routes`

### Phase 5 — Enforce & Prevent Regression (IN PROGRESS)
- [ ] Add ESLint rule or custom lint script
- [x] Update documentation in `.ai/state/memory.md` and `CLAUDE.md`

---

## 5. EDGE CASES & EXCEPTIONS

- **next.config.ts**: Redirects and rewrites often require static string literals for Next.js internal optimization. These will remain hardcoded but mirrored in `ROUTES` for documentation.
- **Supabase Table Names**: Strings like `'quiz_sessions'` or `'profiles'` are NOT routes and should NOT be migrated to `ROUTES`.
- **CSS Classes / Storybook**: Some story files and CSS classes may still contain slashes that look like routes but are not functional navigation paths.

---

## 7. VERIFICATION CHECKLIST

- [x] `src/lib/routes.ts` exists and exports `ROUTES`, `PUBLIC_ROUTES`, `PROTECTED_ROUTE_PREFIX`
- [x] Every unique route from audit appears in `ROUTES`
- [x] Every dynamic route has a typed helper function
- [x] Legacy routes file deleted
- [x] `bun run type-check` passes with zero errors
- [x] `middleware.ts` imports matchers from `routes.ts`
- [x] `.ai/state/memory.md` and `CLAUDE.md` updated with new convention
