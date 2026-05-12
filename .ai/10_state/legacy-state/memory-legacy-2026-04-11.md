> Legacy note
> Preserved state memory snapshot from 2026-04-11.
> Current human-readable state authority lives in `../`.

# State: Memory

**Last Updated:** 2026-04-11
**Purpose:** Accumulated verified facts across sessions - survives session resets

---

## Decisions

- [2026-04-11] Enterprise verdict on the current entitlement and developer-mode platform: **not enterprise-grade**. The architecture is transitional, with multiple active entitlement models and no single canonical entitlement resolver in universal use.
- [2026-04-11] The feature-gate and developer-mode source-of-truth product spec now exists at `.ai/docs/01-product/010-Feature-Gate-And-Developer-Feature-Specification.md`.
- [2026-04-11] Feature-gate and developer-mode documentation should live in a single combined product spec at `.ai/docs/01-product/010-Feature-Gate-And-Developer-Feature-Specification.md`, not split docs. Reason: identity resolution, policy helpers, effective tier, dev flags, and enforcement behavior are coupled in code.
- [2026-04-11] `src/lib/admin/access-policy.ts` is the explicit surface-policy layer for internal tooling visibility and internal tier bypass. `src/lib/admin/roles.ts` remains the identity-resolution layer.
- [2026-04-11] `sme_reviewer` is intentionally excluded from `canSeeDevToolbar()` and `canUseInternalTierBypass()` by default. Reason: content review is not equivalent to platform-debug access.
- [2026-04-11] The current entitlement architecture is mixed-state: some surfaces use effective tier + policy helpers, while residual surfaces still use raw subscription checks. Product documentation must state that explicitly.
- [2026-04-10] Admin CMS revalidation MUST include revalidateTag(CACHE_TAGS.wiki, 'max') for all wiki article mutations to ensure student-view consistency. Implemented in content.ts, pipeline.ts, and bulk.ts.
- [2026-04-10] updateQuestion server action is consolidated in src/lib/actions/admin/questions.ts and supports both standalone and unified editor data shapes (including options normalization).
- [2026-04-10] Offline detection in SaveAllBar uses navigator.onLine to prevent data loss during connectivity issues.
- [2026-04-09] Unified Viewport Shell replaces per-template layout assembly. Slot-based composition — shell provides containers, templates provide content only.
- [2026-04-09] ONE ViewportSidebar component, ONE PanelCollapseButton — replaces 7+ divergent panel implementations (LabPanelLayout, GenericControlPanel, ControlPanel, InfoPanel, ComplianceReportPanel, DevControls dashboard panels, WallConfigurator ConfigPanel/BOMPanel).
- [2026-04-09] Shell is 100% DOM-rendered. Zero Three.js scene cost. CSS Grid layout (DevControls pattern: left + handle + 1fr + handle + right).
- [2026-04-09] ViewportShellConfig + ViewportCapabilities added to ModuleConfig. Convention-over-configuration defaults per template type.
- [2026-04-09] crossSectionEnabled and explodedViewEnabled (already in useLabViewStore) wired to shell toolbar toggles.
- [2026-04-09] New store: useViewportShellStore (Store 11) for sidebar collapse, view mode, camera preset, mobile tab state.
- [2026-04-09] Panel collapse animation: grid-template-columns CSS transition (200ms cubic-bezier) — proven by DevControlsModule.

## UX Findings

- [2026-04-10] FTUX Gap: New users are currently not forced through the onboarding flow after registration due to a missing `next=/onboarding` parameter in the `RegisterForm.tsx` OAuth redirect.
- [2026-04-10] FTUX Gap: The `/dashboard` route lacks a profile guard that checks for `onboarding_completed_at`. This allows users with 0 data to see empty skeletons on the dashboard without being oriented.
- [2026-04-10] FTUX Constraint: The "Get Your Free Readiness Score" CTA on the landing page creates a high expectation that must be met by the onboarding flow and the dashboard's initial state.

## Architecture Notes

