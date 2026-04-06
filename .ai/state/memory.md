# State: Memory

**Last Updated:** 2026-04-06  
**Purpose:** Accumulated verified facts across sessions - survives session resets

---

## Codebase Verified Facts

### Portal Architecture
- **4 portals confirmed:** Dashboard (`/dashboard`), Admin (`/admin`), CEO (`/ceo` via `(protected)/ceo`), Developer (`/developer`)
- CEO portal is nested under `src/app/(protected)/ceo/` - not a top-level route segment
- Each portal has its own `AGENTS.md` at `src/app/{portal}/AGENTS.md`

### Tech Stack
- Next.js **16.1.6** (not 15.x)
- React **19.2.4** (not 18.x)
- TypeScript **5.9.3**
- Tailwind CSS **4.2.2**
- Supabase: `@supabase/supabase-js` **2.100.0** + `@supabase/ssr` **0.9.0**
- Package manager: **Bun** (not npm/yarn/pnpm)
- 3D: `@react-three/fiber` **9.5.0** + `three` **0.183.2**
- Zustand: **5.0.12**

### Statistics (as of 2026-04-05)
- Total `.tsx` files: ~1044
- Pages (App Router): 137 across 4 portals
- Server action files: 116 (in `src/lib/actions/`)
- Zustand stores: 5 (in `src/stores/`)
- React Contexts: 10
- Database tables: 51 (50 with RLS)
- RLS policies: 89+
- Database migrations: 60
- Production dependencies: 56
- Dev dependencies: 8

### Design System (SlateCamp)
- **Primary:** Camp Cobalt `#1B3FC4` - `text-primary` / `bg-primary`
- **Accent:** Camp Orange `#E8853A` - sparingly for progress/warm CTAs
- **Success:** Emerald `#2D9F6F` - `text-success`
- **Error:** Warm Red `#D64545` - `text-destructive`
- **Warning:** Amber `#D4951A` - `text-warning`
- **Background:** Surface Light `#F8F7F5` - `bg-background`
- **Text:** Ink Primary `#1A2332` - `text-foreground`
- **Border:** `#D4DAE3` - `border-border`
- **Secondary text:** `#4A5568` - `text-text-secondary`
- **Muted text:** `#8896A7` - `text-muted-foreground`

### Routes Verified
- `/dashboard` - 33 pages
- `/admin` - 27 pages
- `/ceo` - 4 pages (nested under `(protected)`)
- `/developer` - 21 pages

### Empty / Deprecated Folders
- `.ai/docs/05-Design/` - empty
- `.ai/docs/XX-Archive/` - empty
- `.ai/docs/portal/proposals/` - empty
- `.ai/docs/portal/superpowers/plans/` - empty
- `.ai/docs/portal/superpowers/specs/` - empty
- `.ai/docs/portal/wiki-articles/.omc/` - state files, to be deleted

### SQL Import Scripts (to archive)
- `_batch*.sql`
- `_sql_*.sql`
- `_combined_insert.sql`
- `_insert.json`

### Preserved Files (renamed/moved)
- `SlateCamp Design System.md` -> `archive/legacy/design-system.md`
- `COPY-CONTENT-SOURCE-OF-TRUTH.md` -> `03-design/002-copy-guide.md`
- `RLS-POLICY-PATTERNS.md` -> `05-reference/001-rls-patterns.md`
- `PLATFORM_OVERVIEW.md` -> `archive/legacy/platform-overview.md`
- `portal/architecture/SLATECAMP-ARCHITECTURE.md` -> `portal/architecture/001-architecture.md`

### Storybook Overhaul Verified Facts
- Story inventory baseline on 2026-04-06: `80` total stories
- Placeholder scaffold stories on 2026-04-06: `71`
- Real non-scaffold stories in the Phase 0 baseline: `9`
- Current live story count after Phase 6: `63`
- Current live placeholder story count after Phase 6: `0`
- Current live non-scaffold story/scene count after Phase 6: `63`
- Current feature story count after Phase 6: `3`
- Live route-private `_components` triage count in the Phase 5 workspace: `102` `.tsx` files
- Archived Storybook plan set: `.ai/archive/plans/storybook-overhaul-2026-04-06/`
- Migration tracker: `.ai/archive/plans/storybook-overhaul-2026-04-06/2026-04-06-storybook-migration-tracker.md`
- Placeholder baseline source: `scripts/storybook-placeholder-baseline.ts`
- Storybook governance guard source: `scripts/check-storybook.ts`
- Storybook governance command: `bun run check:storybook`
- Backward-compatible alias: `bun run check:storybook-placeholders`
- `scripts/check-storybook.ts` rejects both:
  - `Story scaffold for` placeholder markers outside the approved baseline
  - story files that do not import a real component module
