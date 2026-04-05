# Centralized Design System: Component Duplication Audit & Cleanup Plan

## Context

SlateCamp's codebase has accumulated severe component fragmentation across 590+ `.tsx` files. The same UI patterns — selects, toggles, Canvas viewports, panels, readiness rings, quadrant overlays, cards, modals, tabs, empty states, stat displays — are reimplemented independently across features instead of reusing existing shared primitives. The `.sisyphus/` performance audit (T1-T2 complete) already catalogued the key offenders; this plan picks up at T3 (Refactor Implementation) with a design-system-first approach.

We will adopt **Storybook** as the centralized component documentation system and deprecate the design system catalog pages in `/developer`, while keeping the rest of the developer portal (architecture docs, API reference, status dashboard) intact.

**Tech stack:** Next.js 16.1.6, React 19.2.4, Tailwind CSS 4.2.2 (CSS-first), shadcn/ui 4.1.0 + @base-ui/react 1.3.0, TypeScript 5.9.3, Bun, ESLint 9 flat config.

---

## PART A: Dead Code Audit — 57 Files to Delete

### A1. Entire `src/components/quiz/` Directory (16 files) — v1 Quiz System

The barrel `index.ts` carries a `@deprecated` notice. The v2 system (`quiz-v2/`) has fully replaced it. All consumers are dead dashboard wrappers (see A2).

| File | Status |
|------|--------|
| `quiz/AITutorDrawer.tsx` | DEAD |
| `quiz/ConfidenceCheckScreen.tsx` | DEAD |
| `quiz/ConfidenceToggle.tsx` | DEAD (consumers are dead wrappers) |
| `quiz/ConfirmSubmitSheet.tsx` | DEAD |
| `quiz/ErrorTypePrompt.tsx` | DEAD |
| `quiz/FooterNavigator.tsx` | DEAD |
| `quiz/OptionButton.tsx` | DEAD |
| `quiz/QuestionMap.tsx` | DEAD |
| `quiz/QuestionStem.tsx` | DEAD |
| `quiz/QuizHeader.tsx` | DEAD |
| `quiz/QuizOverlay.tsx` | DEAD |
| `quiz/RationaleDrawer.tsx` | DEAD |
| `quiz/RestudyLoop.tsx` | DEAD |
| `quiz/SaveIndicator.tsx` | DEAD |
| `quiz/TimerBar.tsx` | DEAD |
| `quiz/index.ts` | DEAD barrel |

> **Important:** `src/hooks/quiz/useQuizState.ts` imports `type { ConfidenceLevel }` from `ConfidenceToggle.tsx`. Move this type to `src/types/quiz.ts` BEFORE deleting the quiz directory.

### A2. Dead Dashboard Components (17 files)

| File | Why Dead |
|------|----------|
| `dashboard/QuizActionButtons.tsx` | Only consumer of quiz v1 barrel — itself has zero consumers |
| `dashboard/QuizDrawers.tsx` | Same — dead quiz v1 wrapper |
| `dashboard/QuizFooterNav.tsx` | Same |
| `dashboard/QuizOptions.tsx` | Same |
| `dashboard/ResultsSummary.tsx` | Zero consumers |
| `dashboard/results/QuestionReviewList.tsx` | Only consumed by dead ResultsSummary |
| `dashboard/results/ResultsActions.tsx` | Only consumed by dead ResultsSummary |
| `dashboard/results/StatCards.tsx` | Only consumed by dead ResultsSummary |
| `dashboard/results/ScoreHero.tsx` | Only consumed by dead ResultsSummary (separate from live `testing/debrief/ScoreHero`) |
| `dashboard/CustomSessionBuilder.tsx` | Zero consumers |
| `dashboard/LockedScoreWidget.tsx` | Zero consumers |
| `dashboard/OnboardingStateCard.tsx` | Zero consumers |
| `dashboard/QuickReviewModal.tsx` | Zero consumers |
| `dashboard/SrsReviewWidget.tsx` | Zero consumers |
| `dashboard/SubjectDrillSelector.tsx` | Zero consumers |
| `dashboard/SubjectPracticeSelector.tsx` | Zero consumers |
| `dashboard/TimePicker.tsx` | Zero consumers |

