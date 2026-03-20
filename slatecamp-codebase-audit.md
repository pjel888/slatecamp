# SlateCamp — Codebase Health Audit
**Date:** 2026-03-20
**Auditor:** Claude Code (read-only analysis)
**Scope:** Full src/ directory
**Files analyzed:** 701
**Total lines:** 42,887

---

## Executive Summary

SlateCamp is a substantial Next.js 16 application (42,887 LoC, 701 files) with solid architectural foundations — server actions are properly organized, import paths are clean, and voice/gamification constraints are well-followed. The biggest concern is **1,030 Tailwind color utility violations** using default palette classes (text-zinc, bg-white) instead of Campfire design tokens, indicating an incomplete design system migration. TypeScript is configured with `strict: false` and there are 122 `any` usages. The highest-impact quick win is removing dead code (unused demo/ module, 6 orphaned npm deps) and splitting the 3 files exceeding 500 lines.

---

## 1. Codebase Statistics

| Metric | Value |
|---|---|
| Total .tsx files | 348 |
| Total .ts files | 353 |
| Total .css files | 3 |
| Total lines of code | 42,887 |
| App Router pages | 67 |
| Layout files | 9 |
| Loading files | 8 |
| Error boundary files | 0 |
| Not-found files | 0 |
| API routes | 11 |
| Components (src/components/) | ~200 |
| Utility/lib files (src/lib/) | ~150 |
| 'use client' files | 212 |
| useEffect instances | 148 (across 62 files) |
| console.log instances | 16 |
| console.error instances | 59 |
| console.warn instances | 2 |
| 'any' type instances | 122 (across 56 files) |
| 'as any' casts | 41 (across 22 files) |
| @ts-ignore/expect-error | 0 |
| TypeScript strict mode | OFF (strict: false) |
| Package manager lockfile | package-lock.json |

---

## 2. Dead Code — Unused Exports

### Unused Components (0 imports)

| File | Export | Status |
|---|---|---|
| `src/app/dashboard/3d-lab/_components/HotspotQuestion.tsx` | HotspotQuestion | 0 imports — safe to delete |

### Unused Utility Functions (0 references)

| File | Function | Status |
|---|---|---|
| `src/lib/demo/data.ts` | getDemoProfile, getDemoDataForTable | 0 external references — entire module unused |
| `src/lib/demo/config.ts` | isDemoMode, DEMO_USER | Only consumed by unused demo/data.ts |
| `src/lib/demo/mock-supabase.ts` | Mock Supabase functions | Imported but never called |
| `src/lib/context/note-context.tsx` | NoteContext provider | 0 imports — dead context provider |
| `src/lib/context/tier-context.tsx` | TierContext provider | 0 imports — dead context provider |

### Unused npm Dependencies