- `package.json` now runs `check:storybook` before `storybook`, `build-storybook`, and `lint`
- `.github/workflows/storybook.yml` now installs dependencies, runs `bun run check:storybook`, and runs `bun run build-storybook`
- `.github/pull_request_template.md` now requires Storybook updates when public reusable components are added or materially changed
- Storybook ownership guidance now lives in:
  - `src/storybook/docs/README.md`
  - `src/app/developer/AGENTS.md`
  - `.ai/docs/portal/004-developer.md`
- `.ai/docs/04-development/001-getting-started.md` and `.ai/docs/04-development/003-scripts-reference.md` now describe the live Storybook governance commands and ownership split
- `bun run check:storybook` passed on 2026-04-06 after Phase 6 and scanned `63` story files with `0` placeholder marker files still tracked
- `build-storybook` passed on 2026-04-06 after the Storybook Phase 6 governance layer landed
- `build-storybook` emits upstream Storybook warnings about direct `eval` and large chunks; these came from Storybook internals, not repo code
- `src/features/**/*.stories.*` now contains `3` story files after Phase 5:
  - `src/features/3d-lab/components/CategoryGrid.stories.tsx`
  - `src/features/3d-lab/components/LabBrowser.stories.tsx`
  - `src/features/3d-lab/components/ModuleCard.stories.tsx`
- `.storybook/main.ts` now aliases `@/lib/actions/notes-actions` to `src/storybook/mocks/notes-actions.ts` so `DashboardHeader` can render in Storybook without importing the live server-action module
- `.storybook/main.ts` now also aliases Storybook-only wiki runtime modules for:
  - `@/lib/actions/wiki-actions`
  - `@/lib/actions/wiki`
  - `@/lib/actions/wiki-bookmarks`
  - `@/lib/actions/wiki-interactions`
  - `@/lib/actions/wiki-quiz`
  - `@/lib/actions/teach-back`
  - `@/lib/actions/ei-prompts`
  - `@/lib/analytics`
  - `next/dynamic`
- `src/storybook/decorators/withAppProviders.tsx` now wraps stories in `NoteContextProvider`
- The canonical Phase 3 story surface now keeps:
  - `22` rewritten UI/shared story files
  - `7` pre-existing real component stories
  - `1` curated scene
- Phase 4 added the dedicated `Wiki/` Storybook section with:
  - `5` article/navigation shell story modules
  - `8` wiki block story modules
  - `6` teaching/quiz story modules
  - `5` source, note, and reference utility story modules
  - `5` widget story modules
  - `1` full article composition scene
- The only non-story runtime wiki changes in Phase 4 were these alias files:
  - `src/components/wiki/widgets/bp344/RecallPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/DimensionPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/BodyDimensionPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/SpatialQualityPractice.tsx`
- Those `*Practice` files now re-export the canonical `*Drill` implementations used by `src/components/wiki/widgets/registry.ts`
- Phase 5 promoted these previously route-private 3D Lab components into `src/features/3d-lab/components`:
  - `CategoryGrid`
  - `LabBrowser`
  - `ModuleCard`
  - `ModuleList`
  - `ModuleViewer`
- Phase 5 also canonicalized these 3D Lab support files under feature ownership:
  - `src/features/3d-lab/components/CanvasWrapper.tsx`
  - `src/features/3d-lab/components/GlobalCanvasPortal.tsx`
  - `src/features/3d-lab/hooks/useInvalidateOnChange.ts`
- Phase 5 promoted these previously route-private calculator surfaces into `src/components/calculators`:
  - `FlooringScene`
  - `FlooringInputPanel`
  - `PaintScene`
  - `PaintInputPanel`
  - `DrywallScene`
  - `DrywallInputPanel`
  - `CHBScene`
  - `CHBInputPanel`
- After the Phase 5 extraction pass, `rg -n "@/app/.+/_components/" src` returned only a documentation line in `src/app/admin/AGENTS.md`
- `bun run build-storybook` passed on 2026-04-06 after the Phase 5 extraction landed and the previous empty-feature-story warning disappeared
- `bun run build` passed on 2026-04-06 after the Storybook Phase 6 changes landed
- Wiki verification for Phases 0, 1, 2, 2.5, and 3:
  - `/dashboard/wiki/[slug]` remained present in the successful build output
  - `git diff --name-only -- src/app/dashboard/wiki src/components/wiki` returned no changes
- Wiki verification for Phase 4:
  - `/dashboard/wiki/[slug]` remained present in the successful build output
  - `git diff --name-only -- src/app/dashboard/wiki` returned no changes
  - the only non-story diffs under `src/components/wiki` were the four `*Practice` alias files listed above