- [2026-04-09] LabViewportFrame.tsx:84 fix: changed overlay div from `relative` to `absolute inset-0` — panels were being pushed below Canvas and clipped by overflow-hidden.
- [2026-04-09] New shell components planned: ViewportShell, ViewportSidebar, ViewportToolbar, ViewportBottomSheet, ViewportStatusBar, ViewportHeader, PanelCollapseButton — all in src/features/3d-lab/components/shell/.
- [2026-04-09] LabModuleShell deprecated after Phase 2. LabPanelLayout deprecated after Phase 2.
- [2026-04-09] 5-phase migration: Shell Foundation → Standard Templates (Parametric/Exploded/Cutaway) → Remaining Templates (FloorPlan/Animated/Calculator) → WallConfigurator → DevControlsModule.
- [2026-04-09] Legacy bespoke scenes (FARPlayground, ClassicalOrders, NBCPEnvelope) excluded from migration.

## Wall Configurator v2 Decisions

- [2026-04-09] Instanced geometry: extend GeometryInstruction with optional fields (instancedShape, instancedShapeArgs, instancedPositions, instancedRotations, instancedColors) + add 'instanced' to GeometryType union. Follows extruded-profile precedent. Rejected: separate InstancedGeometryInstruction type — would break ParametricSceneConfig.geometry return type.
- [2026-04-09] Parameter visibility: add optional visibleWhen predicate to ParameterDef (mirrors AnnotationDef pattern). Target: GenericControlPanel.tsx (NOT ControlPanel.tsx which is legacy). Rejected: UI-level gating — not config-driven, not reusable.
- [2026-04-09] ComputedWallState data channel: React context provider (wall-computed-context.tsx) wraps both 3D canvas and sidebar panels. Accepted double-computation tradeoff (< 1ms pure function) to preserve ParametricSceneConfig interface. Rejected: extending ModuleStoreState — couples generic store to wall-specific types.
- [2026-04-09] WallViewMode (NOT ViewMode — collision with templates.ts:405 ViewMode which is camera projection mode). Values: overview, section-cut, exploded, build-sequence, compare.
- [2026-04-09] Representative section strategy: ~20% detailed (3 blocks wide ≈ 1200mm), ~80% simplified solid. Max instances: CHB 45, brick 100, studs 16.
- [2026-04-09] Performance budgets: overview < 100 instructions / < 20K tris / < 30 draw calls. Section cut < 200 / < 35K / < 50.
- [2026-04-09] All fire/STC/R-value/cost formulas marked UNVERIFIED — educational approximations only.
- [2026-04-09] Material costs in updateable constants file (wall-constants-performance.ts), not in computation logic. Metro Manila rates, disclaimered.

## Open Questions

- [2026-04-09] Bottom sheet drag gesture: native-feel (iOS-style) or simple toggle? Needs product input.
- [2026-04-09] Cross-section cut surface fill color: needs product input.
- [2026-04-09] WallConfigurator BOM panel: right sidebar collapsible panel (per UX plan v2). Resolved.
- [2026-04-09] Comparison mode: ghost overlay (mobile) or split viewport (desktop)? Split viewport complexity is high — may fall back to ghost-only. Needs implementation spike.

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

### Conventions
- **Routing:** ALL application routes must use `@/lib/routes.ts` constants. ZERO hardcoded strings in `Link href`, `router.push`, `redirect`, or `revalidatePath`.
- **Dynamic Routes:** Always use typed helper functions (e.g., `ROUTES.wiki.article(slug)`) instead of inline template literals.

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

### 3D Lab Module Improvement — Phase 1 Complete (2026-04-08)
- **Phase 1 (Fix CanvasWrapper + SceneConfig):** COMPLETE
- Created `src/features/3d-lab/components/rendering/SceneConfig.tsx` — configures camera, controls, lighting, scene base per-module
- Stripped 15 dead props from `CanvasWrapper.tsx`, replaced with single `sceneConfig` prop
- `LabViewportFrame.tsx` no longer hardcodes camera/controls/lighting — delegates to SceneConfig via tunnel
- Added `PerformanceMonitor` with `flipflops={3}` and dynamic DPR management (1.0–2.0)
- Updated all 10 template consumers to use `sceneConfig={{ ... }}`
- Deleted 2 dead re-export files (`components/templates/CanvasWrapper.tsx`, `components/templates/GlobalCanvasPortal.tsx`)
- Calculator orthographic/flat modes now functional (previously dead props)
- `bun run type-check` and `bun run build` both pass
- All universal gates pass (DevControls, identity lock, module configs untouched)
- Archived plan: `.ai/plans/archive/phase_1_canvas_refactor_plan.md`
- **Next phases:** P2 (WebGL lifecycle), P3 (DOM overlays), P4 (configurable lighting) — all unblocked by P1

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