| Package | Imported in src/? | Recommendation |
|---|---|---|
| `add` (^2.0.6) | No | Remove — likely accidental install (`npm add` typo) |
| `resizable` (^2.0.0) | No | Remove — likely replaced by react-resizable-panels |
| `html2canvas` (^1.4.1) | No | Remove from package.json |
| `geist` (^1.7.0) | No (font loaded differently) | Review — may be loaded via CSS/next.config, not import |
| `shadcn` (^4.0.7) | No (CLI tool only) | Move to devDependencies |
| `radix-ui` (^1.4.3) | No (uses @radix-ui/* scoped packages) | Remove — using scoped packages instead |

### Unused CSS Classes

| File | Class | Status |
|---|---|---|
| `src/components/graphics/patterns.css` | `.bg-pattern-dots` | 0 references in .tsx |
| `src/components/graphics/patterns.css` | `.bg-pattern-cross` | 0 references in .tsx |
| `src/components/graphics/patterns.css` | `.bg-pattern-blueprint` | 0 references in .tsx |
| `src/components/graphics/patterns.css` | `.bg-pattern-shapes` | 0 references in .tsx |
| `src/components/graphics/patterns.css` | `.bg-pattern-diag` | 0 references in .tsx |
| `src/components/graphics/patterns.css` | `.icon-interactive` | 0 references in .tsx |
| `src/components/graphics/patterns.css` | `.icon-pulse` | 0 references in .tsx |
| `src/components/graphics/patterns.css` | `.stagger-children` | 0 references in .tsx |

### Orphaned Files (never imported)

| File | Type | Recommendation |
|---|---|---|
| `src/components/dashboard/QuizRenderer.test.tsx` | Test | Move to __tests__/ or integrate with test runner |
| `src/lib/actions/quiz.test.ts` | Test | Move to __tests__/ or integrate with test runner |
| `src/lib/actions/analytics.test.ts` | Test | Move to __tests__/ or integrate with test runner |
| `src/lib/actions/dashboard-page.test.ts` | Test | Move to __tests__/ or integrate with test runner |
| `src/lib/srs/irt.test.ts` | Test | Move to __tests__/ or integrate with test runner |
| `src/lib/srs/sm2.test.ts` | Test | Move to __tests__/ or integrate with test runner |
| `src/lib/context/note-context.tsx` | Context | Delete — 0 imports |
| `src/lib/context/tier-context.tsx` | Context | Delete — 0 imports |
| `src/lib/demo/data.ts` | Demo module | Delete entire demo/ directory |
| `src/lib/demo/config.ts` | Demo module | Delete entire demo/ directory |
| `src/lib/demo/mock-supabase.ts` | Demo module | Delete entire demo/ directory |

---

## 3. Naming & Organization Issues

### File Naming Inconsistencies

| Issue | Files Affected | Current | Suggested |
|---|---|---|---|
| Kebab-case filenames with PascalCase exports | 8 files in `src/components/dev/` | `dev-badge.tsx` exports `DevBadge` | Use PascalCase filenames (`DevBadge.tsx`) to match project convention |
| Mixed convention in ui/ | `AppleCloseButton.tsx` + `button.tsx` in same dir | PascalCase + kebab-case | Keep kebab-case for shadcn/ui primitives (convention), PascalCase for custom components |
| Default export anti-pattern | `src/components/dashboard/GradientImage.tsx` | `const GradientImage = ()... export default` | Use `export const GradientImage =` (named export) |
| Mixed function declarations | Across quiz/, dashboard/ | `export function X()` mixed with `export const X = () =>` | Standardize on arrow functions per CLAUDE.md preference |

### Folder Structure Issues

| Issue | Current | Suggested |
|---|---|---|
| **Overcrowded dashboard/** | 54 .tsx files flat in `src/components/dashboard/` | Split into `dashboard/cards/`, `dashboard/quiz/`, `dashboard/analytics/`, `dashboard/selectors/` |
| Test files scattered | Test files co-located with source | Create `__tests__/` directories or configure test runner discovery |
| Entire unused module | `src/lib/demo/` (3 files, 0 usage) | Delete entire directory |

### Component Naming Issues

No significant naming issues — 95%+ of exports match their filenames correctly.

---

## 4. Code Quality Findings

### TypeScript Strictness

| Category | Count | Worst Offenders |
|---|---|---|
| `: any` type usage | 81 | `src/lib/actions/assessment.ts` (8), `src/lib/actions/wiki-actions.ts` (7), `src/lib/actions/analytics.ts` (7) |
| `as any` casts | 41 | `src/lib/actions/analytics.ts` (8), `src/lib/actions/dashboard-page.ts` (6), `src/lib/admin/get-admin-profile.ts` (3) |
| @ts-ignore | 0 | None |
| @ts-expect-error | 0 | None |
| strict mode | OFF | `tsconfig.json`: `strict: false, noImplicitAny: false, strictNullChecks: false` |

### Console Statements (should be removed for production)

| File | Count | Context |
|---|---|---|
| `src/lib/actions/wiki-actions.ts` | 13 | Debug/trace logging left from development |
| `src/lib/actions/streak.ts` | 5 | Error logging in streak calculations |
| `src/lib/actions/analytics.ts` | 3 | Error logging |
| `src/components/dashboard/QuizRenderer.tsx` | 2 | Debug logging |
| `src/app/dashboard/layout.tsx:64` | 1 | User/session ID logging — **potential PII exposure** |
| Other files (31) | 52 | Mostly console.error (acceptable error logging) |

### Hardcoded Values (should be constants/tokens)

| File | Value | Should Be |
|---|---|---|
| `src/lib/actions/dashboard-page.ts:39-43` | Mastery thresholds: 0.76, 0.51, 0.26 | Named constants: `MASTERY_STRONG`, `MASTERY_DEVELOPING`, `MASTERY_BUILDING` |
| Multiple 3d-lab config files | Various hex colors `'#ffffff'`, `'#000000'` | Design token references |
| `src/components/analytics/PacingQuadrant.tsx` | `stroke="#fff"` | `var(--surface-card)` or token |
| `src/components/analytics/ReadinessTrajectory.tsx` | `stroke: '#fff'` | Design token |
| `src/components/analytics/StaminaCurve.tsx` | `stroke: '#fff'` | Design token |

### Large Files (candidates for splitting)

| File | Lines | Recommendation |
|---|---|---|
| `src/lib/actions/dashboard-page.ts` | ~730 | Split into domain-specific action files (mastery, sessions, stats) |
| `src/lib/analytics.ts` | ~640 | Split tracking, querying, and processing into separate modules |
| `src/lib/actions/analytics.ts` | ~570 | Split into query actions vs mutation actions |
| `src/components/dashboard/QuizRenderer.tsx` | ~530 | Extract question display, answer handling, and navigation into subcomponents |
| `src/components/notes/QuickCaptureDrawer.tsx` | ~490 | Extract form sections into subcomponents |
| `src/app/dashboard/testing/CampDashboard.tsx` | ~420 | Extract card sections into separate components |
| `src/components/marketing/FloatingTestimonialMarquee.tsx` | ~420 | Extract animation logic from markup |
| `src/components/admin/WikiEditor.tsx` | ~380 | Extract toolbar and preview sections |
| `src/components/notes/NotesShell.tsx` | ~380 (9 useEffects) | Refactor — too many side effects in one component |

### Error Handling Issues

| File | Issue | Recommendation |
|---|---|---|
| No empty catch blocks | n/a | Excellent — all catches have handling |
| No .then()/.catch() chains | n/a | Excellent — consistent async/await |
| `src/lib/srs/update.ts:69` | SRS error logged but silently continues | Intentional pattern — verify acceptable |
| `src/lib/supabase/bootstrap.ts:30-72` | Multiple silent errors during onboarding | Review — onboarding failures could leave user in bad state |

---

## 5. Architecture Violations

### Client/Server Boundary Issues

| File:Line | Issue | Fix |
|---|---|---|
| `src/components/admin/QuestionList.tsx:49` | Client-side `supabase.from('questions').delete()` | Move to Server Action in lib/actions/admin/ |
| `src/components/notes/NotesShell.tsx` | 9 useEffect hooks in one component | Refactor — extract data fetching to server, keep only UI effects |
| `src/app/dashboard/layout.tsx:64` | Logs user ID and discipline ID | Remove PII logging or move to server-side analytics |

### SlateCamp Design Constraint Violations

| Constraint | Violations | Details |
|---|---|---|
| No pure black/white (#000, #fff) | 30+ instances | globals.css (8), 3d-lab configs (5+), analytics charts (3), marketing (2), wiki widgets (2), layout.tsx (1) |
| No non-Campfire Tailwind colors | 1,030 instances | text-zinc-*, bg-zinc-*, text-gray-*, bg-gray-*, text-white, bg-white across 348 .tsx files |
| Font: Inter only | 2 extra fonts loaded | Syne and DM_Mono loaded in layout.tsx — only Inter should be used per CLAUDE.md |
| No emoji in system copy | 0 instances | OK |
| Min text size 11px | 0 violations | OK |
| No shadow-xl/2xl on non-modals | 0 violations | OK |
| No rounded-xl/2xl/3xl on standard elements | 0 violations | OK |
| Max transition duration 300ms | 0 violations | OK |
| No bounce/spring outside framer-motion | 0 violations | OK |
| No gamification (confetti, badges, currency) | 0 violations | OK |
| Voice guide compliance | 0 violations | OK |

---

## 6. Import Path Inconsistencies

| Issue | Count | Example |
|---|---|---|
| Relative imports in 3d-lab (scoped module) | ~20 | `src/app/dashboard/3d-lab/_components/CanvasWrapper.tsx` uses `'../_hooks/useInvalidateOnChange'` |
| All other imports | 638+ `@/` alias | Clean — no problematic relative imports outside 3d-lab scope |

**Overall:** Import hygiene is excellent. 3d-lab relative imports are acceptable as a scoped feature module.

---

## 7. Duplicate Code Patterns

| Pattern | Occurrences | Files | Suggested |
|---|---|---|---|
| Correct answer resolution: `correct_option_id ?? (q as any).correct_answer` | 4 | `hooks/quiz/useQuizState.ts:148`, `components/dashboard/QuizRenderer.tsx:217`, `components/quiz/RestudyLoop.tsx:72,110`, `components/assessment/AssessmentQuiz.tsx:127` | Extract to `lib/utils/question.ts: getCorrectOptionId(q)` |
| Subject area extraction: `(item.taxonomy_tree as any)?.subject_area` | 3 | `lib/actions/session-discovery.ts:34`, `lib/actions/srs-review.ts:35`, `lib/actions/dashboard-page.ts:362` | Extract to typed utility or define interface for taxonomy_tree |
| Supabase `from('disciplines').select()` | 2 | `lib/actions/user-stats.ts:37`, `lib/actions/onboarding.ts:21` | Extract to shared query function |
| Mastery label classification | ~2 | `lib/actions/dashboard-page.ts:39-43` | Extract to `lib/constants/mastery.ts` with shared thresholds |

---

## 8. Priority Action Items

### Fix Now (breaks production or violates hard constraints)

1. **Client-side DELETE in `src/components/admin/QuestionList.tsx:49`** — Direct Supabase delete call without server action wrapper. Move to `lib/actions/admin/questions.ts`.
2. **PII logging in `src/app/dashboard/layout.tsx:64`** — User ID and discipline ID logged to console. Remove or move to server-side analytics.
3. **1,030 non-Campfire color utilities** — `text-zinc-*`, `bg-white`, `text-gray-*` across 348 files. Systematic migration to Campfire design tokens needed.
4. **30+ pure #fff/#000 instances** — Replace with nearest Campfire tokens (Surface Card for white, Ink Primary for black).
5. **Extra fonts loaded** — Remove Syne and DM_Mono imports from `src/app/layout.tsx`. CLAUDE.md mandates Inter only.

### Fix Soon (code quality / maintainability)

1. **Enable TypeScript strict mode** — `tsconfig.json` has `strict: false, noImplicitAny: false, strictNullChecks: false`. Incremental migration recommended.
2. **Split 3 files over 500 lines** — `dashboard-page.ts` (730), `analytics.ts` (640), `QuizRenderer.tsx` (530).
3. **Remove 122 `any` type usages** — Focus on action files first (assessment.ts: 8, wiki-actions.ts: 7, analytics.ts: 7).
4. **Extract duplicate patterns** — Correct answer resolution (4 files), subject area extraction (3 files).
5. **Refactor `NotesShell.tsx`** — 9 useEffect hooks is excessive. Extract data fetching to server components.
6. **Add error.tsx and not-found.tsx** — 0 error boundary files and 0 not-found files in the entire app.
7. **Create .env.example** — No environment variable template exists for developer onboarding.

### Cleanup (nice to have)

1. **Remove 6 unused npm dependencies** — `add`, `resizable`, `html2canvas`, `radix-ui`; move `shadcn` to devDependencies.
2. **Delete `src/lib/demo/` directory** — Entire module unused (3 files).
3. **Delete unused context providers** — `note-context.tsx`, `tier-context.tsx` (0 imports each).
4. **Delete `HotspotQuestion.tsx`** — 0 imports anywhere.
5. **Prune 8 unused CSS classes** from `patterns.css`.
6. **Remove 13 debug console.logs** from `wiki-actions.ts`.
7. **Organize test files** — 6 test files scattered without test runner integration.
8. **Standardize dev/ component filenames** — 8 kebab-case files should match project PascalCase convention.
9. **Split `src/components/dashboard/`** — 54 files need subdirectory organization.
10. **Standardize function declarations** — Mixed `export function` and `export const =` arrow functions.

---

## 9. Dependency Audit

| Category | Count | Notes |
|---|---|---|
| Total dependencies | ~65 | Large but justified by feature scope (3D, rich text, payments, AI) |
| Total devDependencies | 6 | TypeScript, ESLint, types packages |
| Unused dependencies | 6 | `add`, `resizable`, `html2canvas`, `geist`, `shadcn`, `radix-ui` |
| Missing @types packages | 0 | All typed or have bundled types |
| Lockfile type | package-lock.json | Note: CLAUDE.md specifies Bun as package manager |

**Notable dependency observations:**
- 11 TipTap packages — heavy editor dependency footprint
- Both `stripe` and `payrex-node` — dual payment processor support
- `@anthropic-ai/sdk` — direct Anthropic integration (no AI SDK/gateway abstraction)
- `framer-motion` — large animation library (justified by marketing/3D features)

---

## 10. Files Inventory

### All Component Directories (src/components/)

| Directory | File Count | Key Components |
|---|---|---|
| `3d/` | 1 | Workspace.tsx |
| `admin/` | 11 | AdminNav, QuestionEditor, QuestionList, ReviewQueue, WikiEditor, etc. |
| `analytics/` | 17 | ActivityHeatmap, PacingQuadrant, ReadinessTrajectory, StaminaCurve, etc. |
| `assessment/` | 4 | AssessmentQuiz, AssessmentFlow, etc. |
| `auth/` | 3 | AuthForm, AuthGuard, etc. |
| `dashboard/` | 54 | QuizRenderer, QuizStart, SubjectMasteryCard, TaxonomyHeatmap, HeroCommandBar, etc. |
| `dev/` | 8 | DevToolbar, DevOverlay, FeatureFlagBoard, etc. |
| `developer/` | 1 | DeveloperShell |
| `graphics/` | ~10 | Icons, UI graphics, patterns.css, gradients.css |
| `interactive-illustrations/` | ~5 | 2D illustrations |
| `landing/` | 2 | Landing page components |
| `layouts/` | 1 | Layout components |
| `marketing/` | 20 | BentoFeatureGrid, FloatingTestimonialMarquee, FeatureSectionLayout, etc. |
| `motion/` | 2 | Animation wrappers |
| `notes/` | 12 | NotesShell, NotesEditor, NoteEditorPage, QuickCaptureDrawer, etc. |
| `quiz/` | 15 | AITutorDrawer, ConfirmSubmitSheet, OptionButton, RestudyLoop, etc. |
| `settings/` | 1 | Settings components |
| `shared/` | 15 | Omnibar, StandardInfoPopover, RichInfoPopover, etc. |
| `trails/` | 3 | Trail components |
| `ui/` | 30 | shadcn/ui primitives (Button, Card, Sheet, Dialog, etc.) |
| `wiki/` | 24 | WikiArticle, WikiSidebar, widgets/bp344/ (6 files) |

### All Server Action Files (src/lib/actions/)

| File | Domain |
|---|---|
| `analytics.ts` | Analytics queries and mutations |
| `assessment.ts` | Assessment flows |
| `dashboard-page.ts` | Dashboard data aggregation |
| `ei-prompts.ts` | AI prompt management |
| `feature-flags.ts` | Feature flag toggles |
| `mastery.ts` | Mastery calculations |
| `notes-actions.ts` | Note CRUD |
| `onboarding.ts` | User onboarding |
| `quiz.ts` | Quiz session management |
| `readiness.ts` | Readiness score calculations |
| `session-discovery.ts` | Session recommendations |
| `srs-review.ts` | Spaced repetition reviews |
| `streak.ts` | Study streak tracking |
| `taxonomy.ts` | Taxonomy tree queries |
| `trails.ts` | Learning trail management |
| `user-stats.ts` | User statistics |
| `wiki-actions.ts` | Wiki CRUD |
| `admin/questions.ts` | Admin question management |
| `admin/wiki.ts` | Admin wiki management |
| `dev/seed.ts` | Development data seeding |

### All Page Routes (src/app/)

| Route File | URL Served |
|---|---|
| `src/app/page.tsx` | `/` |
| `src/app/(auth)/login/page.tsx` | `/login` |
| `src/app/(auth)/register/page.tsx` | `/register` |
| `src/app/(auth)/forgot-password/page.tsx` | `/forgot-password` |
| `src/app/(auth)/onboarding/page.tsx` | `/onboarding` |
| `src/app/about/page.tsx` | `/about` |
| `src/app/contact/page.tsx` | `/contact` |
| `src/app/pricing/page.tsx` | `/pricing` |
| `src/app/try/page.tsx` | `/try` |
| `src/app/admin/page.tsx` | `/admin` |
| `src/app/admin/dashboard/page.tsx` | `/admin/dashboard` |
| `src/app/admin/questions/page.tsx` | `/admin/questions` |
| `src/app/admin/questions/new/page.tsx` | `/admin/questions/new` |
| `src/app/admin/questions/[id]/page.tsx` | `/admin/questions/:id` |
| `src/app/admin/questions/import/page.tsx` | `/admin/questions/import` |
| `src/app/admin/taxonomy/page.tsx` | `/admin/taxonomy` |
| `src/app/admin/wiki/page.tsx` | `/admin/wiki` |
| `src/app/admin/wiki/new/page.tsx` | `/admin/wiki/new` |
| `src/app/admin/wiki/[id]/page.tsx` | `/admin/wiki/:id` |
| `src/app/admin/reviews/page.tsx` | `/admin/reviews` |
| `src/app/admin/audit/page.tsx` | `/admin/audit` |
| `src/app/admin/assets/page.tsx` | `/admin/assets` |
| `src/app/dashboard/page.tsx` | `/dashboard` |
| `src/app/dashboard/testing/page.tsx` | `/dashboard/testing` |
| `src/app/dashboard/analytics/page.tsx` | `/dashboard/analytics` |
| `src/app/dashboard/notes/page.tsx` | `/dashboard/notes` |
| `src/app/dashboard/settings/page.tsx` | `/dashboard/settings` |
| `src/app/dashboard/wiki/page.tsx` | `/dashboard/wiki` |
| `src/app/dashboard/wiki/[slug]/page.tsx` | `/dashboard/wiki/:slug` |
| `src/app/dashboard/wiki/test/page.tsx` | `/dashboard/wiki/test` |
| `src/app/dashboard/trails/page.tsx` | `/dashboard/trails` |
| `src/app/dashboard/trails/[slug]/today/page.tsx` | `/dashboard/trails/:slug/today` |
| `src/app/dashboard/3d-lab/page.tsx` | `/dashboard/3d-lab` |
| `src/app/dashboard/assessment/page.tsx` | `/dashboard/assessment` |
| `src/app/dashboard/focus-review/page.tsx` | `/dashboard/focus-review` |
| `src/app/dashboard/proof-simulation/page.tsx` | `/dashboard/proof-simulation` |
| `src/app/dashboard/proof-simulation/results/page.tsx` | `/dashboard/proof-simulation/results` |
| `src/app/dashboard/exam-outcome/page.tsx` | `/dashboard/exam-outcome` |
| `src/app/dashboard/score-reveal/page.tsx` | `/dashboard/score-reveal` |
| `src/app/dashboard/welcome-pro/page.tsx` | `/dashboard/welcome-pro` |
| `src/app/dashboard/upgrade/page.tsx` | `/dashboard/upgrade` |
| `src/app/dashboard/developer/page.tsx` | `/dashboard/developer` |
| `src/app/dashboard/developer/console/page.tsx` | `/dashboard/developer/console` |
| `src/app/dashboard/developer/db/page.tsx` | `/dashboard/developer/db` |
| `src/app/dashboard/developer/design-system/page.tsx` | `/dashboard/developer/design-system` |
| `src/app/dashboard/developer/docs/page.tsx` | `/dashboard/developer/docs` |
| `src/app/dashboard/developer/logs/page.tsx` | `/dashboard/developer/logs` |
| `src/app/dashboard/developer/test-data/page.tsx` | `/dashboard/developer/test-data` |

### API Routes

| Route File | Method/Purpose |
|---|---|
| `src/app/api/admin/flags/route.ts` | Feature flag management |
| `src/app/api/ai/embed/route.ts` | Text embedding generation |
| `src/app/api/ai/generate-questions/route.ts` | AI question generation |
| `src/app/api/ai/study-agent/route.ts` | Study agent endpoint |
| `src/app/api/ai/tutor/route.ts` | AI tutor chat |
| `src/app/api/cron/blindspot-scan/route.ts` | Scheduled blindspot analysis |
| `src/app/api/cron/compute-signals/route.ts` | Scheduled signal computation |
| `src/app/api/payments/checkout/route.ts` | Payment checkout session |
| `src/app/api/pdf/process/route.ts` | PDF processing |
| `src/app/api/webhooks/payrex/route.ts` | PayRex webhook handler |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook handler |
| `src/app/auth/callback/route.ts` | Auth callback handler |

---

## 11. Configuration Gaps

| Issue | Details | Impact |
|---|---|---|
| No `.env.example` | No template for required env vars | Developer onboarding friction |
| No `error.tsx` boundaries | 0 error boundaries in any route segment | Unhandled errors show default Next.js error page |
| No `not-found.tsx` | 0 not-found pages | Missing routes show default 404 |
| TypeScript not strict | `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` | Type safety is opt-in, not enforced |
| Lockfile mismatch | `package-lock.json` exists but CLAUDE.md specifies Bun | Inconsistent package management |
| `serverActions.bodySizeLimit: '50mb'` | Extremely large limit in next.config.ts | Potential abuse vector — review if actually needed |

---

*Report generated: 2026-03-20 | Read-only analysis — no files were modified.*