- Wiki verification for Phases 5 and 6:
  - `/dashboard/wiki/[slug]` remained present in the successful build output
  - `git diff --name-only -- src/app/dashboard/wiki src/components/wiki` returned only the four `*Practice` alias files listed above

### Testing & Quizzing Suite Audit & Consolidation (Pivoted 2026-04-06)
- **Architecture Pivot:** Moving from discrete static modes to a unified **"Hero Configurator"** on `/dashboard/testing`.
- **UI Design:** Tactical configurator using drag-and-drop for subject selection, integrated sliders for question count/timer, and a high-intent **"Slide to Start"** CTA.
- **Backend Algorithm:** Replacing randomization with a **60/30/10 Intelligent Routing** algorithm:
  - 60% Unseen questions (discovery).
  - 30% Remediation questions (incorrectly answered).
  - 10% Spaced Repetition (mastered, 14+ days since last seen).
- **Database Optimization (Real-time Pivot):** Adopted an event-driven approach with a `user_question_states` table maintained by **PostgreSQL Triggers**.
  - Replaces Materialized Views to avoid stale data between sessions.
  - Automatically tracks correctness, attempt count, and **time spent per question** (stamina metrics).
- **Specialization Preservation:** `SimulationShell` (for Full Exam) and `EnduranceShell` (for Design Training) remain as functional overrides to the generalized engine.
- **Analytics & IP:** Patent-backed CAGE tokens and gesture signal tracing (Claim 1b, 6, 7, 20) are preserved within the unified `StandardQuizShell`.

### Storybook Runtime Foundation Verified Facts
- Story discovery now targets only:
  - `src/components/**/*.stories.*`
  - `src/features/**/*.stories.*`
  - `src/storybook/scenes/**/*.stories.*`
- `src/app/**/*.stories.*` is no longer scanned by Storybook
- `src/storybook/` now exists with:
  - `decorators/withAppProviders.tsx`
  - `fixtures/portal.ts`
  - `fixtures/wiki.ts`
  - `mocks/browser.ts`
  - `mocks/next-link.tsx`
  - `mocks/next-navigation.tsx`
  - `mocks/server-actions.ts`
  - `scenes/developer/BreadcrumbsScene.stories.tsx`
- Storybook aliases `next/link` and `next/navigation` to local mocks in `.storybook/main.ts`
- Storybook preview now wraps stories in `ThemeProvider` and `TooltipProvider`, with optional `Toaster` and `NoiseFilter` support through `appShell` parameters
- Autodocs remains tag-scoped via `.storybook/main.ts`, so docs stay opt-in and intentional
- `src/features/**/*.stories.*` is no longer empty after Phase 5; Storybook now discovers the three promoted 3D Lab feature stories

### Phase 2.5 Shared Primitive Canonicalization Facts
- `/dashboard/developer` now keeps only redirect pages at:
  - `src/app/dashboard/developer/page.tsx`
  - `src/app/dashboard/developer/console/page.tsx`
  - `src/app/dashboard/developer/db/page.tsx`
  - `src/app/dashboard/developer/logs/page.tsx`
  - `src/app/dashboard/developer/test-data/page.tsx`
- Deleted dead duplicate dashboard developer files:
  - `src/app/dashboard/developer/layout.tsx`
  - `src/app/dashboard/developer/loading.tsx`
  - `src/app/dashboard/developer/dev-nav.tsx`
  - `src/app/dashboard/developer/console/console-client.tsx`
  - `src/app/dashboard/developer/console/loading.tsx`
  - `src/app/dashboard/developer/db/loading.tsx`
  - `src/app/dashboard/developer/logs/loading.tsx`
  - `src/app/dashboard/developer/test-data/loading.tsx`
  - `src/app/dashboard/developer/test-data/test-data-client.tsx`
- `src/components/shared/page-header.tsx` and `src/components/shared/page-header.stories.tsx` were deleted in Phase 2.5
- `SectionHeader` is now the canonical shared page-header primitive for the listed `/developer` pages
- `src/components/developer/Breadcrumbs.tsx` now delegates rendering to `src/components/shared/breadcrumb.tsx`
- `src/components/shared/breadcrumb.tsx` is now client-safe so it can be reused from developer portal client components
- `/developer/tools/db` and `/developer/tools/logs` now use the shared `DataTable` and `EmptyState` primitives
- `/developer/status/database` and `/developer/status/infrastructure` now use `formatRelativeTime` instead of local `timeAgo()` helpers