### Design System Migration: SlateCamp x Flowbite Pro v3.1 (2026-04-07, v3)
- **Approach:** Adopt Flowbite Pro design patterns only — NOT installing `flowbite` or `flowbite-react` packages (zero new dependencies)
- **Plan Location:** `.ai/plans/design_system_migration_plan.md` (v3 — MCP-augmented, block-driven, identity-locked)
- **Companion Plans:** `.ai/plans/wiki_component_upgrade_plan.md`, `.ai/plans/identity_preservation_lock.md`
- **Figma Source:** Flowbite Design System Pro v3.1 (`Mg57xRjiaCCLm7P6JV1sJB`)
- **Local Reference Assets:** `flowbite/flowbite-mcp-pro-1.0.0/data/` (44 components, 13 forms, 22 app blocks, marketing/ecom/publisher blocks) + `flowbite/flowbite-react-blocks-1.8.0-beta/` (full Next.js React implementations)
- **MCP Tooling:** Flowbite MCP Server available locally for Figma-to-code and Theme generation (optional, not required)
- **Brand Preservation:** All SlateCamp colors, typography, and radius caps are LOCKED — no changes
- **Radius Enforcement:** `--radius-xl` already capped at `0.5rem` (8px) in globals.css
- **Gap Analysis:** 12 missing components (P1: Alert, Table, Pagination; P2: Breadcrumb, Stepper, BottomNav, ListGroup; P3: Drawer, Rating, SpeedDial, MegaMenu, Indicator)
- **Form Scope:** 17 active forms across 15 files (pre-computed, bounded)
- **Bottom Navigation:** IN SCOPE — mobile-first for mid-range Android users
- **Git Strategy:** One feature branch per phase, discard-and-rebuild on regression
- **6-Phase Roadmap:** (1) Alignment ref + tokens, (2) Missing primitives, (3) Navigation overhaul, (4) Form elements, (5) Feedback/data display, (6) Marketing sections (connected to GTM)
- **Block-Driven Protocol:** Strip flowbite-react imports → Replace with SlateCamp ui/ primitives → Apply Camp Cobalt mapping → Enforce 8px radius cap → Add CVA + data-slot
- **Key Constraint:** All new components must use CVA + data-slot + existing Radix/Base UI patterns

### Identity Lock: SlideToSubmit — Immutable Brand Anchor (2026-04-07)
- **Component:** `src/components/quiz-v2/SlideToSubmit.tsx` — EXCLUDED from all design system migration
- **Lock Document:** `.ai/plans/identity_preservation_lock.md`
- **Gesture Library:** `@use-gesture/react` (NOT Framer Motion)
- **Animation:** CSS inline transitions with `cubic-bezier(0.34, 1.56, 0.64, 1)` spring overshoot — NOT Tailwind utility classes
- **Colors:** Hardcoded hex values (`#1B3FC4`, `#8896A7`, `#D4DAE3`) — NOT token references, immune to global CSS changes
- **Border Radius:** Track `rounded-md` (6px), Handle `rounded-sm` (4px) — migration does NOT modify these token values
- **Usage Sites:** 7 files (OptionsColumn, GenerationInput, GestureCaptureZone, HeroConfigurator, WikiQuizModal, RevealBlock, QuestionCard)
- **Interference Assessment:** Zero interference expected — all slider styling is inline or hardcoded
- **Protected Files:** Also `src/lib/quiz/haptics.ts`, `src/components/quiz-v2/GestureCaptureZone.tsx`

