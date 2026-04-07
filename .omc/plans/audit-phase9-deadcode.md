# Phase 9: Dead Code & Waste Audit

**Date:** 2026-03-25
**Scope:** src/, package.json, route configs, documentation
**Method:** Static analysis via grep/find cross-referencing exports against imports

---

## Summary Table

| Waste Category | Count | Impact |
|---------------|-------|--------|
| Orphan components | 9 | 1,292 lines of bundle bloat |
| Unused dependencies | 11 | Install time, security surface |
| Duplicate route trees | 3 | Maintenance confusion |
| Empty/stub files | 13 | Noise, false coverage |
| Commented-out code | ~48 | Debt signal |
| Orphaned route constants | 8 | Dead links, misleading code |
| Unused type definitions | 53 | Noise, false type coverage |
| Dead utility functions | 78 | Confusion, bundle bloat |
| Dev-only data in prod | 6 files | Security risk, bundle size |
| Stale documentation | 159 files | Misleading, onboarding friction |
| Dual icon libraries | 2 libs (192 files) | Bundle bloat (~70KB+ extra) |
| Duplicate package | 1 (shadcn-ui) | Confusion |

---

## 1. Orphan Components (9 files, ~1,292 lines)

Components in `src/components/` with zero imports anywhere in the codebase:

| File | Lines | Notes |
|------|-------|-------|
| `src/components/auth/SignOutButton.tsx` | 27 | Unused auth component |
| `src/components/ceo/skeletons/TableSkeleton.tsx` | 13 | New CEO feature, may be WIP |
| `src/components/dashboard/GradientImage.tsx` | 44 | Dead visual component |
| `src/components/dashboard/ModeIntroScreen.tsx` | 178 | Large unused screen |
| `src/components/dashboard/QuizRenderer.test.tsx` | 261 | Orphaned test file (no source) |
| `src/components/dashboard/TestingHub.tsx` | 301 | Superseded by testing/hub/ReviewHub |
| `src/components/marketing/FloatingTestimonialMarquee.tsx` | 288 | Unused marketing animation |
| `src/components/shared/TierBadge.tsx` | 77 | Unused pricing component |
| `src/components/shared/TransitionLink.tsx` | 103 | Unused navigation component |

**Also deleted in git (confirmed safe):**
- `src/components/ui/AppleCloseButton.tsx` -- already deleted, zero references

---

## 2. Unused Dependencies (11 packages)

| Package | Verdict | Notes |
|---------|---------|-------|
| `@radix-ui/react-visually-hidden` | **Keep** | Transitive dep of @radix-ui/react-dialog and react-toast |
| `@lemonsqueezy/lemonsqueezy-js` | **Verify** | LemonSqueezy is used in src/lib/lemonsqueezy/ and webhooks, but `@lemonsqueezy/lemonsqueezy-js` (client SDK) may not be directly imported -- check if `lemonsqueezy` (server) pkg handles it |
| `camera-controls` | **Remove** | Zero imports |
| `isomorphic-dompurify` | **Verify** | Only `dompurify` referenced in 1 file -- may use this or the non-isomorphic version |
| `katex` | **Remove** | Zero imports (was likely for LaTeX rendering, never implemented) |
| `next-devtools-mcp` | **Remove** | Zero imports -- dev tool never integrated |
| `pdf-parse` | **Remove** | Zero imports |
| `react-markdown` | **Remove** | Zero imports (custom MDX used instead) |
| `rehype-katex` | **Remove** | Zero imports (paired with katex) |
| `remark-math` | **Remove** | Zero imports (paired with katex) |
| `shadcn-ui` | **Remove** | Duplicate of `shadcn` v4.1.0 -- `shadcn-ui` is the old package name (v0.9.5) |
| `three-stdlib` | **Remove** | Zero imports |
| `@tailwindcss/postcss` | **Keep** | Used in postcss.config (not in src/) |
| `eslint-config-next` | **Keep** | Used in eslint config (not in src/) |