### Testing & Quizzing Audit Verified Facts (2026-04-06)
- **Bottleneck Identified:** `submitAnswer` Action performs 10-12 DB round-trips per answer in immediate feedback mode.
- **Redundant Fetches:** `questions` row is fetched multiple times per interaction across `submitAnswer` and `classifyAndStoreError`.
- **Sequential Awaiting:** Non-critical UI updates like Mastery/SRS/Behavioral analysis are currently blocking the correctness response.
- **Session Stats:** `getSessionInteractionStats` counts the entire `user_interactions` table for the session on every answer, causing $O(N)$ growth in latency as the session progresses.
- **Cache Invalidation:** `revalidatePath('/dashboard')` is called on every answer, purging the global data cache unnecessarily.
- **Implementation Plan Created:** `.ai/plans/testing-feature-audit.md` outlines a 4-phase strategy to move logic to RPCs, consolidate fetching, and decouple non-blocking tasks.

### Developer Surface Cleanup Verified Facts
- Live code no longer references `/developer/components`
- `ROUTES.DEVELOPER_COMPONENTS` was removed from `src/lib/constants/routes.ts`
- `src/lib/developer/componentRegistry.ts` was deleted
- Duplicate developer wrappers removed:
  - `src/app/developer/_components/CopyButton.tsx`
  - `src/app/developer/_components/PropTable.tsx`
- Retired developer component-library-only files:
  - `src/components/developer/ComponentPageLayout.tsx`
  - `src/components/developer/DocSection.tsx`
  - `src/components/developer/PreviewArea.tsx`
  - `src/components/developer/PropTable.tsx`
  - `src/components/developer/PreviewArea.stories.tsx`
  - `src/components/developer/PropTable.stories.tsx`
- Retired dead route residue:
  - `src/app/developer/components/loading.tsx`
  - `src/app/dashboard/developer/docs/page.tsx`
  - `src/app/dashboard/developer/docs/loading.tsx`
- `src/components/developer` now contains only `Breadcrumbs` plus the status primitives and their stories
- `src/lib/developer` now contains only `changelog.ts` and its AGENTS file
- State handoff note: the pre-existing `.ai/state/current-task.md` was stale and `.ai/tasks/` does not exist in the live workspace

### 3D Lab Implementation Completion (2026-04-06)
- **Visual Hierarchy Standardized**:
  - Entire 3D Lab feature refactored to use Campfire semantic tokens (`primary`, `camp-black`, `text-secondary`, etc.).
  - Unified type scale: `font-mono 9px` for eyebrows, `13px-16px` for titles, `12px` for body copy.
  - Consistent overlay treatment: `bg-white/95 backdrop-blur-md shadow-xl border-border-default/50`.
- **Component Evolution**:
  - `LabTopBar` refactored for professional "dark mode" HUD feel.
  - `OnboardingFlow` refined with responsive behavior (centered desktop, mobile bottom-sheet).
  - `ModuleCard` and `CategoryCard` normalized with standard radii, spacing, and hover shadows.
- **Plan Execution Status**: 
  - All three phases of `.ai/plans/2026-04-06-3d-lab-audit-and-implementation.md` are functionally complete.
  - Containerization debt is fully resolved; `src/app/dashboard/3d-lab/` is now a clean route shell.

### 3D Lab Deep UI Audit Follow-up Blocker (2026-04-06)
- A follow-up prompt on 2026-04-06 requested a deeper UI/component audit and Storybook implementation plan rewrite for `.ai/plans/2026-04-06-3d-lab-audit-and-implementation.md`
- That prompt also required high-confidence verification that the needed source material existed entirely inside the prompt's `<documents>` and `<context>` tags
- The `<documents>` block contained placeholders instead of the actual contents of:
  - `.ai/plans/2026-04-06-3d-lab-audit-and-implementation.md`
  - the specific 3D Lab UI component files to audit
- Under that constraint, the follow-up rewrite was blocked and the plan file was left unchanged pending the real inline document payload

### 3D Lab Plan Storybook Sync Requirement (2026-04-06)
- `.ai/plans/2026-04-06-3d-lab-audit-and-implementation.md` now explicitly requires Storybook updates whenever 3D Lab UI components are componentized, modularized, moved behind new shell boundaries, or materially restyled
- The plan's Phase 2 now makes story, fixture, mock, and decorator updates part of the same change set as component extraction work
- The plan's Phase 3 now requires Storybook visual coverage for shared shell primitives, overlay states, and module variants so visual hierarchy changes are reviewed outside the live route