### Wiki Component Upgrade Plan (2026-04-07)
- **Plan Location:** `.ai/plans/wiki_component_upgrade_plan.md`
- **Scope:** Reading experience for 500+ deep-dive articles
- **MDX Blocks Inventory:** 27 component files in `src/components/wiki/blocks/` with 12 callout variants in unified `Callout.tsx`
- **Widget Registry:** 18 registered widgets in `src/components/wiki/widgets/registry.ts`, lazy-loaded per article
- **MDX Component Map:** `src/components/wiki/mdx-components-shared.ts` — maps 35+ MDX tags to React components
- **Current Table Styling:** Custom th/td classes with DM Mono headers, but missing striped rows, hover, sticky headers
- **Current Callout System:** Unified variant-driven Callout component, already uses design tokens — refinements: bordered variant, icon size bump, action prop
- **Prose Config:** `prose-wiki` utility in globals.css — 15px base, 1.7 line-height, 65ch max-width — refinements: h2-h4 spacing, blockquote styling
- **3-Phase Wiki Roadmap:** (W1) Typography + tables, (W2) Callout refinement, (W3) Widget containers

### Flowbite Integration & Component Optimization (2026-04-08)
- **Plan Location:** `.ai/plans/3d-module-improvement/flowbite-integration-and-component-optimization.md`
- **Strategy:** Adapt Flowbite Pro patterns without installing `flowbite-react`. Map patterns to existing `ui/` components.
- **Slider Consolidation:** Canonical `UnifiedSlider.tsx` identified. Fragmented implementations in `PredictionSlider.tsx` and 3D Lab (LotInputPanel, NBCPControlPanel) targeted for refactoring.
- **3D Overlay Strategy:** 2D DOM overlays mandatory (no `<Html>`/`<Text>` in Canvas). Flowbite's "Tooltip", "Popover", and "Card" patterns are primary choice for projected 3D annotations.
- **Identity Lock:** `SlideToSubmit.tsx` and `GestureCaptureZone.tsx` are brand-locked and EXCLUDED from all design system migrations.

### 3D Lab Research Consolidation (2026-04-08)
- **Location:** `.ai/plans/3d-module-improvement/research/3d_lab_research_consolidation.md`
- **Context:** Consolidated strategic blueprints from Google and Perplexity research into a single source of truth for the 3D Lab implementation roadmap (Phases 0-9) and repo-level audit framework.
- **Archive:** Original `google_research.md` and `perplexity_research.md` moved to `.ai/archive/`.

### Drills Feature PRD & Specification (2026-04-08)
- **Naming Consolidation:** All user-facing references to "Quiz" and "Test" are migrated to **"Drills"** for behavioral and legal reasons.
- **Drill Modes:** 5 core modes documented (`camp`, `storm`, `focused`, `extended`, `fullexam`). `Quick Fire` flagged as in-development.
- **Intelligent Routing:** Standardized on **60/30/10 algorithm** (60% Unseen, 30% Remediation, 10% Spaced Repetition).
- **CAGE Support:** 3-state cryptographic binding (`bound`, `degraded`, `unavailable`) documented for patented gesture-answer verification.
- **Mastery Engine:** EMA formula verified: `newWeight = prevMastery + alpha * baseWeight * (answerValue - prevMastery)`.
- **Readiness Score:** Computed via 6 anti-inflation vectors including grey node penalties and Bloom's level ceilings.
- **Distractor Normalization:** ✅ Active script at `scripts/normalize-distractors.ts` using GPT-4o to expand short distractors.

### Error Logging Audit v3.0 — Third-Pass Forensic Redline (2026-04-11)

**VERSION:** 3.0 — Proof-disciplined rewrite
**KEY CHANGES:**
- Added Claim Status Ledger (Section 5) — every claim with status
- Added Coverage Heatmap (Section 6) — exhaustive/sampled per area
- Added Negative Findings section (Section 8) — patterns searched and NOT found
- Added Uncertainty Register (Section 9) — surfaces downgraded to SAMPLED
- Pattern Proof Tables (Section 11) — now 10 entries, formatSupabaseError separated

**CORRECTIONS MADE:**
- "116 server action files" → "~100 files" (verified via glob)
- "36 files with throw" → "47 files" (fresh grep)
- "74 files with if-error" → "70 files" (fresh grep)
- "formatSupabaseError 3 files" → separated: 1 definition + 1 runtime + 1 doc
- Removed "auth.ts (if exists)" — placeholder language
- Removed "92+ file paths cited" — vanity metric
- Removed "empty catch blocks 8 files" — grep found 0
- AI/cron claims marked SAMPLED (not exhaustive)