### A3. Dead Testing Hub/Session Components (14 files)

**Hub (6 dead):** `DoseBanner.tsx`, `InProgressBanner.tsx`, `SmartSuggestionCard.tsx`, `WelcomeCard.tsx`, `ZoneSection.tsx`, `SRSection.tsx`

**Session (8 dead):** `CampSessionBehavior.tsx`, `ChillSessionBehavior.tsx`, `ErrorTaxonomyPrompt.tsx`, `FirstTimeTooltip.tsx`, `NavigatorOverlay.tsx`, `SessionShell.tsx`, `StormSessionBehavior.tsx`, `StormTimerBar.tsx`

> After deletion, update barrel `index.ts` files in `testing/hub/` and `testing/session/` to remove dead re-exports.

### A4. Dead Analytics Components (4-5 files)

| File | Why Dead |
|------|----------|
| `analytics/ErrorPatternCard.tsx` | Zero consumers |
| `analytics/MemoryStrengthCard.tsx` | Zero consumers |
| `analytics/MemoryStrengthQuadrant.tsx` | Only consumed by dead MemoryStrengthCard |
| `analytics/AnalyticsSummaryBar.tsx` | Only consumed by SummarySection which has zero app-route consumers |
| `analytics/SummarySection.tsx` | Verify — may be dead (no app-route consumer found) |

### A5. Dead Shared Components (3 files)

`shared/QuickActionsBar.tsx`, `shared/StandardInfoPopover.tsx`, `shared/TodayActionCard.tsx`

### A6. Dead Admin Components (10 files)

`admin/AdminMDXEditor.tsx`, `admin/AdminMDXEditorLoader.tsx`, `admin/ApproveDialog.tsx`, `admin/ArticlePreviewTab.tsx`, `admin/ArticlePropertiesPanel.tsx`, `admin/ComponentToolbar.tsx`, `admin/QuestionPreviewPanel.tsx`, `admin/RequestChangesDialog.tsx`, `admin/preview/CampModePreview.tsx`, `admin/preview/StormModePreview.tsx`

### Dead Code Deletion Command

```bash
# Step 1: Move ConfidenceLevel type before deleting quiz/
# Step 2: Delete in dependency order (leaves first, then parents)
# Step 3: Update barrel exports (index.ts files)
# Step 4: Run bun run type-check to confirm zero broken imports
```

---

## PART B: Duplicate Component Audit — Conflicting Implementations

### B1. Duplicate StatCard (CRITICAL — Two Active Implementations)

| File | Props | Type | Consumers |
|------|-------|------|-----------|
| `shared/StatCard.tsx` (PascalCase) | `eyebrow`, `title`, `value`, `delta` | Server component | ~9 files |
| `shared/stat-card.tsx` (kebab-case) | `eyebrow`, `value`, `trend`, `color`, `className` | Client component with trend icons | ~9 files |

**Plus a third inline implementation** in `dashboard/results/StatCards.tsx` (dead — see A2).

**Resolution:** Keep `stat-card.tsx` (more capable — trend icons, `cn()` className support). Delete `StatCard.tsx`. Update ~9 import sites.

### B2. Duplicate EmptyState (Two Active Implementations)

| File | Props | Type |
|------|-------|------|
| `shared/EmptyState.tsx` (PascalCase) | `ctaLabel`, `ctaHref` (Link-only) | Server component |
| `shared/empty-state.tsx` (kebab-case) | `action.label`, `action.href` or `action.onClick` | Client component, more flexible |

**Plus 24 files** with inline empty-state patterns (`flex flex-col items-center justify-center py-`).

**Resolution:** Keep `empty-state.tsx` (supports onClick, more flexible). Delete `EmptyState.tsx`. Migrate 19 import sites + 24 inline patterns.

### B3. Duplicate Tabs (Wiki — Two Custom + shadcn Ignored)