### Quiz-v2 Testing Feature Remediation Verified Facts (2026-04-06)
- **Hardened loading:** `getSessionQuestions` now derives question slices server-side from `sessionId`, `offset`, and `limit`, preventing arbitrary question payload requests.
- **Single-Owner Finalization:** `submitAnswer` now triggers session completion internally on the last question, awaiting post-submit work to ensure ordered execution.
- **Idempotent Finalization:** `endSession` includes terminal status guards to prevent redundant score recomputations and notifications.
- **RPC Fallback Alignment:** `submitAnswer` legacy fallback path now returns `wikiSlug` and correctly updates `quiz_sessions` counters (`answered_count`, `correct_count`).
- **Unified Question Contract:** All question payload paths use the centralized `fetchQuestionsForClient` mapper in `@/lib/quiz/to-client-question`.
- **Validation:** All quiz-v2 server actions now utilize strict Zod input validation (`schemas.ts`).
- **Test Coverage:** Added comprehensive tests for `submitAnswer` (`submit-answer.test.ts`) covering success, fallback, and completion paths.
- **3D-Lab Fix:** Confirmed 3D-lab module resolution issues were resolved by the feature refactor (`src/features/3d-lab/utils/`).
- **Verification:** `bun test`, `bun run lint`, `bun run type-check`, and `bun run build` all passed on 2026-04-06.

---

## Session History

### Session 2026-04-05: Initial Audit
- Audited `.ai/docs/` numbered folders - all found outdated vs live codebase
- Verified portal counts, routes, package versions against actual files
- Confirmed CEO portal nested under `(protected)/ceo`
- Confirmed Bun as package manager (not npm)
- Confirmed Next.js 16.1.6 (not 15.x)
- Identified 10 numbered folders + 2 empty folders + SQL imports + state files

### Session 2026-04-05: v4.0 Plan Created
- Created `docs-implementation-plan.md` v4.0 - full rewrite plan with 42 documents
- Identified source-to-document mapping for each planned doc
- Changed archive strategy from delete to archive based on user preference

### Session 2026-04-06: v5.0 Upgrade - Model Workspace Protocol
- Upgraded plan to Model Workspace Protocol pattern
- Added `.ai/prd.md`, `.ai/state/memory.md`, `.ai/state/current-task.md`, `.ai/logs/changelog.md`
- Created task files under `.ai/tasks/`
- Created full directory structure

### Session 2026-04-06: Storybook Overhaul Phase 0
- Confirmed the active Storybook plan is now archived at `.ai/archive/plans/storybook-overhaul-2026-04-06/2026-04-06-storybook-overhaul-plan.md`
- Confirmed the old `.ai/state/current-task.md` did not reflect the live Storybook work
- Audited the live Storybook baseline: 80 stories total, 71 placeholder scaffolds, 9 real stories
- Created the migration tracker now archived at `.ai/archive/plans/storybook-overhaul-2026-04-06/2026-04-06-storybook-migration-tracker.md` and assigned every current story a disposition
- Added `scripts/storybook-placeholder-baseline.ts`
- Added `scripts/check-storybook-placeholders.ts`
- Wired the placeholder guard into `lint`, `storybook`, and `build-storybook`
- Fixed a TypeScript narrowing issue in the new guard script after the first `bun run build` failed
- Re-ran `bun run build` successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built and no wiki source files changed

### Session 2026-04-06: Storybook Overhaul Phase 1
- Removed stale `/developer/components` links from the developer sidebar, developer search, and shared route constants
- Deleted `src/lib/developer/componentRegistry.ts`
- Removed duplicate developer wrappers under `src/app/developer/_components`
- Retired the component-library-only developer files and their two stories
- Retired the dead `/dashboard/developer/docs` route residue
- Updated AGENTS files in `src/app/developer`, `src/components/developer`, `src/lib/developer`, and `src/components/portal`
- Updated the Storybook migration tracker to reflect the current 78-story inventory
- Re-ran `bun run build` successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built and no wiki source files changed

### Session 2026-04-06: Storybook Overhaul Phase 2
- Narrowed Storybook discovery to `src/components`, `src/features`, and `src/storybook/scenes`
- Removed routine `src/app/**/*.stories.*` scanning from `.storybook/main.ts`
- Added the `src/storybook/` support layer with decorators, fixtures, mocks, scenes, and docs
- Added local Storybook aliases for `next/link` and `next/navigation`
- Added browser mocks for clipboard, `IntersectionObserver`, `ResizeObserver`, and `matchMedia`
- Added reusable portal and wiki fixtures plus generic mock server-action helpers
- Updated `.storybook/preview.ts` to mirror the live provider stack where it matters
- Added `src/storybook/scenes/developer/BreadcrumbsScene.stories.tsx` to exercise the mocked router runtime
- Ran `bun run build-storybook` successfully
- Re-ran `bun run build` successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built and no wiki source files changed