**VERIFIED COUNTS (GREP-DERIVED):**
- 47 files with `throw new Error`
- 70 files with `if (error)` checks
- 79 files with `console.error`
- 1 runtime file using formatSupabaseError (bootstrap.ts)
- middleware.ts line 56 has no try/catch (VERIFIED)

**HARD GATES SATISFIED:**
- No "if exists" anywhere
- No vanity metrics without derivation
- No code/doc mixed counts (separated)
- At least 30 exact file references
- At least 12 high-risk surfaces
- At least 10 pattern proof entries
- At least 5 explicit corrections from prior draft

---

## Session History (continued)

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
  - `SlatecampLoader`
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
- **Zustand Hydration Safeguards:** Client components reading from `localStorage` persisted stores (like `useQuizStore`) MUST gate their renders behind `_hasHydrated` booleans. Rendering default state on the server and flipping to persisted state on the client without a fallback (e.g., `<SlatecampLoader />`) causes severe hydration vulnerabilities.
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

### Session 2026-04-07: Subscription Tier Audit & Consolidation

- **Audited database enum**: `subscription_tier` contains 6 values ('free', 'pro', 'enterprise', 'camp', 'insurance', 'institutional') - 'camp' and 'insurance' are INVALID
- **Audited TypeScript types**: `src/types/app.ts` line 1 correctly defines 5-tier UserTier ("free" | "pro" | "prime" | "institutional" | "enterprise")
- **Found hardcoded 'camp' bug**: Multiple components incorrectly use `userTier="camp"` - this is a TestMode, NOT a subscription tier
- **Found PAID_TIERS issue**: `src/lib/paywall/check-access.ts` line 27 missing 'enterprise' in paid tiers array
- **Found pricing constants issue**: `src/lib/constants/pricing.ts` missing 'enterprise' tier
- **Found invalid tiers in dev store**: `src/stores/dev-store.ts` lines 26, 53 show 'prime' is valid in presets, but TypeScript error shows line 26 tries 'pro' and line 53 'prime'
- **LSP confirmed bugs**: Error at `tier-context.tsx` line 27 shows 'camp' not in UserTier type - existing bug
- **Created audit plan**: `.ai/plans/subscription-audit-plan.md` with 8 files to modify and execution roadmap

### Subscription Tier Consolidation (2026-04-07)
- **5-tier model enforced**: `free | pro | prime | institutional | enterprise` — source: `src/types/app.ts` line 1
- **PAID_TIERS updated**: Added `'enterprise'` — source: `src/lib/paywall/check-access.ts` line 27
- **Checkout validation updated**: All 5 tiers in z.enum — source: `src/lib/validations/index.ts` line 78
- **Enterprise pricing tier added**: To INDIVIDUAL_TIERS array — source: `src/lib/constants/pricing.ts`
- **Hardcoded 'camp' bugs fixed**: Replaced `userTier="camp"` with `"free"` in `src/components/3d/Workspace.tsx` line 375 and `src/features/3d-lab/components/ModuleViewer.tsx` lines 213, 229
- **Centralized getUserTier()**: Already existed at `src/lib/subscription/get-tier.ts` with React cache() and TIER_RANK
- **Webhooks already correct**: Both lemonsqueezy and payrex routes validate against 5-tier array
- **DB migration written**: `supabase/migrations/20260407_tier_consolidation.sql` — recreates enum, migrates camp→free, insurance→institutional

### Drills Refactor (2026-04-07)
- **Route migrated**: `/dashboard/testing` → `/dashboard/drills` with redirect from old route
- **Sessions extracted**: New route at `/dashboard/drills/sessions` with dedicated page
- **Sidebar fixed**: Label changed to 'Drills', child href set to `/dashboard/drills/sessions` (fixes duplicate active state bug)
- **Viewport fixed**: ReviewHub.tsx `mx-auto max-w-[960px]` → `w-full`
- **Dev-mode bypass added**: `computeSimulationGate` bypasses 65-readiness gate when `NODE_ENV === 'development'`
- **SessionsTable removed from ReviewHub**: Extracted to dedicated sessions page
- **14 files updated**: All `/dashboard/testing` references replaced with `/dashboard/drills`
- **Files created**: `src/app/dashboard/drills/{layout,page,loading}.tsx`, `src/app/dashboard/drills/sessions/{page,loading}.tsx`

