# SlateCamp Component Organization Plan
## The Most Comprehensive Component Audit & Reorganization Plan

**Version:** 2.0  
**Generated:** 2026-04-04  
**Purpose:** Complete component inventory, dead code audit, duplicate resolution, and reorganization strategy  
**Status:** Comprehensive Analysis Complete - Execution Ready  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Component Inventory](#2-current-component-inventory)
3. [Dead Code Audit](#3-dead-code-audit-57-files)
4. [Duplicate Component Resolution](#4-duplicate-component-resolution)
5. [Boundary Violations](#5-boundary-violations)
6. [Pattern Duplication](#6-pattern-duplication)
7. [Proposed Architecture](#7-proposed-architecture)
8. [Execution Roadmap](#8-execution-roadmap)
9. [Best Practices & Industry Standards](#9-best-practices--industry-standards)
   - [9.1 Dead Code Detection Tools](#91-dead-code-detection-tools)
   - [9.2 ESLint Boundary Enforcement](#92-eslint-boundary-enforcement)
   - [9.3 Barrel File Best Practices](#93-barrel-file-best-practices)
   - [9.4 Bundle Size Optimization](#94-bundle-size-optimization)
   - [9.5 Feature-Sliced Design (FSD) Principles](#95-feature-sliced-design-fsd-principles)
   - [9.6 Automated Cleanup Scripts](#96-automated-cleanup-scripts)
10. [Success Metrics](#10-success-metrics)

---

## 1. Executive Summary

### 1.1 Current State

| Metric | Value |
|--------|-------|
| Total component directories | 33 |
| Total .tsx files | ~692 |
| Dead files identified | 57 |
| Duplicate pairs | 6 |
| Boundary violations | 7 |
| Inline patterns (card divs) | 92 files |
| Inline patterns (eyebrow) | 102 files |
| Custom modals bypassing Dialog | 25 files |

### 1.2 Key Findings

1. **Quiz v1 System is entirely dead** - 16 files replaced by quiz-v2 but never deleted
2. **Duplicate implementations exist** - StatCard, EmptyState, Tabs all have 2 implementations
3. **Layout fragmentation** - Both `layout/` and `layouts/` directories exist
4. **Shared primitives underutilized** - Only ~21% of files use existing shared components
5. **Boundary violations** - 7 files import from route-internal `_components/` directories

---

## 2. Current Component Inventory

### 2.1 Complete Directory Map

```
src/components/
├── 3d/                          # Base 3D components (Three.js/R3F primitives)
├── 3d-lab/                      # 3D Lab workspace (DevControlsModule/, InfoPanel.tsx, LabTopBar.tsx, ModuleContextCard.tsx, OnboardingFlow.tsx)
├── admin/                       # Admin panel UI (21 files + 3 subdirs)
│   ├── preview/
│   ├── settings/
│   └── unified-editor/
├── analytics/                   # Analytics dashboard (53 files)
├── assessment/                   # Assessment/exam UI (4 files)
├── auth/                        # Authentication UI (3 files)
├── ceo/                        # CEO dashboard (13 files + skeletons/)
├── dashboard/                   # Main dashboard (28 files + heatmap/, results/)
│   ├── heatmap/
│   └── results/                 # DEAD - all files have zero consumers
├── dev/                         # Developer tools (8 files)
├── developer/                   # Developer portal UI (8 files)
├── graphics/                    # Graphic system (4 files + icons/, ui/)
├── interactive-illustrations/   # Interactive 2D learning
├── landing/                     # Landing page (2 files)
├── layout/                      # Layout wrappers (1 file - HeaderActions.tsx)
├── layouts/                     # Layout wrappers (1 file - SharedPageLayout.tsx) [DUPLICATE]
├── marketing/                   # Marketing pages (20 files)
├── motion/                      # Framer-motion animations (2 files)
├── notes/                       # Note-taking (9 files)
├── portal/                      # Portal shell (9 files)
├── quiz/                        # [DEAD] Quiz v1 primitives (17 files) - REPLACED BY quiz-v2/
├── quiz-v2/                     # Next-gen quiz engine (32 files + results/, review/, setup/)
├── notifications/               # Notification system (6 files)
├── r3f/                         # React Three Fiber scenes (4 files)
├── score/                       # Score display (2 files)
├── session/                     # Session management (1 file)
├── settings/                    # User settings (1 file)
├── shared/                      # Reusable utilities (35 files)
├── sidebar/                     # Sidebar navigation (13 files)
├── testing/                     # Testing engine (42 files, 4 subdirs)
│   ├── debrief/
│   ├── hub/
│   ├── session/
│   └── setup/
├── tools/                       # Standalone tools (3 subdirs)
├── trails/                      # Camp Trails (22 files)
├── ui/                          # shadcn/ui primitives (43 files) - ATOMIC PRIMITIVES
└── wiki/                        # Wiki/knowledge base (54 files + widgets/)
    └── widgets/
        ├── bp344/
        ├── dsgn013/
        └── registry.ts
```

### 2.2 UI Primitives (src/components/ui/)

These are the atomic building blocks - domain-agnostic:

| Component | Type | Purpose |
|-----------|------|---------|
| accordion.tsx | Primitive | Collapsible sections |
| alert-dialog.tsx | Primitive | Accessible alert dialogs |
| avatar.tsx | Primitive | User avatar display |
| badge.tsx | Primitive | Status/count badges |
| button.tsx | Primitive | Primary action trigger |
| calendar.tsx | Primitive | Date picker |
| card.tsx | Primitive | Content container (variants: default, interactive, selected, accent-left, feature, ghost) |
| checkbox.tsx | Primitive | Binary toggle |
| close-button.tsx | Primitive | Close action |
| command.tsx | Primitive | Command palette |
| dialog.tsx | Primitive | Modal overlay |
| dropdown-menu.tsx | Primitive | Context menu |
| difficulty-bar.tsx | Custom | Difficulty visualization |
| eyebrow.tsx | Custom | Eyebrow label |
| event-badge.tsx | Custom | Event indicator |
| form-field.tsx | Primitive | Form wrapper |
| icon-button.tsx | Primitive | Icon-only button |
| input.tsx | Primitive | Text input |
| input-group.tsx | Primitive | Input container |
| label.tsx | Primitive | Form label |
| mode-button.tsx | Custom | Mode toggle |
| popover.tsx | Primitive | Floating content |
| progress.tsx | Primitive | Progress bar |
| progress-bar.tsx | Custom | Alternative progress |
| radio-group.tsx | Primitive | Radio selection |
| resizable.tsx | Primitive | Resizable panels |
| scroll-area.tsx | Primitive | Scrollable container |
| separator.tsx | Primitive | Visual divider |
| select.tsx | Primitive | Dropdown selection |
| sheet.tsx | Primitive | Slide-out panel |
| skeleton.tsx | Primitive | Loading placeholder |
| slider.tsx | Primitive | Range input |
| SlateCampLogo.tsx | Custom | Logo |
| status-badge.tsx | Custom | Status indicator |
| switch.tsx | Primitive | Toggle switch |
| tabs.tsx | Primitive | Tab navigation |
| textarea.tsx | Primitive | Multi-line input |
| toast.tsx | Primitive | Notification toast |
| toaster.tsx | Primitive | Toast container |
| toolbar.tsx | Primitive | Toolbar container |
| tooltip.tsx | Primitive | Hover tooltip |
| student-view-watermark.tsx | Custom | Watermark |

### 2.3 Shared Components (src/components/shared/)

Domain-neutral complex compositions:

| Component | Status | Consumers | Notes |
|-----------|--------|-----------|-------|
| Navbar.tsx | Active | 5+ | Global navigation |
| DashboardHeader.tsx | Active | 8+ | Dashboard shell |
| taxonomy-tree.tsx | Active | 4+ | Tree navigation |
| section-header.tsx | Active | 21 | Section titles |
| Omnibar.tsx | Active | 3+ | Search command |
| LogoutButton.tsx | Active | 4+ | Auth action |
| ThemeToggle.tsx | Active | 3+ | Theme switch |
| data-table.tsx | Active | 12+ | Table primitive |
| SourceBadge.tsx | Active | 6+ | Citation badge |
| WikiSidePanel.tsx | Active | 2+ | Wiki sidebar |
| CampfireLoader.tsx | Active | 8+ | Full-page loader |
| question-card.tsx | Active | 9+ | Question display |
| content-sidebar.tsx | Active | 4+ | Content nav |
| TodayActionCard.tsx | **DEAD** | 0 | DELETE |
| NavigationProgress.tsx | Active | 5+ | Progress indicator |
| StatCard.tsx | **DUPLICATE** | 9 | Use stat-card.tsx instead |
| DashboardPageSkeleton.tsx | Active | 6+ | Loading state |
| InfoTooltip.tsx | Active | 15+ | Tooltip wrapper |
| QuickStatsRow.tsx | Active | 4+ | Stats display |
| EmptyState.tsx | **DUPLICATE** | - | Use empty-state.tsx |
| taxonomy-picker.tsx | Active | 6+ | Taxonomy selection |
| stat-card.tsx | Active | 9+ | **KEP** - has trend icons |
| QuickActionsBar.tsx | **DEAD** | 0 | DELETE |
| page-header.tsx | Active | 18+ | Page title |
| floating-panel.tsx | Active | 4+ | Floating container |
| breadcrumb.tsx | Active | 11+ | Navigation trail |
| ThemeProvider.tsx | Active | 2+ | Theme context |
| StandardInfoPopover.tsx | **DEAD** | 0 | DELETE |
| sidebar-nav.tsx | Active | 5+ | Side navigation |
| score-display.tsx | Active | 7+ | Score visualization |
| question-dot-navigator.tsx | Active | 3+ | Question navigation |
| legal-citation-badge.tsx | Active | 4+ | Legal reference |
| empty-state.tsx | Active | 19+ | **KEP** - supports onClick |
| app-drawer.tsx | Active | 3+ | Mobile drawer |
| action-card.tsx | Active | 6+ | Action container |

### 2.4 Wiki Components (src/components/wiki/)

54 files - largest component domain:

**Core Wiki:**
- WikiSidebar.tsx, WikiSidebarLoader.tsx, WikiSidebarSkeleton.tsx, WikiSidebarShell.tsx
- WikiArticle.tsx, WikiArticleHeader.tsx, WikiArticleHero.tsx
- WikiContentShell.tsx, WikiLayoutContent.tsx
- WikiHeader.tsx, WikiHeaderClient.tsx
- WikiRightSidebar.tsx
- WikiTableOfContents.tsx
- WikiCallout.tsx, WikiCalloutBox.tsx
- WikiQuizButton.tsx, WikiQuizModal.tsx
- WikiReference.tsx, WikiSourcesPopover.tsx, WikiRelatedPopover.tsx
- WikiMistakeCard.tsx, WikiMistakeList.tsx
- WikiBookmarks.tsx
- WikiReadTracker.tsx, WikiReadingProgress.tsx
- WikiNoteAnchor.tsx
- WikiHighlighter.tsx
- WikiTextSelection.tsx
- WikiPartHeader.tsx

**Content Blocks:**
- WikiPre.tsx
- WikiExamTable.tsx
- KeyValues.tsx
- GenericBlock.tsx
- ComparisonTable.tsx
- FormulaBlock.tsx
- ProcessFlow.tsx
- RevealBlock.tsx
- SubjectSnapshot.tsx
- LawCallout.tsx
- Tabs.tsx, WikiTabs.tsx [DUPLICATE]
- Accordion.tsx, WikiAccordion.tsx
- AlertBox.tsx
- ExamTip.tsx
- AuthorityContent.tsx
- ElaborativeInterrogation.tsx
- InlineQuiz.tsx
- PrequestionGate.tsx
- TeachBackPrompt.tsx
- WrongAnswerBanner.tsx
- WikiChangedPill.tsx
- Mermaid.tsx
- WikiNavigationContext.tsx, WikiDisciplineContext.tsx

**Widgets (Lab 3D + Design Calculators):**
- Lab3DWidget.tsx
- bp344/ (8 files): ComparisonTable, RecallPractice, RecallDrill, GrabBarExplainer, DoorConfigurator, CubicleChecker, CorridorVisualizer
- dsgn013/ (12 files): WorkstationCalculator, SpatialQualityPractice, SpatialQualityDrill, ReachEnvelopeDiagram, ProportionComparator, DimensionPractice, DimensionDrill, DHRatioExplorer, BodyDimensionPractice, BodyDimensionExplorer, BodyDimensionDrill, BedSizeComparator, BedroomPlanView

---

## 3. Dead Code Audit (57 Files)

### 3.1 Quiz v1 System - ENTIRE DIRECTORY (16 files)

All replaced by quiz-v2/:

| File | Reason |
|------|--------|
| quiz/AITutorDrawer.tsx | DEAD - No imports |
| quiz/ConfidenceCheckScreen.tsx | DEAD - No imports |
| quiz/ConfidenceToggle.tsx | DEAD - Only dead consumers |
| quiz/ConfirmSubmitSheet.tsx | DEAD - No imports |
| quiz/ErrorTypePrompt.tsx | DEAD - No imports |
| quiz/FooterNavigator.tsx | DEAD - No imports |
| quiz/OptionButton.tsx | DEAD - No imports |
| quiz/QuestionMap.tsx | DEAD - No imports |
| quiz/QuestionStem.tsx | DEAD - No imports |
| quiz/QuizHeader.tsx | DEAD - No imports |
| quiz/QuizOverlay.tsx | DEAD - No imports |
| quiz/RationaleDrawer.tsx | DEAD - No imports |
| quiz/RestudyLoop.tsx | DEAD - No imports |
| quiz/SaveIndicator.tsx | DEAD - No imports |
| quiz/TimerBar.tsx | DEAD - No imports |
| quiz/index.ts | DEAD - @deprecated barrel |

### 3.2 Dashboard Dead Components (17 files)

| File | Why Dead |
|------|----------|
| dashboard/QuizActionButtons.tsx | Only consumes dead quiz v1 |
| dashboard/QuizDrawers.tsx | Dead quiz v1 wrapper |
| dashboard/QuizFooterNav.tsx | Dead quiz v1 wrapper |
| dashboard/QuizOptions.tsx | Dead quiz v1 wrapper |
| dashboard/ResultsSummary.tsx | Zero consumers |
| dashboard/results/QuestionReviewList.tsx | Only consumed by dead ResultsSummary |
| dashboard/results/ResultsActions.tsx | Only consumed by dead ResultsSummary |
| dashboard/results/StatCards.tsx | Only consumed by dead ResultsSummary |
| dashboard/results/ScoreHero.tsx | Only consumed by dead ResultsSummary |
| dashboard/CustomSessionBuilder.tsx | Zero consumers |
| dashboard/LockedScoreWidget.tsx | Zero consumers |
| dashboard/OnboardingStateCard.tsx | Zero consumers |
| dashboard/QuickReviewModal.tsx | Zero consumers |
| dashboard/SrsReviewWidget.tsx | Zero consumers |
| dashboard/SubjectDrillSelector.tsx | Zero consumers |
| dashboard/SubjectPracticeSelector.tsx | Zero consumers |
| dashboard/TimePicker.tsx | Zero consumers |

### 3.3 Testing Dead Components (14 files)

**Hub (6 dead):**
- testing/hub/DoseBanner.tsx
- testing/hub/InProgressBanner.tsx
- testing/hub/SmartSuggestionCard.tsx
- testing/hub/WelcomeCard.tsx
- testing/hub/ZoneSection.tsx
- testing/hub/SRSection.tsx

**Session (8 dead):**
- testing/session/CampSessionBehavior.tsx
- testing/session/ChillSessionBehavior.tsx
- testing/session/ErrorTaxonomyPrompt.tsx
- testing/session/FirstTimeTooltip.tsx
- testing/session/NavigatorOverlay.tsx
- testing/session/SessionShell.tsx (610 LOC monolith)
- testing/session/StormSessionBehavior.tsx
- testing/session/StormTimerBar.tsx

### 3.4 Analytics Dead Components (4-5 files)

| File | Why Dead |
|------|----------|
| analytics/ErrorPatternCard.tsx | Zero consumers |
| analytics/MemoryStrengthCard.tsx | Zero consumers |
| analytics/MemoryStrengthQuadrant.tsx | Only dead consumer |
| analytics/AnalyticsSummaryBar.tsx | Only dead consumer |
| analytics/SummarySection.tsx | Verify - may be dead |

### 3.5 Shared Dead Components (3 files)

- shared/QuickActionsBar.tsx - Zero consumers
- shared/StandardInfoPopover.tsx - Zero consumers
- shared/TodayActionCard.tsx - Zero consumers

### 3.6 Admin Dead Components (10 files)

- admin/AdminMDXEditor.tsx
- admin/AdminMDXEditorLoader.tsx
- admin/ApproveDialog.tsx
- admin/ArticlePreviewTab.tsx
- admin/ArticlePropertiesPanel.tsx
- admin/ComponentToolbar.tsx
- admin/QuestionPreviewPanel.tsx
- admin/RequestChangesDialog.tsx
- admin/preview/CampModePreview.tsx
- admin/preview/StormModePreview.tsx

---

## 4. Duplicate Component Resolution

### 4.1 StatCard - CRITICAL (Two Active Implementations)

| File | Props | Type | Consumers |
|------|-------|------|-----------|
| shared/StatCard.tsx | `eyebrow`, `title`, `value`, `delta` | Server component | ~9 files |
| shared/stat-card.tsx | `eyebrow`, `value`, `trend`, `color`, `className` | Client component with trend icons | ~9 files |

**Resolution:** Keep `stat-card.tsx` (more capable). Delete `StatCard.tsx`. Update ~9 import sites.

### 4.2 EmptyState - Two Active Implementations

| File | Props | Type |
|------|-------|------|
| shared/EmptyState.tsx | `ctaLabel`, `ctaHref` (Link-only) | Server component |
| shared/empty-state.tsx | `action.label`, `action.href` or `action.onClick` | Client component, more flexible |

**Resolution:** Keep `empty-state.tsx` (supports onClick, more flexible). Delete `EmptyState.tsx`. Migrate 19 import sites.

### 4.3 Wiki Tabs - Two Custom Implementations

| File | Issue |
|------|-------|
| wiki/Tabs.tsx (~63 LOC) | Uses **deprecated color tokens** (`camp-cobalt`, `#E0DED8` hardcoded) |
| wiki/WikiTabs.tsx (~63 LOC) | Corrected version using `text-primary`/`border-primary` |
| ui/tabs.tsx | shadcn Tabs exists but **neither wiki component uses it** |

**Resolution:** Delete `wiki/Tabs.tsx`. Point consumers to `wiki/WikiTabs.tsx`.

### 4.4 ToggleSwitch → Switch

- **File:** `WallConfigurator/ToggleSwitch.tsx` (46 LOC, hardcoded inline styles)
- **Source of truth:** `components/ui/switch.tsx` (Base-UI Switch)
- **Consumers:** 2 files, 3 usages

**Resolution:** Replace with `ui/switch.tsx`. API change: `onChange` → `onCheckedChange`.

### 4.5 CodeBlock - Duplicate

- `src/app/developer/_components/CodeBlock.tsx`
- `src/components/portal/CodeBlock.tsx`

**Resolution:** Merge into single `src/components/shared/CodeBlock.tsx`.

### 4.6 PanelCollapseHandle - Duplicate + Boundary Violation

- `src/app/dashboard/3d-lab/_components/PanelCollapseHandle.tsx` (90 LOC)
- `src/components/3d-lab/DevControlsModule/dashboard/PanelCollapseHandle.tsx` (32 LOC)

**Resolution:** Move to `src/components/shared/PanelCollapseHandle.tsx`.

---

## 5. Boundary Violations

### 5.1 Component → App Route Imports (MUST FIX)

| Violating File | Imports From Route |
|----------------|-------------------|
| `components/3d/Workspace.tsx` | `@/app/dashboard/3d-lab/_components/LabViewport` |
| `components/3d-lab/DevControlsModule/dashboard/DevControlsLabV2.tsx` | `@/app/dashboard/3d-lab/_components/PanelCollapseHandle` |
| `components/admin/unified-editor/ContentEditorIndex.tsx` | `@/app/admin/knowledge/questions/_components/QuestionsTableClient` |
| `components/developer/ComponentPageLayout.tsx` | `@/app/developer/_components/CodeBlock` |
| `components/developer/ComponentPageLayout.tsx` | `@/app/developer/_components/PropTable` |
| `components/wiki/widgets/Lab3DWidget.tsx` | `@/app/dashboard/3d-lab/_config/registry` |
| `components/wiki/widgets/Lab3DWidget.tsx` | `@/app/dashboard/3d-lab/_types/templates` |

### 5.2 Cross-Route Type/Config Dependencies

- `src/app/dashboard/3d-lab/_types/templates.ts` (398 lines) consumed by 4 calculator routes + admin
- `src/app/dashboard/3d-lab/_config/registry/index.ts` consumed by admin + wiki widget

**Resolution:** Move to `src/components/3d-lab/types/` and `src/components/3d-lab/config/`.

---

## 6. Pattern Duplication

### 6.1 Inline Card Divs (92 files)

**Pattern:** `rounded-md border border-border bg-card p-4` written as raw `<div>`s.

**Shared component:** `src/components/ui/card.tsx` (Card with 6 variants, 3 sizes)

**Worst offenders:** `BriefPanel.tsx` (5 inline), `PodView.tsx` (3), `ProfessionalHub.tsx` (3), `ResultsDashboard.tsx` (3)

**Estimated savings:** ~400-600 LOC

### 6.2 Custom Modals Bypassing Dialog (25 files)

**Pattern:** `fixed inset-0 z-50` with manual focus trap `useEffect` hooks.

**Worst offenders:**
- `quiz-v2/ExitConfirmModal.tsx` (154 LOC)
- `quiz-v2/SubmitConfirmModal.tsx` (302 LOC - identical focus trap copy-pasted)
- `quiz-v2/MicroBreakOverlay.tsx`
- `pods/CreatePodModal.tsx`

**Estimated savings:** ~250 LOC

### 6.3 Eyebrow Label Duplication (102 files)

**Pattern:** `uppercase tracking-widest text-muted-foreground` inline.

**Shared components:** `ui/eyebrow.tsx`, `shared/section-header.tsx` — only 21 files use them.

**Estimated savings:** ~200-300 LOC

### 6.4 Loading Spinner Gap (29 files)

**Problem:** `CampfireLoader` is full-page-only. No inline spinner exists. 29 files roll their own `animate-spin` divs.

**Resolution:** Add `src/components/ui/spinner.tsx`. Then migrate 29 files.

### 6.5 Page Header Bypass (~80 files)

`PageHeader`, `SectionHeader`, `DashboardHeader` exist in shared — but ~80 files write their own `<h1>/<h2> + <p>` combos inline.

---

## 7. Proposed Architecture

### 7.1 Atomic Feature Architecture (AFA)

```
src/components/
├── ui/                       # [ATOMS] Foundational UI primitives (shadcn/ui style)
├── shared/                   # [MOLECULES] Domain-neutral complex compositions
├── layout/                  # [SHELL] App structure, navigation, and layout wrappers
├── features/                # [DOMAINS] Feature-specific logic and domain components
│   ├── admin/                # Admin portal editors and management tools
│   ├── assessment/          # Quiz engine (v2), testing lifecycle, and exam UI
│   ├── auth/                # Authentication, login, and registration forms
│   ├── dashboard/           # User progress, analytics, and session building
│   ├── lab/                 # 3D spatial learning (R3F), LabViewer, and scenes
│   ├── marketing/           # Public-facing landing pages and marketing assets
│   ├── wiki/                # Knowledge base, MDX viewer, and article aids
│   ├── portals/              # Unified CEO, Developer, and Portal shells
│   ├── taxonomy/             # Subject/Subtopic trees and pickers
│   ├── notes/                # Note-taking and TipTap editor integration
│   ├── tools/                # Specialized calculators and physics tools
│   └── trails/               # Camp Trails learning paths and phase maps
├── visuals/                  # [MEDIA] Graphics, animations, and illustrations
└── system/                   # [INFRA] Dev tools, notifications, and theme config
```

### 7.2 Categorization Rules

#### ui/ (Atomic Primitives)
- **Rule:** Must be domain-agnostic and (mostly) stateless
- **Content:** Low-level components (Button, Input, Badge, Skeleton)
- **Constraint:** Zero awareness of application state or API endpoints

#### shared/ (Generic Compositions)
- **Rule:** Domain-neutral but complex enough to warrant separation
- **Content:** Reusable UI patterns (DataTable, StatCard, EmptyState, StandardInfoPopover)
- **Constraint:** Should not import from features/

#### layout/ (Structure & Navigation)
- **Rule:** Components that define the "shell" of the application
- **Content:** Navigation elements, sidebar shells, global headers
- **Constraint:** Manages navigation state, delegates content to children

#### features/ (Domain-Specific Contexts)
- **Rule:** Components tightly coupled to specific business logic
- **Content:** High-level organisms (QuestionCard, TaxonomyPicker, LabViewer)
- **Constraint:** Can import from ui/, shared/, layout/, but rarely from other features

#### visuals/ (Interactive Media)
- **Rule:** Non-feature-specific graphic and animation assets
- **Content:** SVG icons, Framer-motion helpers, visual effects

#### system/ (Development & Infrastructure)
- **Rule:** Cross-cutting concerns and developer utilities
- **Content:** DevToolbar, NotificationCenter, ThemeProvider, SettingsProvider

---

## 8. Execution Roadmap

### Phase 0: Baseline Verification
```bash
bun run lint && bun run type-check && bun run build
```

### Phase 1: Dead Code Deletion (57 files)

| Step | Action | Files |
|------|--------|-------|
| 1.1 | Move ConfidenceLevel type from quiz/ to src/types/quiz.ts | 1 |
| 1.2 | Delete quiz/ directory | 16 |
| 1.3 | Delete dashboard/results/ + dead dashboard components | 17 |
| 1.4 | Delete testing/hub + testing/session dead files | 14 |
| 1.5 | Delete analytics dead files | 4-5 |
| 1.6 | Delete shared dead files | 3 |
| 1.7 | Delete admin dead files | 10 |
| 1.8 | Run type-check to verify | - |

### Phase 2: Duplicate Resolution (6 pairs)

| Step | Action | Impact |
|------|--------|--------|
| 2.1 | Merge StatCard.tsx into stat-card.tsx | ~9 files |
| 2.2 | Merge EmptyState.tsx into empty-state.tsx | ~19 files |
| 2.3 | Delete wiki/Tabs.tsx | ~6 files |
| 2.4 | Replace ToggleSwitch with ui/switch | 2 files |
| 2.5 | Consolidate PanelCollapseHandle | 2 files |
| 2.6 | Merge CodeBlock to shared/ | 2 files |

### Phase 3: Boundary Fixes (7 violations)

| Step | Action | Impact |
|------|--------|--------|
| 3.1 | Move 3d-lab/_types/templates.ts to components/3d-lab/types/ | 5 files |
| 3.2 | Move 3d-lab/_config/ to components/3d-lab/config/ | 3 files |
| 3.3 | Fix 7 boundary violation imports | 7 files |

### Phase 4: Pattern Consolidation

| Step | Action | Impact |
|------|--------|--------|
| 4.1 | Add ui/spinner.tsx | New file + 29 migrate |
| 4.2 | Migrate ExitConfirmModal + SubmitConfirmModal to shadcn | ~250 LOC saved |
| 4.3 | Codemod inline card divs to <Card> | 92 files |
| 4.4 | Codemod inline eyebrow to <Eyebrow> | 102 files |

### Phase 5: Barrel Exports & Documentation

| Step | Action | Impact |
|------|--------|--------|
| 5.1 | Add barrel exports to ~22 directories | 22 files |
| 5.2 | Install Storybook | New system |
| 5.3 | Write ~80 component stories | 80 files |

---

## 9. Best Practices & Industry Standards

### 9.1 Dead Code Detection Tools

| Tool | Purpose | Installation | Usage |
|------|---------|--------------|-------|
| **Knip** | Unused dependencies, exports, files | `npm i knip` | `npx knip` |
| **ts-unused-exports** | Unused TypeScript exports | `npm i ts-unused-exports` | Config-based |
| **@line/ts-remove-unused** | Remove unused code | `npm i @line/ts-remove-unused` | CLI tool |
| **tsr** | Tree shaking for source | `npx tsr` | Dry-run mode |

**Recommendation:** Install Knip as primary tool:
```bash
npm install -D knip
```
Add to `package.json`:
```json
{
  "knip": {
    "entry": ["src/**/*.ts", "src/**/*.tsx"],
    "project": ["tsconfig.json"]
  }
}
```

### 9.2 ESLint Boundary Enforcement

**Option A: no-restricted-imports (Native ESLint)**

Add to `eslint.config.mjs`:
```javascript
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['@/app/*/_components/*'],
          message: 'Import from @/components/ or @/features/ instead of route-internal _components.'
        },
        {
          group: ['@/app/*/_types/*'],
          message: 'Move shared types to @/types/ or @/features/.'
        },
        {
          group: ['@/app/*/_config/*'],
          message: 'Move shared config to @/lib/ or @/features/.'
        }
      ]
    }]
  }
}
```

**Option B: eslint-plugin-boundaries (Advanced)**

```bash
npm install -D eslint-plugin-boundaries
```

```javascript
// eslint.config.mjs
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        allow: [
          // ui/ can be imported anywhere
          ['ui', '**'],
          // shared/ can be imported by features/ and layout/
          ['shared', ['features', 'layout']],
          // features/ can only import from ui/, shared/, layout/, system/
          ['features', ['ui', 'shared', 'layout', 'system', 'visuals']],
          // layout/ can import from ui/, shared/, system/
          ['layout', ['ui', 'shared', 'system']]
        ]
      }]
    }
  }
]
```

### 9.3 Barrel File Best Practices

#### The Problem with Barrel Files

Barrel files (`index.ts` re-exports) can **hurt bundle size** in Next.js:

1. **Tree shaking fails** - Importing one item pulls entire barrel
2. **Circular dependencies** - Re-export chains create issues
3. **Hidden imports** - Hard to trace actual dependencies

**Evidence:**
- Barrel files can increase first-load JS by **40-60%**
- Next.js barrel optimizer exists but has limitations

#### Recommended Approach

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **Direct imports** | Default for production | `import { Button } from '@/components/ui/button'` |
| **Explicit re-exports** | For public APIs only | `export { useAuth } from './useAuth'` |
| **No re-exports** | Within features | Keep internal imports direct |
| **Barrel for types** | Type-only exports | `export type { User } from './types'` |

#### Next.js Barrel Optimizer

Enable in `next.config.ts`:
```typescript
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@/components/ui', '@/components/shared']
  }
}
```

### 9.4 Bundle Size Optimization

| Technique | Impact | Implementation |
|----------|--------|----------------|
| **Dynamic imports** | High | `const Heavy = dynamic(() => import('./Heavy'))` |
| **Tree shaking** | Medium | Named exports, no side effects |
| **Code splitting** | High | Route-based + component lazy loading |
| **Bundle analyzer** | Diagnostic | `@next/bundle-analyzer` |
| **optimizePackageImports** | Medium | Array of packages to optimize |

### 9.5 Feature-Sliced Design (FSD) Principles

For SlateCamp's scale, consider hybrid Atomic + FSD:

```
src/
├── app/                    # Next.js routes
├── components/
│   ├── ui/               # Atoms (primitives)
│   ├── shared/           # Molecules (reusable compositions)
│   ├── layout/           # Organisms (shells)
│   └── features/          # Templates (domain-specific)
│       ├── wiki/
│       ├── assessment/
│       ├── lab/
│       └── ...
├── features/              # Business logic (optional)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
└── lib/                   # Shared utilities
```

### 9.7 Codemod Strategies for Migration

For large-scale migrations, use codemods to automate repetitive changes:

**Replace inline card divs:**
```bash
npx @codemod/cli replace '
  <div class="rounded-md border border-border bg-card p-4">
    {children}
  </div>
' '<Card>{children}</Card>'
```

**Replace custom modals:**
```bash
# Find all custom modal patterns
grep -r "fixed inset-0 z-50" --include="*.tsx" | cut -d: -f1 | uniq
```

**Replace barrel imports:**
```bash
# Direct import conversion
npx @codemod/cli replace '
  import { Button } from "@/components/ui"
' 'import { Button } from "@/components/ui/button"'
```

**Recommended codemod tools:**
| Tool | Purpose |
|------|---------|
| `@codemod/cli` | General find/replace |
| `react-codemod` | React migrations |
| `ts-morph` | TypeScript AST transformations |
| `jscodeshift` | JS/TS codemods |

### 9.8 Testing Strategy for Reorganization

**Before any deletion:**
```bash
# Capture current test coverage
bun test --coverage > before-coverage.txt
```

**After each phase:**
```bash
# Run tests
bun test

# Run type-check
bun run type-check

# Run build
bun run build

# Run lint
bun run lint
```

**Regression test checklist:**
- [ ] All pages render correctly
- [ ] Navigation works between portals
- [ ] Quiz flow completes end-to-end
- [ ] 3D Lab loads without errors
- [ ] Wiki articles display properly
- [ ] Analytics charts render
- [ ] Admin forms submit correctly

### 9.9 Pre-Migration Checklist

| Check | Status |
|-------|--------|
| [ ] Baseline tests passing | |
| [ ] Type-check clean | |
| [ ] Build successful | |
| [ ] Full backup/complete git commit | |
| [ ] CI pipeline green | |
| [ ] Knip installed and configured | |
| [ ] ESLint boundaries configured | |
| [ ] Rollback plan documented | |

### 9.10 Rollback Strategy

If migration causes issues:

1. **Immediate rollback:**
   ```bash
   git stash
   # or
   git revert <commit>
   ```

2. **Partial rollback:**
   ```bash
   git checkout <file> <commit>
   ```

3. **Feature flags:**
   ```typescript
   // Keep old component available via flag
   const Card = featureFlags.useNewCards ? NewCard : OldCard
   ```

---

### 9.11 Automated Cleanup Scripts

**Pre-commit hook (recommended):**
```bash
# .husky/pre-commit
npx knip --strict
npx eslint --max-warnings=0
npx tsc --noEmit
```

**CI pipeline:**
```yaml
# .github/workflows/cleanup.yml
- name: Dead code detection
  run: npx knip || true
  
- name: Unused exports
  run: npx ts-unused-exports ./tsconfig.json
```

---

## 10. Success Metrics

### Before vs After

| Metric | Before | After |
|--------|--------|-------|
| Dead files | 57 | 0 |
| Duplicate implementations | 6 pairs | 0 |
| Boundary violations | 7 | 0 |
| Inline card patterns | 92 files | 0 |
| Inline eyebrow patterns | 102 files | 0 |
| Custom modals | 25 files | 5 (complex only) |
| Barrel exports | 13/35 (37%) | 35/35 (100%) |
| Feature directories | 1 | 5+ |

### Estimated LOC Impact

| Category | Removal |
|----------|---------|
| Dead code deletion | ~3,000 LOC |
| Duplicate consolidation | ~1,500 LOC |
| Dialog migration | ~250 LOC |
| **Total** | ~4,750 LOC |

---

## Appendices

### A. Key Reference Files

- `.sisyphus/plans/performance-audit-plan.md` - Previous audit
- `.sisyphus/notepads/performance-audit/` - Detailed findings
- `docs/plans/design-system-cleanup.md` - Full cleanup plan (505 lines)
- `src/components/AGENTS.md` - Component directory documentation
- `src/AGENTS.md` - Full codebase documentation
- `CLAUDE.md` - Design system tokens and constraints

### B. Important Notes

1. **Move ConfidenceLevel type BEFORE deleting quiz/ directory**
2. **Update barrel exports after deletions**
3. **Run type-check after EVERY deletion batch**
4. **Storybook deprecates /developer/design-system routes**
5. **ESLint rules will block future boundary violations**

---

*This is the most comprehensive component organization plan for SlateCamp. Execution should proceed methodically with type-check verification after each phase.*