### Session 2026-04-06: Storybook Overhaul Phase 2.5
- Collapsed the dead `/dashboard/developer` subtree to redirect-only pages and deleted the copied client/loading/layout files
- Standardized the listed `/developer` pages onto `SectionHeader level="page"`
- Reused `ActionCard` for the main `/developer` and `/developer/tools` navigation cards
- Retired `src/components/shared/page-header.tsx` and `src/components/shared/page-header.stories.tsx`
- Refactored `src/components/developer/Breadcrumbs.tsx` to render through the shared breadcrumb primitive
- Moved `/developer/tools/db` and `/developer/tools/logs` onto shared `DataTable` and `EmptyState`
- Replaced the duplicated developer `timeAgo()` helpers with `formatRelativeTime`
- Ran `bun run check:storybook-placeholders` successfully and confirmed the placeholder count dropped to 70
- Re-ran `bun run build` successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built and no wiki source files changed

### Session 2026-04-06: Storybook Overhaul Phase 3
- Replaced the placeholder scaffolds for the canonical `ui` and `shared` documentation surface with real Storybook stories
- Deleted the remaining dormant placeholder story files under `src/components/ui` and `src/components/shared`
- Added real stories for:
  - `action-card`
  - `breadcrumb`
  - `CampfireLoader`
  - `DashboardHeader`
  - `DashboardPageSkeleton`
  - `data-table`
  - `difficulty-bar`
  - `empty-state`
  - `question-card`
  - `question-dot-navigator`
  - `score-display`
  - `section-header`
  - `stat-card`
  - `accordion`
  - `badge`
  - `button`
  - `card`
  - `dialog`
  - `input`
  - `separator`
  - `tabs`
  - `tooltip`
- Added `src/storybook/mocks/notes-actions.ts` and aliased `@/lib/actions/notes-actions` inside `.storybook/main.ts` so Storybook can render `DashboardHeader` without the live server-action module
- Reduced the live story inventory to `30` real story files/scenes and eliminated the placeholder backlog completely
- Re-ran `bun run check:storybook-placeholders`, `bun run build-storybook`, and `bun run build` successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built and no wiki source files changed

### Session 2026-04-06: Storybook Overhaul Phase 4
- Expanded `src/storybook/fixtures/wiki.ts` into a reusable wiki article fixture set for navigation, blocks, teaching flows, utilities, search, bookmarks, and quiz state
- Added Storybook-only wiki runtime mocks for:
  - `wiki-actions`
  - `wiki`
  - `wiki-bookmarks`
  - `wiki-interactions`
  - `wiki-quiz`
  - `teach-back`
  - `ei-prompts`
  - `analytics`
  - `next/dynamic`
- Extended the Storybook provider decorator with `NoteContextProvider`
- Added the dedicated `Wiki/` story section covering article shell, navigation, blocks, teaching, sources/notes, widgets, and the full article scene
- Added `src/storybook/scenes/wiki/WikiArticleScene.stories.tsx`
- Consolidated the duplicate `*Practice` widget files into thin aliases over the canonical `*Drill` implementations
- Increased the live story inventory from `30` to `60` story files/scenes while keeping the placeholder backlog at `0`
- Re-ran `bun run check:storybook-placeholders`, `bun run build-storybook`, and `bun run build` successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built, no route files under `src/app/dashboard/wiki` changed, and the only non-story wiki runtime diffs were the four widget alias files

### Session 2026-04-06: Storybook Overhaul Phase 5
- Confirmed the live route-private `_components` inventory was `102` `.tsx` files, not the older `104` count in the plan text
- Promoted the reusable 3D Lab browser surface into `src/features/3d-lab/components`
- Promoted `DASHBOARD_VISIBLE_IDS` into `src/features/3d-lab/config/dashboard-visibility.ts` and updated admin consumers to import the canonical feature config
- Canonicalized `CanvasWrapper`, `GlobalCanvasPortal`, and `useInvalidateOnChange` under feature ownership while leaving thin route wrappers behind
- Promoted the shared calculator scenes and input panels into `src/components/calculators`
- Added three feature stories for the promoted 3D Lab catalog surface:
  - `CategoryGrid.stories.tsx`
  - `LabBrowser.stories.tsx`
  - `ModuleCard.stories.tsx`