**Safe to remove: 8 packages** (`camera-controls`, `katex`, `next-devtools-mcp`, `pdf-parse`, `react-markdown`, `rehype-katex`, `remark-math`, `shadcn-ui`, `three-stdlib`)

---

## 3. Duplicate Route Trees (3 pairs)

### 3a. `/dashboard/developer/` vs `/developer/` -- ACTIVE DUPLICATE
- `/dashboard/developer/` -- 7 pages (console, db, design-system, docs, logs, test-data, root)
- `/developer/` -- 20 pages (full hub with design-system, tools, status, api-reference, architecture, components)
- **Root page at `/dashboard/developer/`** redirects to `ROUTES.DEVELOPER_CONSOLE` which is `/developer/tools/console`
- **Verdict:** `/dashboard/developer/` is the OLD tree. `/developer/` is the NEW canonical tree. Old tree should be deleted.

### 3b. `/dashboard/trails/` vs `/dashboard/camptrails/` -- REDIRECT ALIAS
- `/dashboard/trails/page.tsx` -- pure redirect to `/dashboard/camptrails`
- `/dashboard/camptrails/` -- full implementation (4 pages)
- **Verdict:** `/dashboard/trails/` is a redirect shim. Low priority but can be removed once all links are updated.

### 3c. `/admin/wiki/` vs `/admin/articles/` -- REDIRECT ALIAS
- `/admin/wiki/page.tsx` -- pure redirect to `/admin/articles`
- `/admin/articles/` -- full implementation (3 pages + _components/)
- **Verdict:** `/admin/wiki/` is a redirect shim. Low priority cleanup.

---

## 4. Empty/Stub Files (13 files)

| File | Lines | Content |
|------|-------|---------|
| `src/app/dashboard/3d-lab/_scenes/ClassicalOrders/index.ts` | 3 | Barrel export |
| `src/app/dashboard/3d-lab/_scenes/FARPlayground/index.ts` | 1 | Empty barrel |
| `src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/index.ts` | 1 | Empty barrel |
| `src/components/graphics/icons/index.ts` | 3 | Barrel export |
| `src/components/wiki/Accordion.tsx` | 3 | Stub |
| `src/components/wiki/AlertBox.tsx` | 2 | Stub |
| `src/components/wiki/AuthorityContent.tsx` | 2 | Stub |
| `src/components/wiki/ExamTip.tsx` | 2 | Stub |
| `src/components/wiki/WikiAccordion.tsx` | 2 | Stub |
| `src/components/wiki/WikiCallout.tsx` | 3 | Stub |
| `src/components/wiki/WikiCalloutBox.tsx` | 2 | Stub |
| `src/hooks/notes/index.ts` | 3 | Barrel export |
| `src/lib/paywall/index.ts` | 4 | Stub |

---

## 5. Commented-Out Code (~48 instances)

Approximately 48 lines of commented-out executable code (excluding TODO/FIXME/NOTE/URLs/eslint directives). These are scattered across the codebase -- not concentrated in any single file.

---

## 6. Orphaned Route Constants (8 entries)

Routes defined in `ROUTES` constant (`src/lib/constants/routes.ts`) with no corresponding pages and no code references:

| Constant | Path | Issue |
|----------|------|-------|
| `ROUTES.QUIZ` | `/dashboard/quiz` | No page.tsx, no references in code |
| `ROUTES.QUIZ_SESSION` | `/dashboard/quiz/:id` | No page.tsx, no references |
| `ROUTES.QUIZ_SESSION_SUMMARY` | `/dashboard/quiz/:id/summary` | No page.tsx, no references |
| `ROUTES.SESSIONS` | `/dashboard/sessions` | No page.tsx, no references |
| `ROUTES.SESSIONS_NEW` | `/dashboard/sessions/new` | No page.tsx, no references |
| `ROUTES.LIBRARY` | `/dashboard/library` | No page.tsx, no references |
| `ROUTES.LIBRARY_SUBJECT` | `/dashboard/library/subject/:id` | No page.tsx, no references |
| `ROUTES.LIBRARY_BANK` | `/dashboard/library/bank/:id` | No page.tsx, no references |
| `ROUTES.LIBRARY_MARKETPLACE` | `/dashboard/library/marketplace` | No page.tsx, no references |
| `ROUTES.ADMIN` | `/dashboard/admin` | No page at this path (admin is at `/admin`) |

