# Route & Path Constants Consolidation

**Status:** Phase 0 (Audit Complete) | Phase 1 (Constants Created)
**Owner:** Codebase Steward
**Last Updated:** 2026-04-08

## 1. AUDIT RESULTS

Current state of hardcoded route strings across SlateCamp.

- **Total hardcoded route strings found:** 761
- **Total files scanned:** 1750
- **Existing constants coverage:** ~10% (definitions exist but underutilized)

### Breakdown by File Type
- **page.tsx / layout.tsx:** ~150 occurrences
- **components:** ~350 occurrences (mostly `Link href`)
- **server actions / lib:** ~200 occurrences (mostly `revalidatePath` and `redirect`)
- **middleware:** ~10 occurrences
- **tests:** ~51 occurrences

### Unique Route Segments Discovered
- `/dashboard/*` (Settings, Wiki, Drills, 3D Lab, Analytics, etc.)
- `/admin/*` (Knowledge, Questions, Pipeline, Search, etc.)
- `/quiz/*` (Setup, Session, Results, Review)
- `/auth/*` (Login, Register, Callback)
- `/tools/*` (Calculators)
- `/developer/*` (Console, DB, Logs)
- `/api/*` (Analytics, Webhooks)

---

## 2. ROUTE CONSTANTS FILE — src/lib/routes.ts

The canonical constants file has been established at `src/lib/routes.ts`.

```typescript
// src/lib/routes.ts highlights

export const ROUTES = {
  auth: {
    login: '/login',
    signup: '/register',
    callback: '/auth/callback',
    // ...
  },
  dashboard: {
    root: '/dashboard',
    settings: '/dashboard/settings',
    wiki: '/dashboard/wiki',
    drills: '/dashboard/drills',
    // ...
  },
  quiz: {
    hub: '/dashboard/drills',
    setup: (mode: string) => `/quiz/${mode}/setup` as const,
    session: (mode: string, sessionId: string) => `/quiz/${mode}/session/${sessionId}` as const,
    results: (mode: string, sessionId: string) => `/quiz/${mode}/session/${sessionId}/results` as const,
    // ...
  },
  admin: {
    root: '/admin',
    knowledge: '/admin/knowledge',
    questions: '/admin/questions',
    // ...
  }
} as const;
```

---

## 3. MIGRATION PLAN — Representative Replacements

| # | File Path | Line | Current Hardcoded String | Replacement Expression | Usage Type |
|---|-----------|------|--------------------------|------------------------|------------|
| 1 | `src/lib/supabase/middleware.ts` | 11 | `'/auth/callback'` | `ROUTES.api.auth.callback` | middleware check |
| 2 | `src/lib/supabase/middleware.ts` | 23 | `'/admin/login'` | `ROUTES.admin.login` | redirect check |
| 3 | `src/components/wiki/navigation/WikiSidebar.tsx` | 129 | `"/dashboard/settings"` | `ROUTES.dashboard.settings` | Link href |
| 4 | `src/components/wiki/navigation/WikiSidebar.tsx` | 168 | `"/dashboard/wiki"` | `ROUTES.wiki.root` | basePath prop |
| 5 | `src/components/testing/hub/ReviewHub.tsx` | 482 | `"/quiz/fullexam/setup"` | `ROUTES.quiz.legacy.simSetup` | href |
| 6 | `src/hooks/useQuizShellHandlers.ts` | 107 | `` `/quiz/${mode}/session/${sessionId}/results` `` | `ROUTES.quiz.results(mode, sessionId)` | router.push |
| 7 | `src/lib/actions/sessions.ts` | 46 | `"/dashboard/drills"` | `ROUTES.dashboard.drills` | revalidatePath |
| 8 | `src/components/dashboard/SubjectRadarChart.tsx` | 65 | `"/dashboard/drills"` | `ROUTES.dashboard.drills` | Link href |
| 9 | `src/app/admin/page.tsx` | 110 | `"/admin/questions/new"` | `ROUTES.admin.knowledgeQuestions + '/new'` | Link href |
| 10 | `src/app/not-found.tsx` | 17 | `"/dashboard"` | `ROUTES.dashboard.root` | Link href |

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

### Phase 2 — Migrate Navigation (IN PROGRESS)
- [ ] Replace all `<Link href="/...">` with `<Link href={ROUTES.x.y}>`
- [ ] Replace all `router.push('/...')` with `router.push(ROUTES.x.y)`
- [ ] Replace all `redirect('/...')` with `redirect(ROUTES.x.y)`

### Phase 3 — Migrate Server Actions & Revalidation
- [ ] Replace all `revalidatePath('/...')` with `revalidatePath(ROUTES.x.y)`
- [ ] Replace any `redirect()` inside Server Actions

### Phase 4 — Migrate Middleware & Config
- [ ] Update `middleware.ts` to import matchers from `routes.ts`
- [ ] Update `next.config` (with documented string literal exceptions)

### Phase 5 — Enforce & Prevent Regression
- [ ] Add ESLint rule or custom lint script
- [ ] Update documentation in `.ai/state/memory.md`

---

## 5. EDGE CASES & EXCEPTIONS

- **next.config.ts**: Redirects and rewrites often require static string literals for Next.js internal optimization. These will remain hardcoded but mirrored in `ROUTES` for documentation.
- **Supabase Table Names**: Strings like `'quiz_sessions'` or `'profiles'` are NOT routes and should NOT be migrated to `ROUTES`.
- **CSS Classes**: Tailwind classes like `top-/4` or `w-1/2` contain slashes but are not routes.
- **Third-party Links**: External URLs (LemonSqueezy, Supabase Dashboard) are moved to `ROUTES.external`.

---

## 6. LINT ENFORCEMENT STRATEGY

**Recommendation:** Custom ESLint rule `no-hardcoded-routes`.

```javascript
// eslint.config.mjs candidate logic
{
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "JSXAttribute[name.name='href'] > Literal[value=/^\\/dashboard/]",
        "message": "Use ROUTES constant from @/lib/routes instead of hardcoded string."
      }
    ]
  }
}
```

---

## 7. VERIFICATION CHECKLIST

- [x] `src/lib/routes.ts` exists and exports `ROUTES`, `PUBLIC_ROUTES`, `PROTECTED_ROUTE_PREFIX`
- [x] Every unique route from audit appears in `ROUTES`
- [x] Every dynamic route has a typed helper function
- [ ] Zero hardcoded string paths remain in `src/` (Phase 2-4 task)
- [ ] `npm run build` passes with zero errors
- [ ] `middleware.ts` imports matchers from `routes.ts`
- [x] `.ai/state/memory.md` updated with new convention