### Wiki Route Performance Audit (2026-04-07)
- **Audit completed**: Comprehensive performance analysis of `/dashboard/wiki/*` routes
- **Bottlenecks identified**:
  - Sequential article resolution (2-4 DB roundtrips per load)
  - Client component heavy architecture (430+ use client directives)
  - No code splitting for 17 interactive widgets
  - Missing database indexes on wiki_articles and wiki_article_taxonomy
  - Permanent cache without TTL (revalidate: false)
- **Plan saved**: `.ai/plans/wiki_route_audit_plan.md`
- **5-phase optimization strategy**:
  1. Database & Caching (RPC + indexes + ISR)
  2. Component Architecture (RSC + Suspense + lazy loading)
  3. Bundle Optimization (dynamic widget imports)
  4. Query Optimization (recursive CTE + memoization)
  5. Observability & Testing

### Session 2026-04-07: Payment Gateway Decoupling Plan

- **Build failure identified:** Missing npm package `@lemonsqueezy/lemonsqueezy.js` causes build to fail
- **Environment state:** Both `PAYREX_SECRET_KEY` and `LEMONSQUEEZY_API_KEY` are empty in `.env.local`
- **Integration audit completed:** Found 6 payment-related files across lemonsqueezy, payrex, payments, webhooks, and pricing
- **Plan created:** `.ai/plans/payment_decoupling_plan.md` with 7-step implementation strategy
- **Strategy:** Use feature flag `FEATURE_PAYMENTS_ENABLED` to conditionally enable/disable payment integrations
- **Files to modify:** 7 files prioritized by P0/P1/P2
- **Re-enablement path documented:** Clear steps to reverse changes when payments are ready
- **Next action:** Execute plan to fix build and enable "Free Mode" operation

### LEA to LEA Global Migration (2026-04-08)
- **Terminology Update:** All references to "LEA" (Architects Licensure Exam) migrated to "LEA" (Licensure Exam for Architects) per PRC guidelines.
- **Database Schema:** Columns renamed in `profiles` (`lea_result`), `taxonomy_tree` (`lea_id`), `wiki_articles` (`lea_tests_you`), `code_updates` (`lea_id`, `is_lea_testable`), and `models_3d` (`lea_question_count`, `lea_question_type`).
- **Data Content:** Global case-sensitive replacement in `camp_trails`, `wiki_articles`, `questions`, and `taxonomy_tree`.
- **Codebase:** 5-pass regex refactor applied to all `.tsx`, `.ts`, `.sql`, and `.md` files, preserving non-exam terms like "scale", "palette", "alert", and "rationale".
- **Redirects:** `next.config.ts` implements permanent 301 redirects from `/ale-*` and `/dashboard/wiki/ale-*` to `/lea-*` equivalents.
- **Assets:** Renamed `.ai/skills/ale-*` and archive directories to `lea-*`.
- **Rollback:** Reverse script available at `supabase/migrations/rollback_lea_to_ale.sql`.

---

*Add verified facts here. Every entry must be traceable to a source file.*

---

### Error Logging Audit — v2.0 Redline (2026-04-11)

- **Audit delivered:** `.ai/plans/2026-04-11-Error-Logging-Audit.md` (v2.0, ~1066 lines, 21 sections + 5 appendices)
- **Redline revision:** Complete rewrite with evidence manifest and proof tables
- **Numeric corrections verified:**
  - Files with throw new Error: 34 → 36 (2 files added)
  - Total throw occurrences: 106 → 108
  - Files with if (error): 72 → 74
  - Total if-error occurrences: 150 → 153
  - Files with console.error: 92 → 85
  - Empty catch blocks: 8 claimed → 0 found (pattern not present)
- **New mandatory sections added:**
  - Section 4: Evidence Collection Method
  - Section 5: Search and Counting Manifest
  - Section 6: Repository Surface Map
  - Section 7: Failure-Surface Inventory (12 surfaces)
  - Section 8: Pattern Proof Tables (7 patterns)