| File | Issue |
|------|-------|
| `wiki/Tabs.tsx` (~63 LOC) | Uses **deprecated color tokens** (`camp-cobalt`, `#E0DED8` hardcoded) |
| `wiki/WikiTabs.tsx` (~63 LOC) | Corrected version using `text-primary`/`border-primary` |
| `ui/tabs.tsx` | shadcn Tabs — exists but **neither wiki component uses it** |

**Plus 6 files** rolling their own `useState(activeTab)` tab switching.

**Resolution:** Delete `wiki/Tabs.tsx`. Point consumers to `wiki/WikiTabs.tsx`. Plan later migration of WikiTabs to shadcn `ui/tabs.tsx`.

### B4. ToggleSwitch → Switch

**File:** `WallConfigurator/ToggleSwitch.tsx` (46 LOC, hardcoded inline styles)
**Source of truth:** `components/ui/switch.tsx` (Base-UI Switch)

**Consumers (2 files, 3 usages):**
- `WallConfigurator/steps/CoreTypeStep.tsx`: `<ToggleSwitch checked={coreMoistureResistant} onChange={setCoreMoistureResistant} />`
- `WallConfigurator/steps/TreatmentStep.tsx`: 2 usages

**API change:** `onChange` → `onCheckedChange`. Same `(boolean) => void` signature. Add `size="sm"`.

### B5. Duplicate CodeBlock

- `src/app/developer/_components/CodeBlock.tsx` — imported by `ComponentPageLayout.tsx`
- `src/components/portal/CodeBlock.tsx` — imported by architecture page

**Resolution:** Merge into single `src/components/shared/CodeBlock.tsx`.

### B6. PanelCollapseHandle (2 locations + boundary violation)

- `3d-lab/_components/PanelCollapseHandle.tsx` (90 LOC)
- `3d-lab/DevControlsModule/dashboard/PanelCollapseHandle.tsx` (32 LOC)
- `DevControlsLabV2.tsx` imports the route-trapped version — boundary violation

**Resolution:** Move to `src/components/shared/PanelCollapseHandle.tsx`.

---

## PART C: Pattern Duplication — Shared Components Being Bypassed

### C1. Inline Card Divs (92 files bypassing `<Card>`)

**Pattern:** `rounded-md border border-border bg-card p-4` or `bg-white p-4 rounded-md border` written as raw `<div>`s.

**Shared component exists:** `src/components/ui/card.tsx` (Card with variants: default, interactive, selected, accent-left, feature, ghost; sizes: sm, md, lg)

**Worst offenders:** `BriefPanel.tsx` (5 inline), `PodView.tsx` (3), `ProfessionalHub.tsx` (3), `ResultsDashboard.tsx` (3)

**Estimated savings:** ~400-600 LOC across 92 files.

### C2. Custom Modals Bypassing `<Dialog>` (25 files)

**Pattern:** `fixed inset-0 z-50` with manual focus trap `useEffect` hooks.

**Worst offenders:**
- `quiz-v2/ExitConfirmModal.tsx` (154 LOC, manual focus trap)
- `quiz-v2/SubmitConfirmModal.tsx` (302 LOC, **identical focus trap copy-pasted** from ExitConfirmModal)
- `quiz-v2/MicroBreakOverlay.tsx`
- `pods/CreatePodModal.tsx`

**Estimated savings:** ~250 LOC from the top 5 alone.

### C3. Eyebrow Label Duplication (102 files)

**Pattern:** `uppercase tracking-widest text-muted-foreground` inline.

**Shared components exist:** `ui/eyebrow.tsx`, `shared/section-header.tsx` — but only 21 files use them.

**Estimated savings:** ~200-300 LOC.

### C4. Loading Spinner Gap (29 files)

**Problem:** `CampfireLoader` is full-page-only (`fixed inset-0`). No inline spinner component exists. 29 files roll their own `animate-spin` divs.

**Resolution:** Add `src/components/ui/spinner.tsx` — inline spinner with `size` prop. Then migrate 29 files.

### C5. Page Header Bypass (~80 files)

`PageHeader`, `SectionHeader`, `DashboardHeader` exist in shared — but ~80 files write their own `<h1>/<h2> + <p>` combos inline instead.

---

## PART D: Boundary Violations — Route-Internal Imports