**Also orphaned in `src/lib/routes.ts`:**
- `DASHBOARD_ROUTES` -- exported but never imported anywhere
- `NAV_GROUPS` -- exported but never imported anywhere

---

## 7. Unused Type Definitions (53 types)

Exported types/interfaces with zero imports elsewhere:

**src/types/app.ts (30 types):**
DifficultyLevel, NewSessionType, ReferenceType, DifficultyMode, UserNodeMastery, UserSubscription, SessionType, BoardExam, ExamProfile, QuestionReference, ReviewSession, SessionTemplate, QuestionUserPerformance, DailyUserStats, StudyTimeLog, ExamDomain, UserResponse, BankConfigItem, ReviewSessionConfig, SrsQueueItem, DomainMastery, QuizConfig, ReadinessLevel, ReadinessScoreSnapshot, MissionType, DailyMissionData, OnboardingStep, SessionInsightData, WikiCategory, WikiPageLink, WikiSearchPaginatedResult, OrganizationMember, FeatureFlagRecord, FinalStretchData, TrailType, TrailEnrollmentStatus

**src/types/3d-lab.ts (3 types):** HotspotType, LabQuestion, GuidedSequenceState

**src/types/ceo.ts (1 type):** CashBalanceEntry

**src/types/dashboard.ts (1 type):** HeatmapDay

**src/types/developer.ts (2 types):** ComponentPageData, StatusMetric

**src/types/supabase.ts (4 types):** Json, TablesInsert, TablesUpdate, CompositeTypes

**src/types/testing.ts (5 types):** UIMode, QuestionCountOption, StormNavigatorCellState, SessionDebriefData, ALESubjectId

**src/types/tools.ts (2 types):** FloorTilesInput, LotPlotterInput

**src/types/wiki.ts (3 types):** WikiCalloutType, WikiCalloutBoxProps, WikiTableRow

**src/types/bun-test.d.ts (1 type):** ExpectMatchers

---

## 8. Dead Utility Functions (78 exports)

Exported functions/constants with zero imports elsewhere. Top offenders by file:

| File | Dead Exports | Impact |
|------|-------------|--------|
| `src/lib/demo/data.ts` | 11 (all exports) | Entire file is dead |
| `src/lib/validations/index.ts` | 11 | Orphaned validation schemas |
| `src/lib/workflow/content-workflow.ts` | 6 | Entire workflow engine unused |
| `src/lib/constants/ads.ts` | 2 (all exports) | Ad system never implemented |
| `src/lib/admin/permissions.ts` | 4 (all exports) | Permission system unused |
| `src/lib/blindspot/generate-queue.ts` | 3 | Blindspot queue unused |
| `src/lib/wiki/wiki-actions.ts` | 4 | Duplicate wiki actions |
| `src/lib/wiki-markdown.ts` | 2 (all exports) | Markdown conversion unused |
| `src/lib/dev/dev-mode.ts` | 3 | Dev mode helpers unused |
| `src/lib/audit/audit-queries.ts` | 3 | Audit queries unused |
| Other files | 29 | Scattered across 20+ files |

---

## 9. Dev-Only Data in Production (6 files, ~886 lines)

| File | Lines | Risk |
|------|-------|------|
| `src/lib/demo/data.ts` | 129 | Demo profiles, fake data |
| `src/lib/demo/mock-supabase.ts` | 300 | Mock Supabase client |
| `src/lib/mocks/status.ts` | 55 | Mock status data |
| `src/data/mock-questions.json` | 402 | Mock question bank |
| `src/data/seed/models_3d.json` | - | Seed data |
| `src/data/seed/questions.json` | - | Seed data |
| `src/data/seed/taxonomy.json` | - | Seed data |
| `src/lib/supabase/seed.sql` | - | SQL seed file |