- **Supabase assessment hardened:** Category-by-category with explicit YES/NO positions for 7 categories
- **Recommendations hardened:** 10 action-ready items with problem evidence, exact surfaces, priority, prerequisites
- **Appendices added:** A (Search Query), B (File Coverage), C (Numeric Claims), D (Corrections), E (High-Risk Follow-up)
- **formatSupabaseError usage:** Only 3 files use it (not "inconsistent" — quantified as 3/116 files)
- **Key failure surfaces verified:**
  - Middleware session refresh (`src/lib/supabase/middleware.ts:56`) — no try/catch, no logging
  - Admin actions — questions.ts (7 throws), wiki.ts (6 throws), taxonomy.ts (5 throws, NOT triggered)
  - Quiz-v2 actions — submit-answer.ts (5 throws), start-session.ts (throws on tier check)
  - Payment webhooks — return 200 OK even on processing failure
- **Supabase suitability:**
  - YES: Audit logs, business events, user-support errors (filtered), payment failures
  - NO: High-volume engineering telemetry, security anomalies, debug diagnostics
  - PARTIAL: Third-party integration (payment=YES, AI=NO)

### Error Logging Audit v4.0 — Fourth-Pass Precision Cleanup (2026-04-11)

- **Audit delivered:** `.ai/plans/2026-04-11-Error-Logging-Audit.md` (v4, 24 sections + 5 appendices)
- **Precision Cleanup revision:** Forensic alignment of all numeric claims and evidence.
- **Numeric corrections verified via fresh strict grep (v4):**
  - Unique code files with `throw new Error`: **47** (128 total occurrences) in `src/lib/`
  - Unique code files with `if (error)`: **71** (149 total occurrences) in `src/lib/` and `src/app/api/`
  - Unique code files with `console.error`: **87** (176 total occurrences) in `src/lib/` and `src/app/api/`
  - Server action files: Exactly **137** `.ts` files found in `src/lib/actions/`
  - Unique code files with `catch {`: **25** (31 total occurrences) in `src/lib/` and `src/app/api/`
  - `src/lib/queries/` exhaustive count: **17** `.ts` files
  - `src/lib/supabase/` exhaustive count: **6** `.ts` files
  - `src/app/api/` route count: **11** `route.ts` files
- **Wording Hardened:** Replaced all approximate `~` counts with exact derivations in exhaustive coverage areas.
- **Forensic Integrity Verified:** Confirmed absence of credibility-weakening typos (SAMLED, SAMOLED).
- **Claim Status Sync:** All `PROVEN` claims in the Ledger now match the exact grep-derived evidence.
- **File-Occurrence Distinction:** All proof tables now explicitly separate unique file counts from total statement occurrences.
## 2026-04-12 01:30 Error Logging Rollout Checkpoint

- Implemented phase-1 error logging rollout from `.ai/plans/2026-04-12-Error-Logging-Implementation-Plan.md`.
- Added shared logging layer under `src/lib/logging/` with edge-safe and server-side paths.
- Backfilled official spec at `.ai/docs/01-product/011-Error-Logging-Feature-Specification.md`.
- Integrated first-wave logging into:
  - `src/lib/supabase/middleware.ts`
  - `src/lib/actions/quiz-v2/start-session.ts`
  - `src/lib/actions/quiz-v2/submit-answer.ts`
  - admin mutation cluster
  - payment webhooks
  - Developer logs page
- Added focused regression tests including combined changed-suite coverage.
- Fresh evidence before follow-up work:
  - combined changed-suite Bun test pass
  - `bun run type-check` pass
  - `bun run build` pass
  - targeted ESLint pass on changed files
- Remaining repo-wide lint failures are outside rollout scope and live in pre-existing external/generated areas.

## 2026-04-12 02:05 Follow-Up Checkpoint

- Created checkpoint commit for the phase-1 rollout.
- Fixed repo-wide lint usability by excluding generated/vendor directories from ESLint scope:
  - `storybook-static/**`
  - `flowbite/**`
- Verified `bun run lint` now completes with warnings only instead of failing on generated/vendor files.
- Widened admin-cluster adoption to additional mutation outliers:
  - `src/lib/actions/admin/assets.ts`
  - `src/lib/actions/admin/pipeline.ts`
- Added regression coverage for those follow-up admin paths:
  - `src/lib/actions/admin/assets.test.ts`
  - `src/lib/actions/admin/pipeline.test.ts`