- Increased the live story inventory from `60` to `63` story files/scenes while keeping the placeholder backlog at `0`
- Re-ran `bun run check:storybook-placeholders`, `bun run build-storybook`, and `bun run build} successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built and the wiki diff still showed only the four pre-existing Phase 4 widget alias files

### Session 2026-04-06: Storybook Overhaul Phase 6
- Added `scripts/check-storybook.ts` as the unified Storybook governance guard
- Added `check:storybook` to `package.json` and kept `check:storybook-placeholders` as a compatibility alias
- Wired the new guard into `storybook`, `build-storybook`, and `lint`
- Added `.github/workflows/storybook.yml` to build Storybook in CI
- Added `.github/pull_request_template.md` with a checklist entry for Storybook updates on public reusable component changes
- Updated `src/storybook/docs/README.md`, `src/app/developer/AGENTS.md`, and `.ai/docs/portal/004-developer.md` so ownership is explicit:
  - reusable component docs belong in Storybook
  - operational and architecture docs belong in `/developer`
- Refreshed `.ai/docs/04-development/001-getting-started.md` and `.ai/docs/04-development/003-scripts-reference.md` to reflect the live scripts and governance flow
- Re-ran `bun run check:storybook`, `bun run build-storybook`, and `bun run build` successfully
- Verified the wiki happy path remained intact because `/dashboard/wiki/[slug]` still built and the wiki diff still showed only the four pre-existing Phase 4 widget alias files

### Session 2026-04-06: 3D Lab Audit and Refactor Plan
- Read `CLAUDE.md`, `.ai/state/*`, and the local `AGENTS.md` files covering `src`, `src/app/dashboard`, `src/app/dashboard/3d-lab`, `src/features`, and `src/features/3d-lab`
- Audited the live 3D Lab route shell, query-param viewer path, standalone `wall-configurator` route, dashboard navigation links, feature runtime imports, telemetry modules, and schema-linked server actions
- Verified that the 3D Lab shell currently mixes a fixed route-level canvas, multiple non-canonical entry points, dual lab stores, and unused persistence/analytics contracts
- Wrote the dated implementation plan at `.ai/plans/2026-04-06-3d-lab-audit-and-implementation.md`
- Updated `.ai/state/current-task.md` and `.ai/state/memory.md` to preserve the 3D Lab findings for the next implementation phase

### Session 2026-04-06: 3D Lab Deep UI Audit Follow-up Attempt
- Read all current files under `.ai/state/`, including `active-tasks/*`, `current-task.md`, `memory.md`, and `multi-agent.md`, before proceeding
- Re-validated the prior 3D Lab and Storybook baseline from supermemory
- Read `CLAUDE.md` before finishing the state update
- Stopped before touching `.ai/plans/2026-04-06-3d-lab-audit-and-implementation.md` because the follow-up prompt's `<documents>` section only contained placeholders, not the actual current audit markdown or the 3D Lab UI component source
- Updated `.ai/state/current-task.md` and `.ai/state/memory.md` to preserve the blocker and avoid accidental duplicate or ungrounded work

### Session 2026-04-06: 3D Lab Plan Storybook Sync Follow-up
- Re-read `.ai/state/*` and re-opened `.ai/plans/2026-04-06-3d-lab-audit-and-implementation.md`
- Updated the live 3D Lab implementation plan so Storybook work is required whenever 3D Lab UI components are componentized, modularized, moved, or materially restyled
- Expanded the plan language to require paired story, fixture, mock, decorator, and isolated visual coverage updates during the same implementation pass
- Updated `.ai/state/current-task.md` and `.ai/state/memory.md` to preserve the new Storybook sync requirement

### Session 2026-04-06: Quiz-v2 Testing Feature Remediation
- Read `.ai/state/*` and `.ai/plans/2026-04-06-testing-feature-remediation-plan.md`
- Verified implementation of server-derived slicing in `getSessionQuestions`
- Verified single-owner finalization logic in `submit-answer.ts`
- Verified idempotency guards in `end-session.ts`
- Verified RPC fallback alignment and unified question payload contract
- Added `src/lib/actions/quiz-v2/submit-answer.test.ts` with valid UUID mocks
- Ran full verification suite: `bun test`, `bun run lint`, `bun run type-check`, and `bun run build`
- All verification steps passed successfully
- Updated `src/lib/actions/quiz-v2/AGENTS.md` to document the hardened architecture
- Finalized `.ai/state/current-task.md` and `.ai/state/memory.md`

### Session 2026-04-07: Testing Feature UI Audit & Remediation
- Read all current files under `.ai/state/`, including `current-task.md`, `memory.md`, `multi-agent.md`, and active tasks.
- Task initially blocked due to missing inline payloads in the prompt's `<documents>` block. User overrode the block and requested a full codebase search.
- Successfully searched the codebase and found the requested components (`SlideToStart`, `SlideToSubmit`, `HeroConfigurator`, and `ReviewHub`).
- **Aggressive Deprecation**: Stripped all legacy testing mode UI logic (Zone 1, Zone 2, Zone 3) from `ReviewHub.tsx`.
- **Component Deduplication**: Deleted the redundant `SlideToStart` component and its stories. Refactored `HeroConfigurator.tsx` to use the battle-tested `SlideToSubmit` component instead.
- **Component Deduplication (Global Sliders)**: Extracted the `UnifiedSlider.tsx` component—which implements the official SlateCamp Design System v1 slider spec—from its obscure location in `src/features/3d-lab/DevControlsModule/dashboard/` to the global `src/components/ui/` library. Exported it via `components/ui/index.ts`.
- **Refactoring**: Replaced the custom inline HTML and generic Shadcn `Slider` primitives inside `HeroConfigurator.tsx` with the newly global `<UnifiedSlider />` for configuring the Question Count and Timer.
- **Error Resolution**: Fixed missing TypeScript interface properties (`disciplines`, `difficultyMode`, `timer` modes, `results` display flags) for the `startSession` function config in `HeroConfigurator.tsx`.
- **Backend Refactoring**: Fixed an invalid Supabase SDK nested `.in()` query syntax in `intelligent-routing.ts` by splitting queries to pre-fetch interacting IDs before routing.
- **Validation**: Re-ran the TypeScript compiler and `bun run build`. Confirmed successful optimized production build. Updated `.ai/state/current-task.md`.

### New Architectural Directives (Testing & Auth)
- **Zero-Tolerance for Fatal Auth Action Errors:** Server actions (like `startSession`) must NEVER throw native `Error` objects for tier validation. Doing so crashes the Next.js router. Actions must return a structured response (e.g., `{ error: 'requires_pro_tier' }`) that UI components can catch to render graceful paywalls.
- **Global Subscription Context (No Prop-Drilling):** User tier data must be fetched and cached via a centralized `SubscriptionProvider` (React Context) at the root layout. Passing `userTier` down via component props from the server to deep client files like `ReviewHub.tsx` is strictly forbidden.
- **Zustand Hydration Safeguards:** Client components reading from `localStorage` persisted stores (like `useQuizStore`) MUST gate their renders behind `_hasHydrated` booleans. Rendering default state on the server and flipping to persisted state on the client without a fallback (e.g., `<CampfireLoader />`) causes severe hydration vulnerabilities.
- **Timer Render Isolation:** The `useQuizTimerStore` ticks every 1000ms. Any component subscribing to it must use strictly scoped selectors (e.g., `useShallow((s) => s.elapsedMs)`) to prevent full-tree re-render cascades in the `StandardQuizShell`.

### New Architectural Directives (Full-Stack Optimization & Resilience)
- **Supabase Query Optimization:** Never execute looping N+1 queries inside Server Actions (e.g., chunked `for` loops in `.in()` statements). Always execute a single batch query or a relational `.select('*, relations(*)')`. Do not select massive JSON objects (`rationale`, `options`) if the logic only requires simple ID validations.
- **UX Resilience & Network Drops:** All client-side interaction triggers that initiate Server Actions must catch failures and trigger a Toast or modal boundary. Relying purely on Next.js Server Component page loads (`router.push()`) without client-side error handling leaves the UI dead if the network drops mid-fetch.
- **Strict Tier-Gating Abstraction:** The Edge middleware (`middleware.ts`) may bypass auth checks for performance, but Server Actions must NEVER throw hard `Error` instances upon tier rejection. They must return typed `{ success: false, error: 'requires_pro_tier' }` responses. The React tree MUST implement a unified `<SubscriptionProvider>` Context at the root layout to avoid prop-drilling `userTier` across dozens of pages.

---

### Session 2026-04-07: PROJECT PANOPTICON V7 — Ultrawork Complete

- **Completed 3-pass exhaustive audit** of entire SlateCamp codebase via parallel background agents
- **Generated 11 audit files** in `.ai/plans/` covering: auth/gating, state management, testing/quiz, database layer, dashboard portal, admin portal, API routes, shared components, developer/CEO portals
- **Created MASTER-INDEX.md** as central navigation hub for all audit artifacts
- **Pass 1 (Discovery):** Documented every route, component, data fetch, state hook, UX path
- **Pass 2 (Synthesis):** Identified cross-domain patterns (client-side auth, N+1 queries, throw Error anti-pattern)
- **Pass 3 (Omniscience):** Documented exact DB column names, API payloads, UI state machines
- **5 CRITICAL findings:** Client-side session spoofing, API route authorization gaps, throw Error tier gating, N+1 taxonomy, timer hydration bug
- **Audit files located:** `.ai/plans/audit-*.md`

### Top 3 Global Design Patterns SlateCamp MUST Adopt

1. **Server-Side Authorization Only** — Never read auth/tier from localStorage. All portal layouts must be Server Components. Client receives only verified user context from server.

2. **Typed Result Objects for Server Actions** — Replace all `throw new Error()` with typed `{ success: false, error: 'CODE' }` responses. Client components render paywalls, not error crashes.

3. **SQL-Based Computation** — Move complex filtering/exclusion to PostgreSQL CTEs and RPC functions. Never transmit thousands of IDs to client for exclusion.

---

*Add verified facts here. Every entry must be traceable to a source file.*
$memoryContent