### D1. Component → App Route Imports (MUST FIX)

| Violating File | Imports From Route |
|----------------|-------------------|
| `components/3d/Workspace.tsx` | `@/app/dashboard/3d-lab/_components/LabViewport` |
| `components/3d-lab/DevControlsModule/dashboard/DevControlsLabV2.tsx` | `@/app/dashboard/3d-lab/_components/PanelCollapseHandle` |
| `components/admin/unified-editor/ContentEditorIndex.tsx` | `@/app/admin/knowledge/questions/_components/QuestionsTableClient` |
| `components/developer/ComponentPageLayout.tsx` | `@/app/developer/_components/CodeBlock` |
| `components/developer/ComponentPageLayout.tsx` | `@/app/developer/_components/PropTable` |
| `components/wiki/widgets/Lab3DWidget.tsx` | `@/app/dashboard/3d-lab/_config/registry` |
| `components/wiki/widgets/Lab3DWidget.tsx` | `@/app/dashboard/3d-lab/_types/templates` |

### D2. Cross-Route Type/Config Dependencies

**`src/app/dashboard/3d-lab/_types/templates.ts`** (398 lines) consumed by 4 calculator routes + admin.

**`src/app/dashboard/3d-lab/_config/registry/index.ts`** consumed by admin + wiki widget.

**Resolution:** Move to `src/features/3d-lab/types/` and `src/features/3d-lab/config/`.

### D3. Dashboard Cross-Route Imports

- `dashboard/page.tsx` imports `ResultsDayBanner` from `dashboard/results-day/_components/`
- `dashboard/page.tsx` imports `TransitionPrompt` from `dashboard/professional/_components/`

**Resolution:** Move both to `src/components/dashboard/`.

---

## PART E: Feature Promotion Candidates

| Directory | Files | Size | Recommendation |
|-----------|-------|------|---------------|
| `components/3d-lab/` | 56 | 309K | **Promote to `features/3d-lab/`** — already has hooks/, stores/, canvas subdirs |
| `components/quiz-v2/` | 58 | 312K | Candidate — needs internal restructuring first |
| `components/analytics/` | 53 | 198K | Candidate — flat structure needs subdirs |
| `components/testing/` | 41 | 228K | Candidate — domain-specific |
| `components/wiki/` | 76 | 392K | Candidate — largest, needs architect review |

---

## PART F: Storybook Adoption

### Ready-to-Paste Configs

**Install:**
```bash
bunx storybook@latest init --builder @storybook/builder-vite --skip-install
bun add -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-a11y @storybook/addon-interactions @storybook/addon-themes @storybook/test
```

**`.storybook/main.ts`:**
```ts
import type { StorybookConfig } from '@storybook/react-vite'
const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)', '../src/app/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...config.resolve.alias, '@': new URL('../src', import.meta.url).pathname }
    return config
  },
}
export default config
```

**`.storybook/preview.ts`:**
```ts
import type { Preview } from '@storybook/react'
import '../src/app/globals.css'
import './fonts.css'
const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'campfire-light',
      values: [
        { name: 'campfire-light', value: '#F8F7F5' },
        { name: 'campfire-card', value: '#FFFFFF' },
        { name: 'campfire-focused', value: '#F5F7FA' },
      ],
    },
  },
}
export default preview
```