**Note:** Seed files may be intentional for dev setup. Demo/mock files are entirely orphaned (all exports are dead).

---

## 10. Stale Documentation (159+ files)

| Location | Files | Status |
|----------|-------|--------|
| `.planning/` | 38 | Outdated -- user confirmed stale |
| `prompts/` | 118 | Archived prompts, many deleted in git |
| `UI-CONSOLIDATION-IMPLEMENTATION-PLAN.md` | 1 (350 lines) | Root-level planning doc |
| `ADMIN-CONSOLE-AUDIT-V2.md` | 1 (759 lines) | Root-level audit doc |
| `slatecamp-codebase-audit.md` | 1 (429 lines) | Root-level audit doc |

---

## 11. Dual Icon Libraries

| Library | Files Importing | Role |
|---------|----------------|------|
| `@phosphor-icons/react` | 135 files | Primary (sidebar, routes, most components) |
| `lucide-react` | 57 files | Secondary (shadcn defaults, some components) |

Both ship full icon sets to the bundle. Consolidating to one would save ~70KB+ gzipped.

---

## Estimated Cleanup Effort

| Task | Effort | Risk |
|------|--------|------|
| Delete orphan components | 0.5h | None -- zero refs |
| Remove unused deps | 0.5h | Low -- run build after |
| Delete duplicate `/dashboard/developer/` tree | 1h | Low -- verify no deep links |
| Delete orphaned route constants | 0.5h | None -- unused |
| Delete unused types | 1h | None -- zero refs |
| Delete dead utility functions | 2h | Low -- verify with build |
| Delete stub files | 0.5h | Low -- check if imported |
| Remove dev/mock data from prod bundle | 1h | Medium -- verify no runtime refs |
| Clean stale docs | 1h | None |
| Consolidate icon libraries | 4-6h | Medium -- many files to update |
| Remove shadcn-ui duplicate | 0.25h | None |

**Total: ~12-14 hours**

---

## Recommended Deletion Order (safest first)

### Wave 1: Zero-Risk Deletions (2h)
1. Delete orphan components (9 files, 1,292 lines)
2. Remove orphaned route constants from `src/lib/constants/routes.ts`
3. Remove dead exports from `src/lib/routes.ts` (`DASHBOARD_ROUTES`, `NAV_GROUPS`)
4. Delete stub wiki components (7 files)
5. Remove `shadcn-ui` from package.json

### Wave 2: Low-Risk Deletions (3h)
6. Remove unused dependencies (8 packages)
7. Delete unused type definitions (53 types across 9 files)
8. Delete dead utility functions/files (start with fully-dead files: `ads.ts`, `permissions.ts`, `content-workflow.ts`, `wiki-actions.ts`, `wiki-markdown.ts`, `demo/data.ts`)
9. Delete `/dashboard/developer/` route tree (old, redirects to new `/developer/`)

### Wave 3: Medium-Risk Cleanup (4h)
10. Remove dev/mock data files from production bundle (move to test fixtures or delete)
11. Remove redirect shim routes (`/dashboard/trails/`, `/admin/wiki/`) after verifying no external links
12. Clean up commented-out code (~48 instances)

### Wave 4: Strategic (5h)
13. Consolidate icon libraries (Phosphor vs Lucide) -- pick one, migrate 57 files
14. Archive/delete `.planning/` and `prompts/` directories
15. Delete root-level planning docs

---

## Key Metrics

- **Total dead code identified:** ~2,200+ lines in components/utilities alone
- **Unused dependencies:** 8 packages safe to remove immediately
- **Orphaned route constants:** 10 entries pointing to non-existent pages
- **Dead type exports:** 53 types adding noise to the type system
- **Dead utility exports:** 78 functions/constants never imported
- **Duplicate route trees:** 3 pairs creating maintenance confusion