**`.storybook/fonts.css`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Syne:wght@400;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400;1,500&display=swap');
:root { --font-inter: 'Inter', system-ui, sans-serif; --font-syne: 'Syne', system-ui, sans-serif; --font-dm-mono: 'DM Mono', monospace; }
```

**Deprecate:** Delete `src/app/developer/design-system/` and `src/app/developer/_components/ComponentShowcase.tsx` (84KB).

---

## PART G: ESLint Import Governance

**Add to `eslint.config.mjs`:**
```js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/app/*/_components/*'], message: 'Import from @/components/ or @/features/ instead of route-internal _components.' },
        { group: ['@/app/*/_types/*'], message: 'Move shared types to @/types/ or @/features/.' },
        { group: ['@/app/*/_config/*'], message: 'Move shared config to @/lib/ or @/features/.' },
      ],
    }],
  },
}
```

---

## Execution Order (13 Passes)

| Pass | Description | Files Affected | Risk |
|------|-------------|---------------|------|
| **0** | Baseline lock: `bun run lint && bun run type-check && bun run build` | 0 | None |
| **1** | Delete 57 dead files (Part A) | ~57 deleted | Low |
| **2** | Merge duplicate StatCard + EmptyState (Part B1-B2) | ~20 updated | Medium |
| **3** | Delete wiki/Tabs.tsx, ToggleSwitch.tsx, duplicate PanelCollapseHandle (Part B3-B6) | ~8 | Low |
| **4** | Fix boundary violations — move route-trapped components/types (Part D) | ~12 moved | Medium |
| **5** | HeroCommandBar ring → ScoreDisplay, analytics QuadrantOverlay extraction | ~5 | Medium |
| **6** | Canvas consolidation into CanvasWrapper | ~5 refactored | Medium |
| **7** | Wall Configurator + Calculator InputPanel + Search consolidation | ~12 | Medium |
| **8** | Migrate ExitConfirmModal + SubmitConfirmModal to shadcn Dialog | ~2 + ~250 LOC saved | Medium |
| **9** | Add `ui/spinner.tsx`, barrel exports for ~22 dirs | ~25 new/updated | Low |
| **10** | Storybook install + 44 UI + 35 shared stories | ~80 new .stories.tsx | Low |
| **11** | Deprecate `/developer/design-system/*` + ComponentShowcase.tsx | ~20 deleted | Low |
| **12** | ESLint governance rules + feature promotion (`3d-lab/` → `features/`) | Config + ~56 moved | Medium |

---

## Estimated Total Impact

| Metric | Before | After |
|--------|--------|-------|
| Dead files deleted | 0 | **~57** |
| Duplicate implementations resolved | 0 | **6 pairs** (StatCard, EmptyState, Tabs, ToggleSwitch, PanelCollapseHandle, CodeBlock) |
| LOC removed | 0 | **~3,000-4,000** (dead code + consolidation + Dialog migration) |
| Boundary violations | 7 | **0** |
| Inline card patterns | 92 files | Migrate to `<Card>` (codemod pass) |
| Inline eyebrow patterns | 102 files | Migrate to `<Eyebrow>` / `<SectionHeader>` |
| Custom modals bypassing Dialog | 25 files | Migrate top 5, then systematic |
| Canvas standalone implementations | 5 | **1** (CanvasWrapper) |
| Barrel exports coverage | 13/35 (37%) | **35/35 (100%)** |
| Storybook stories | 0 | **~80+** |
| Feature directories | 1 | **2+** (wall-configurator + 3d-lab) |

---

## How to Resume

```
@docs/plans/design-system-cleanup.md Execute this plan starting from Pass 0. Use ultrawork for parallel execution where passes are independent (Pass 1-3 can run in parallel, Pass 4-8 are sequential, Pass 9-11 can run in parallel).
```

This plan completes `.sisyphus/plans/performance-audit-plan.md` tasks T3 (Refactor Implementation) and T4 (Documentation).

---

# Component Audit Report

## 1. Executive Summary

SlateCamp's codebase contains **590+ component files** across `src/components/`, `src/app/`, and `src/features/`. A full-codebase import trace audit reveals **57 completely dead files** (zero consumers anywhere in the dependency tree), **6 pairs of conflicting duplicate implementations**, **7 boundary violations** (components importing from route-internal `_components/` directories), and **widespread pattern bypass** where 92-102 files reimplement patterns that already exist as shared primitives. The v1 quiz system (`src/components/quiz/`) is entirely orphaned — replaced by `quiz-v2/` but never deleted. The codebase health is **fair** — the shared primitive layer (`ui/`, `shared/`) is well-built but under-adopted.

## 2. Unused & Dead Components

### Quiz v1 System (Entire Directory — 16 files)
* **AITutorDrawer** (`src/components/quiz/AITutorDrawer.tsx`) — *No import traces found. Replaced by quiz-v2.*
* **ConfidenceCheckScreen** (`src/components/quiz/ConfidenceCheckScreen.tsx`) — *No import traces found.*
* **ConfidenceToggle** (`src/components/quiz/ConfidenceToggle.tsx`) — *Only consumed by dead dashboard wrappers. Type `ConfidenceLevel` still referenced by 2 hooks (move type before deleting).*
* **ConfirmSubmitSheet** (`src/components/quiz/ConfirmSubmitSheet.tsx`) — *No import traces found.*
* **ErrorTypePrompt** (`src/components/quiz/ErrorTypePrompt.tsx`) — *No import traces found.*
* **FooterNavigator** (`src/components/quiz/FooterNavigator.tsx`) — *No import traces found.*
* **OptionButton** (`src/components/quiz/OptionButton.tsx`) — *No import traces found.*
* **QuestionMap** (`src/components/quiz/QuestionMap.tsx`) — *No import traces found.*
* **QuestionStem** (`src/components/quiz/QuestionStem.tsx`) — *No import traces found.*
* **QuizHeader** (`src/components/quiz/QuizHeader.tsx`) — *No import traces found.*
* **QuizOverlay** (`src/components/quiz/QuizOverlay.tsx`) — *No import traces found.*
* **RationaleDrawer** (`src/components/quiz/RationaleDrawer.tsx`) — *No import traces found.*
* **RestudyLoop** (`src/components/quiz/RestudyLoop.tsx`) — *No import traces found.*
* **SaveIndicator** (`src/components/quiz/SaveIndicator.tsx`) — *No import traces found.*
* **TimerBar** (`src/components/quiz/TimerBar.tsx`) — *No import traces found.*
* **index.ts** (`src/components/quiz/index.ts`) — *Dead barrel re-export. Marked @deprecated.*

### Dashboard Dead Components (17 files)
* **QuizActionButtons** (`src/components/dashboard/QuizActionButtons.tsx`) — *Only consumer of quiz v1 barrel; itself has zero consumers.*
* **QuizDrawers** (`src/components/dashboard/QuizDrawers.tsx`) — *Dead quiz v1 wrapper.*
* **QuizFooterNav** (`src/components/dashboard/QuizFooterNav.tsx`) — *Dead quiz v1 wrapper.*
* **QuizOptions** (`src/components/dashboard/QuizOptions.tsx`) — *Dead quiz v1 wrapper.*
* **ResultsSummary** (`src/components/dashboard/ResultsSummary.tsx`) — *Zero consumers. Pulls in 4 dead sub-components.*
* **QuestionReviewList** (`src/components/dashboard/results/QuestionReviewList.tsx`) — *Only consumed by dead ResultsSummary.*
* **ResultsActions** (`src/components/dashboard/results/ResultsActions.tsx`) — *Only consumed by dead ResultsSummary.*
* **StatCards** (`src/components/dashboard/results/StatCards.tsx`) — *Only consumed by dead ResultsSummary.*
* **ScoreHero** (`src/components/dashboard/results/ScoreHero.tsx`) — *Only consumed by dead ResultsSummary. Separate from live testing/debrief/ScoreHero.*
* **CustomSessionBuilder** (`src/components/dashboard/CustomSessionBuilder.tsx`) — *Zero consumers.*
* **LockedScoreWidget** (`src/components/dashboard/LockedScoreWidget.tsx`) — *Zero consumers.*
* **OnboardingStateCard** (`src/components/dashboard/OnboardingStateCard.tsx`) — *Zero consumers.*
* **QuickReviewModal** (`src/components/dashboard/QuickReviewModal.tsx`) — *Zero consumers.*
* **SrsReviewWidget** (`src/components/dashboard/SrsReviewWidget.tsx`) — *Zero consumers.*
* **SubjectDrillSelector** (`src/components/dashboard/SubjectDrillSelector.tsx`) — *Zero consumers.*
* **SubjectPracticeSelector** (`src/components/dashboard/SubjectPracticeSelector.tsx`) — *Zero consumers. Verbatim copy of SubjectDrillSelector.*
* **TimePicker** (`src/components/dashboard/TimePicker.tsx`) — *Zero consumers.*

### Testing Dead Components (14 files)
* **DoseBanner** (`src/components/testing/hub/DoseBanner.tsx`) — *Barrel-exported but zero app-route consumers.*
* **InProgressBanner** (`src/components/testing/hub/InProgressBanner.tsx`) — *Same.*
* **SmartSuggestionCard** (`src/components/testing/hub/SmartSuggestionCard.tsx`) — *Same.*
* **WelcomeCard** (`src/components/testing/hub/WelcomeCard.tsx`) — *Same.*
* **ZoneSection** (`src/components/testing/hub/ZoneSection.tsx`) — *Same.*
* **SRSection** (`src/components/testing/hub/SRSection.tsx`) — *Same.*
* **CampSessionBehavior** (`src/components/testing/session/CampSessionBehavior.tsx`) — *Barrel-exported, zero consumers.*
* **ChillSessionBehavior** (`src/components/testing/session/ChillSessionBehavior.tsx`) — *Same.*
* **ErrorTaxonomyPrompt** (`src/components/testing/session/ErrorTaxonomyPrompt.tsx`) — *Same.*
* **FirstTimeTooltip** (`src/components/testing/session/FirstTimeTooltip.tsx`) — *Same.*
* **NavigatorOverlay** (`src/components/testing/session/NavigatorOverlay.tsx`) — *Same.*
* **SessionShell** (`src/components/testing/session/SessionShell.tsx`) — *Same. 610 LOC monolith — dead regardless.*
* **StormSessionBehavior** (`src/components/testing/session/StormSessionBehavior.tsx`) — *Same.*
* **StormTimerBar** (`src/components/testing/session/StormTimerBar.tsx`) — *Same.*

### Analytics Dead Components (4-5 files)
* **ErrorPatternCard** (`src/components/analytics/ErrorPatternCard.tsx`) — *Zero consumers.*
* **MemoryStrengthCard** (`src/components/analytics/MemoryStrengthCard.tsx`) — *Zero consumers.*
* **MemoryStrengthQuadrant** (`src/components/analytics/MemoryStrengthQuadrant.tsx`) — *Only consumed by dead MemoryStrengthCard.*
* **AnalyticsSummaryBar** (`src/components/analytics/AnalyticsSummaryBar.tsx`) — *Only consumed by SummarySection (verify if SummarySection is also dead).*

### Shared Dead Components (3 files)
* **QuickActionsBar** (`src/components/shared/QuickActionsBar.tsx`) — *Zero consumers.*
* **StandardInfoPopover** (`src/components/shared/StandardInfoPopover.tsx`) — *Zero direct consumers.*
* **TodayActionCard** (`src/components/shared/TodayActionCard.tsx`) — *Zero consumers.*

### Admin Dead Components (10 files)
* **AdminMDXEditor** (`src/components/admin/AdminMDXEditor.tsx`) — *Only consumed by dead AdminMDXEditorLoader.*
* **AdminMDXEditorLoader** (`src/components/admin/AdminMDXEditorLoader.tsx`) — *Zero consumers.*
* **ApproveDialog** (`src/components/admin/ApproveDialog.tsx`) — *Zero consumers.*
* **ArticlePreviewTab** (`src/components/admin/ArticlePreviewTab.tsx`) — *Zero consumers.*
* **ArticlePropertiesPanel** (`src/components/admin/ArticlePropertiesPanel.tsx`) — *Zero consumers.*
* **ComponentToolbar** (`src/components/admin/ComponentToolbar.tsx`) — *Zero consumers.*
* **QuestionPreviewPanel** (`src/components/admin/QuestionPreviewPanel.tsx`) — *Zero consumers.*
* **RequestChangesDialog** (`src/components/admin/RequestChangesDialog.tsx`) — *Zero consumers.*
* **CampModePreview** (`src/components/admin/preview/CampModePreview.tsx`) — *Only consumed by dead QuestionPreviewPanel.*
* **StormModePreview** (`src/components/admin/preview/StormModePreview.tsx`) — *Only consumed by dead QuestionPreviewPanel.*

## 3. Deprecated Components

* **quiz/index.ts** (`src/components/quiz/index.ts`) — *Explicitly marked with `@deprecated` tag. Entire v1 quiz barrel.*
* **quiz/ConfidenceToggle.tsx** (`src/components/quiz/ConfidenceToggle.tsx`) — *Marked `@deprecated — use quiz-v2/OptionsColumn instead`.*
* **wiki/Tabs.tsx** (`src/components/wiki/Tabs.tsx`) — *Uses deprecated color tokens (`camp-cobalt`, `#E0DED8` hardcoded). Replaced by wiki/WikiTabs.tsx which uses correct design tokens.*
* **WallConfigurator/ToggleSwitch.tsx** (`src/app/dashboard/3d-lab/_components/WallConfigurator/ToggleSwitch.tsx`) — *Uses deprecated inline styles with hardcoded hex values instead of design tokens. Replaced by `ui/switch.tsx`.*
* **shared/StatCard.tsx** (`src/components/shared/StatCard.tsx`) — *Deprecated in favor of `shared/stat-card.tsx` which has trend icons and className support. Both are actively imported — merge required.*
* **shared/EmptyState.tsx** (`src/components/shared/EmptyState.tsx`) — *Deprecated in favor of `shared/empty-state.tsx` which supports onClick actions. Both are actively imported — merge required.*
* **developer/ComponentShowcase.tsx** (`src/app/developer/_components/ComponentShowcase.tsx`) — *84KB monolith scheduled for deprecation in favor of Storybook.*

## 4. Required Action Items

**Immediate (Pass 1 — Low Risk):**
- [ ] Move `ConfidenceLevel` type from `quiz/ConfidenceToggle.tsx` to `src/types/quiz.ts`
- [ ] Update type imports in `useQuizTelemetry.ts` and `useQuizState.ts`
- [ ] Delete entire `src/components/quiz/` directory (16 files)
- [ ] Delete 17 dead dashboard components + `dashboard/results/` sub-folder
- [ ] Delete 14 dead testing hub/session components; update barrel `index.ts` files
- [ ] Delete 4-5 dead analytics components
- [ ] Delete 3 dead shared components
- [ ] Delete 10 dead admin components + `admin/preview/` sub-folder
- [ ] Run `bun run type-check` to verify zero broken imports

**Short-Term (Pass 2-3 — Medium Risk):**
- [ ] Merge `StatCard.tsx` into `stat-card.tsx` — update ~9 import sites
- [ ] Merge `EmptyState.tsx` into `empty-state.tsx` — update ~19 import sites
- [ ] Delete `wiki/Tabs.tsx` — point consumers to `WikiTabs.tsx`
- [ ] Replace `ToggleSwitch.tsx` with `ui/switch.tsx` in 2 files (3 usages)
- [ ] Consolidate `PanelCollapseHandle` to `shared/` — fix boundary violation
- [ ] Merge `CodeBlock` to single `shared/CodeBlock.tsx`

**Medium-Term (Pass 4-8):**
- [ ] Fix 7 boundary violations — move route-trapped components/types to `features/` or `components/`
- [ ] Move `3d-lab/_types/templates.ts` (398 LOC) to `features/3d-lab/types/` — unblocks 5 downstream files
- [ ] Consolidate 5 Canvas implementations into `CanvasWrapper`
- [ ] Migrate `ExitConfirmModal` + `SubmitConfirmModal` to shadcn `<Dialog>` — saves ~250 LOC
- [ ] Extract `QuadrantOverlay` shared component from 3 analytics charts

**Long-Term (Pass 9-12):**
- [ ] Add `ui/spinner.tsx` for inline loading states (29 files need it)
- [ ] Add barrel exports to ~22 directories missing them
- [ ] Install Storybook + write ~80 stories for UI primitives and shared components
- [ ] Deprecate `/developer/design-system/*` and `ComponentShowcase.tsx`
- [ ] Add ESLint `no-restricted-imports` rules blocking route-internal imports
- [ ] Promote `components/3d-lab/` to `features/3d-lab/`
- [ ] Codemod pass: replace inline card divs with `<Card>` across 92 files
- [ ] Codemod pass: replace inline eyebrow classes with `<Eyebrow>` across 102 files
