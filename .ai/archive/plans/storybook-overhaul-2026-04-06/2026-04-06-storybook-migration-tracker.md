# Storybook Migration Tracker

Date: 2026-04-06
Plan: `2026-04-06-storybook-overhaul-plan.md`

## Phase 0 Baseline

- Total stories audited: `80`
- Stories with placeholder scaffolds: `71`
- Real stories already worth preserving: `9`
- Placeholder guard baseline source: `scripts/storybook-placeholder-baseline.ts`
- Placeholder guard command: `bun run check:storybook-placeholders`

## Current Inventory After Phase 1

- Total current stories: `78`
- Placeholder scaffold stories still pending replacement: `71`
- Real stories still retained: `7`
- Retired in Phase 1:
  - `src/components/developer/PreviewArea.stories.tsx`
  - `src/components/developer/PropTable.stories.tsx`

## Disposition Summary

| Disposition | Count | Meaning |
| --- | ---: | --- |
| Keep and upgrade | 7 | Already imports a real component; preserve and improve during later phases |
| Replace | 67 | Placeholder scaffold that should be rewritten into a real story module |
| Delete | 3 | Placeholder scaffold attached to a surface that should be retired rather than documented |

## Keep And Upgrade

- `src/components/calculators/CanvasEmptyState.stories.tsx`
- `src/components/developer/StatusBadge.stories.tsx`
- `src/components/developer/StatusBanner.stories.tsx`
- `src/components/developer/StatusKPICard.stories.tsx`
- `src/components/developer/UptimeBar.stories.tsx`
- `src/components/portal/CopyButton.stories.tsx`
- `src/components/shared/CodeBlock.stories.tsx`

## Replace

### Shared

- `src/components/shared/action-card.stories.tsx`
- `src/components/shared/app-drawer.stories.tsx`
- `src/components/shared/breadcrumb.stories.tsx`
- `src/components/shared/SlatecampLoader.stories.tsx`
- `src/components/shared/content-sidebar.stories.tsx`
- `src/components/shared/DashboardHeader.stories.tsx`
- `src/components/shared/DashboardPageSkeleton.stories.tsx`
- `src/components/shared/data-table.stories.tsx`
- `src/components/shared/difficulty-bar.stories.tsx`
- `src/components/shared/empty-state.stories.tsx`
- `src/components/shared/event-badge.stories.tsx`
- `src/components/shared/floating-panel.stories.tsx`
- `src/components/shared/InfoTooltip.stories.tsx`
- `src/components/shared/legal-citation-badge.stories.tsx`
- `src/components/shared/LogoutButton.stories.tsx`
- `src/components/shared/mode-button.stories.tsx`
- `src/components/shared/Navbar.stories.tsx`
- `src/components/shared/Omnibar.stories.tsx`
- `src/components/shared/PanelCollapseHandle.stories.tsx`
- `src/components/shared/question-card.stories.tsx`
- `src/components/shared/question-dot-navigator.stories.tsx`
- `src/components/shared/QuickStatsRow.stories.tsx`
- `src/components/shared/score-display.stories.tsx`
- `src/components/shared/section-header.stories.tsx`
- `src/components/shared/sidebar-nav.stories.tsx`
- `src/components/shared/SourceBadge.stories.tsx`
- `src/components/shared/stat-card.stories.tsx`
- `src/components/shared/student-view-watermark.stories.tsx`
- `src/components/shared/taxonomy-picker.stories.tsx`
- `src/components/shared/taxonomy-tree.stories.tsx`
- `src/components/shared/ThemeToggle.stories.tsx`
- `src/components/shared/WikiSidePanel.stories.tsx`

### UI

- `src/components/ui/accordion.stories.tsx`
- `src/components/ui/alert-dialog.stories.tsx`
- `src/components/ui/avatar.stories.tsx`
- `src/components/ui/badge.stories.tsx`
- `src/components/ui/button.stories.tsx`
- `src/components/ui/calendar.stories.tsx`
- `src/components/ui/card.stories.tsx`
- `src/components/ui/checkbox.stories.tsx`
- `src/components/ui/close-button.stories.tsx`
- `src/components/ui/command.stories.tsx`
- `src/components/ui/dialog.stories.tsx`
- `src/components/ui/dropdown-menu.stories.tsx`
- `src/components/ui/eyebrow.stories.tsx`
- `src/components/ui/form-field.stories.tsx`
- `src/components/ui/input.stories.tsx`
- `src/components/ui/input-group.stories.tsx`
- `src/components/ui/label.stories.tsx`
- `src/components/ui/popover.stories.tsx`
- `src/components/ui/progress.stories.tsx`
- `src/components/ui/progress-bar.stories.tsx`
- `src/components/ui/radio-group.stories.tsx`
- `src/components/ui/resizable.stories.tsx`
- `src/components/ui/scroll-area.stories.tsx`
- `src/components/ui/select.stories.tsx`
- `src/components/ui/separator.stories.tsx`
- `src/components/ui/sheet.stories.tsx`
- `src/components/ui/skeleton.stories.tsx`
- `src/components/ui/slider.stories.tsx`
- `src/components/ui/spinner.stories.tsx`
- `src/components/ui/switch.stories.tsx`
- `src/components/ui/tabs.stories.tsx`
- `src/components/ui/textarea.stories.tsx`
- `src/components/ui/toast.stories.tsx`
- `src/components/ui/toolbar.stories.tsx`
- `src/components/ui/tooltip.stories.tsx`

## Delete

- `src/components/shared/NavigationProgress.stories.tsx`
  Reason: App chrome belongs outside component-level docs and is explicitly excluded from the future global Storybook runtime.
- `src/components/shared/ThemeProvider.stories.tsx`
  Reason: The theme provider belongs in the Storybook support layer, not as a documented component destination.
- `src/components/ui/toaster.stories.tsx`
  Reason: The toaster host is runtime infrastructure; the user-facing documentation surface should focus on toast behavior, not the mount point.

## Notes

- The placeholder guard intentionally allows the current 71-file baseline to exist during migration while rejecting any new file that adds the scaffold marker.
- Any file removed from the baseline or rewritten without the placeholder marker will naturally disappear from the guard output without further edits to the script.

## Current Inventory After Phase 2

- Total current stories: `79`
- Placeholder scaffold stories still pending replacement: `71`
- Real stories currently retained or newly added: `8`
- New Storybook scene added in Phase 2:
  - `src/storybook/scenes/developer/BreadcrumbsScene.stories.tsx`

## Phase 2 Runtime Notes

- Story discovery now targets:
  - `src/components/**/*.stories.*`
  - `src/features/**/*.stories.*`
  - `src/storybook/scenes/**/*.stories.*`
- `src/app/**/*.stories.*` is no longer scanned.
- The new `src/storybook/` support layer owns:
  - decorators
  - fixtures
  - mocks
  - scenes
  - support docs
- Storybook now aliases `next/link` and `next/navigation` to local Storybook mocks in `.storybook/main.ts`.
- Storybook preview now applies:
  - class-based light/dark theme switching
  - `ThemeProvider`
  - `TooltipProvider`
  - optional `Toaster` and `NoiseFilter` via `appShell` parameters
  - browser API mocks for clipboard, `IntersectionObserver`, `ResizeObserver`, and `matchMedia`
- `build-storybook` passed on 2026-04-06 after the Phase 2 foundation landed.
- `build-storybook` still emits upstream Storybook bundler warnings about chunk size and direct `eval`; those are coming from Storybook internals, not from repo code.

## Current Inventory After Phase 2.5

- Total current stories: `78`
- Placeholder scaffold stories still pending replacement: `70`
- Real stories/scenes currently retained: `8`
- Retired in Phase 2.5:
  - `src/components/shared/page-header.stories.tsx`

## Phase 2.5 Canonicalization Notes

- `/dashboard/developer` now keeps only redirect pages for:
  - `page.tsx`
  - `console/page.tsx`
  - `db/page.tsx`
  - `logs/page.tsx`
  - `test-data/page.tsx`
- Deleted dead duplicate dashboard developer files:
  - `layout.tsx`
  - `loading.tsx`
  - `dev-nav.tsx`
  - `console/console-client.tsx`
  - `console/loading.tsx`
  - `db/loading.tsx`
  - `logs/loading.tsx`
  - `test-data/loading.tsx`
  - `test-data/test-data-client.tsx`
- `src/components/shared/page-header.tsx` was retired; `SectionHeader` is now the canonical shared page-header primitive.
- `src/components/developer/Breadcrumbs.tsx` now delegates rendering to `src/components/shared/breadcrumb.tsx`.
- `/developer/tools/db` and `/developer/tools/logs` now use shared `DataTable` and `EmptyState`.
- `/developer/status/database` and `/developer/status/infrastructure` now use `formatRelativeTime` instead of duplicating local `timeAgo()` helpers.
- `bun run check:storybook-placeholders` passed on 2026-04-06 and reported `70` tracked scaffold files still containing the marker.
- `bun run build` passed on 2026-04-06 after the Phase 2.5 cleanup landed.

## Current Inventory After Phase 3

- Total current stories: `30`
- Placeholder scaffold stories still pending replacement: `0`
- Real stories/scenes currently retained or newly authored: `30`

## Phase 3 Canonical Story Surface

### Rewritten Canonical Stories

- `src/components/shared/action-card.stories.tsx`
- `src/components/shared/breadcrumb.stories.tsx`
- `src/components/shared/SlatecampLoader.stories.tsx`
- `src/components/shared/DashboardHeader.stories.tsx`
- `src/components/shared/DashboardPageSkeleton.stories.tsx`
- `src/components/shared/data-table.stories.tsx`
- `src/components/shared/difficulty-bar.stories.tsx`
- `src/components/shared/empty-state.stories.tsx`
- `src/components/shared/question-card.stories.tsx`
- `src/components/shared/question-dot-navigator.stories.tsx`
- `src/components/shared/score-display.stories.tsx`
- `src/components/shared/section-header.stories.tsx`
- `src/components/shared/stat-card.stories.tsx`
- `src/components/ui/accordion.stories.tsx`
- `src/components/ui/badge.stories.tsx`
- `src/components/ui/button.stories.tsx`
- `src/components/ui/card.stories.tsx`
- `src/components/ui/dialog.stories.tsx`
- `src/components/ui/input.stories.tsx`
- `src/components/ui/separator.stories.tsx`
- `src/components/ui/tabs.stories.tsx`
- `src/components/ui/tooltip.stories.tsx`

### Retired Placeholder Families

- Dormant shared Storybook coverage was removed for app chrome and low-signal wrappers:
  - `app-drawer`
  - `content-sidebar`
  - `event-badge`
  - `floating-panel`
  - `InfoTooltip`
  - `legal-citation-badge`
  - `LogoutButton`
  - `mode-button`
  - `Navbar`
  - `NavigationProgress`
  - `Omnibar`
  - `PanelCollapseHandle`
  - `QuickStatsRow`
  - `SourceBadge`
  - `ThemeProvider`
  - `ThemeToggle`
  - `WikiSidePanel`
  - `student-view-watermark`
  - `taxonomy-picker`
  - `taxonomy-tree`
- Dormant or redundant UI primitive coverage was removed for:
  - `alert-dialog`
  - `avatar`
  - `calendar`
  - `checkbox`
  - `close-button`
  - `command`
  - `dropdown-menu`
  - `eyebrow`
  - `form-field`
  - `input-group`
  - `label`
  - `popover`
  - `progress`
  - `progress-bar`
  - `radio-group`
  - `resizable`
  - `scroll-area`
  - `select`
  - `sheet`
  - `skeleton`
  - `slider`
  - `spinner`
  - `switch`
  - `textarea`
  - `toast`
  - `toaster`
  - `toolbar`

## Phase 3 Validation Notes

- Added a Storybook-only alias in `.storybook/main.ts` for `@/lib/actions/notes-actions`, backed by `src/storybook/mocks/notes-actions.ts`, so `DashboardHeader` can render in Storybook without importing live server actions into Vite.
- `bun run check:storybook-placeholders` passed on 2026-04-06 and reported `0` tracked scaffold files still containing the marker.
- `bun run build-storybook` passed on 2026-04-06 after the Phase 3 rewrites landed.
- `bun run build` passed on 2026-04-06 after the Phase 3 rewrites landed.
- Wiki verification for Phase 3 used two checks:
  - The successful production build still included `/dashboard/wiki/[slug]`.
  - `git diff --name-only -- src/app/dashboard/wiki src/components/wiki` returned no changes.
- `build-storybook` still emits upstream Storybook warnings about direct `eval`, large chunks, and the empty `src/features/**/*.stories.*` pattern; those warnings are external to the repo code and did not block the build.

## Current Inventory After Phase 4

- Total current stories: `60`
- Placeholder scaffold stories still pending replacement: `0`
- Real stories/scenes currently retained or newly authored: `60`

## Phase 4 Wiki Story Surface

### New Storybook Runtime Support

- `.storybook/main.ts` now aliases Storybook-only wiki runtime modules for:
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
- `src/storybook/fixtures/wiki.ts` now owns the reusable wiki article, navigation, utility, and quiz fixtures used across the new Wiki story surface

### New `Wiki/` Story Coverage

- Article and navigation stories:
  - `src/components/wiki/article/WikiArticleHero.stories.tsx`
  - `src/components/wiki/navigation/WikiHeader.stories.tsx`
  - `src/components/wiki/navigation/WikiRightSidebar.stories.tsx`
  - `src/components/wiki/navigation/WikiTableOfContents.stories.tsx`
  - `src/components/wiki/navigation/WikiContentShell.stories.tsx`
- Block stories:
  - `src/components/wiki/blocks/Callout.stories.tsx`
  - `src/components/wiki/blocks/WikiExamTable.stories.tsx`
  - `src/components/wiki/blocks/FormulaBlock.stories.tsx`
  - `src/components/wiki/blocks/ComparisonTable.stories.tsx`
  - `src/components/wiki/blocks/KeyValues.stories.tsx`
  - `src/components/wiki/blocks/RevealBlock.stories.tsx`
  - `src/components/wiki/blocks/ProcessFlow.stories.tsx`
  - `src/components/wiki/blocks/SubjectSnapshot.stories.tsx`
- Teaching and quiz stories:
  - `src/components/wiki/blocks/InlineQuiz.stories.tsx`
  - `src/components/wiki/blocks/TeachBackPrompt.stories.tsx`
  - `src/components/wiki/blocks/ElaborativeInterrogation.stories.tsx`
  - `src/components/wiki/blocks/WrongAnswerBanner.stories.tsx`
  - `src/components/wiki/quiz/WikiQuizButton.stories.tsx`
  - `src/components/wiki/quiz/WikiQuizModal.stories.tsx`
- Sources and notes stories:
  - `src/components/wiki/shared/WikiSourcesPopover.stories.tsx`
  - `src/components/wiki/shared/WikiRelatedPopover.stories.tsx`
  - `src/components/wiki/shared/WikiReference.stories.tsx`
  - `src/components/wiki/shared/WikiTextSelection.stories.tsx`
  - `src/components/wiki/shared/WikiNoteAnchor.stories.tsx`
- Widget stories:
  - `src/components/wiki/widgets/bp344/RecallDrill.stories.tsx`
  - `src/components/wiki/widgets/dsgn013/DimensionDrill.stories.tsx`
  - `src/components/wiki/widgets/dsgn013/BodyDimensionDrill.stories.tsx`
  - `src/components/wiki/widgets/dsgn013/SpatialQualityDrill.stories.tsx`
  - `src/components/wiki/widgets/Lab3DWidget.stories.tsx`
- Composition scene:
  - `src/storybook/scenes/wiki/WikiArticleScene.stories.tsx`

### Widget Consolidation Notes

- The duplicate widget files were consolidated by keeping the canonical `*Drill` implementations and converting these legacy `*Practice` files into thin aliases:
  - `src/components/wiki/widgets/bp344/RecallPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/DimensionPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/BodyDimensionPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/SpatialQualityPractice.tsx`

## Phase 4 Validation Notes

- `bun run check:storybook-placeholders` passed on 2026-04-06 and reported `0` tracked scaffold files still containing the marker.
- `bun run build-storybook` passed on 2026-04-06 after the wiki story surface landed.
- `bun run build` passed on 2026-04-06 after the wiki story surface landed.
- Wiki verification for Phase 4 used three checks:
  - The successful production build still included `/dashboard/wiki/[slug]`.
  - `git diff --name-only -- src/app/dashboard/wiki` returned no changes.
  - `git diff --name-only -- src/components/wiki | Where-Object { $_ -notlike '*.stories.tsx' }` returned only the four `*Practice` alias files listed above.
- `build-storybook` still emits non-blocking warnings for:
  - the empty `src/features/**/*.stories.*` glob
  - Storybook's upstream `eval` and chunk-size warnings
  - Vite browser `crypto` externalization warnings
  - the dynamic-import-vars warning caused by `Lab3DWidget` loading `@/app/dashboard/3d-lab/_config/modules/${moduleId}`

## Current Inventory After Phase 5

- Total current stories: `63`
- Placeholder scaffold stories still pending replacement: `0`
- Real stories/scenes currently retained or newly authored: `63`

## Phase 5 Canonical Public Extractions

### Promoted 3D Lab Feature Surface

- `src/features/3d-lab/components/CategoryGrid.tsx`
- `src/features/3d-lab/components/LabBrowser.tsx`
- `src/features/3d-lab/components/ModuleCard.tsx`
- `src/features/3d-lab/components/ModuleList.tsx`
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/components/CanvasWrapper.tsx`
- `src/features/3d-lab/components/GlobalCanvasPortal.tsx`
- `src/features/3d-lab/hooks/useInvalidateOnChange.ts`
- `src/features/3d-lab/config/dashboard-visibility.ts`

### Promoted Calculator Support Surface

- `src/components/calculators/FlooringScene.tsx`
- `src/components/calculators/FlooringInputPanel.tsx`
- `src/components/calculators/PaintScene.tsx`
- `src/components/calculators/PaintInputPanel.tsx`
- `src/components/calculators/DrywallScene.tsx`
- `src/components/calculators/DrywallInputPanel.tsx`
- `src/components/calculators/CHBScene.tsx`
- `src/components/calculators/CHBInputPanel.tsx`

### New Feature Stories

- `src/features/3d-lab/components/CategoryGrid.stories.tsx`
- `src/features/3d-lab/components/LabBrowser.stories.tsx`
- `src/features/3d-lab/components/ModuleCard.stories.tsx`

## Phase 5 Validation Notes

- `bun run check:storybook-placeholders` passed on 2026-04-06 and reported `0` tracked scaffold files still containing the marker.
- `bun run build-storybook` passed on 2026-04-06 after the Phase 5 extraction landed.
- `bun run build` passed on 2026-04-06 after the Phase 5 extraction landed.
- `src/features/**/*.stories.*` is no longer empty; Storybook now discovers the three promoted 3D Lab feature stories.
- `rg -n "@/app/.+/_components/" src` returned only a documentation line in `src/app/admin/AGENTS.md`, confirming that live code no longer directly imports route-private `_components` from outside route trees.
- Wiki verification for Phase 5 used two checks:
  - The successful production build still included `/dashboard/wiki/[slug]`.
  - `git diff --name-only -- src/app/dashboard/wiki src/components/wiki` returned only the four pre-existing widget alias files from Phase 4:
    - `src/components/wiki/widgets/bp344/RecallPractice.tsx`
    - `src/components/wiki/widgets/dsgn013/DimensionPractice.tsx`
    - `src/components/wiki/widgets/dsgn013/BodyDimensionPractice.tsx`
    - `src/components/wiki/widgets/dsgn013/SpatialQualityPractice.tsx`
- Remaining non-blocking Storybook warnings are now limited to:
  - Storybook's upstream `eval` and chunk-size warnings
  - Vite browser `crypto` externalization warnings
  - the dynamic-import-vars warning caused by `Lab3DWidget` loading `@/app/dashboard/3d-lab/_config/modules/${moduleId}`

## Current Inventory After Phase 6

- Total current stories: `63`
- Placeholder scaffold stories still pending replacement: `0`
- Real stories/scenes currently retained or newly authored: `63`

## Phase 6 Governance Surface

- `scripts/check-storybook.ts` now acts as the unified Storybook governance guard.
- `package.json` now exposes:
  - `check:storybook`
  - `check:storybook-placeholders` as a compatibility alias
- `.github/workflows/storybook.yml` now builds Storybook in CI.
- `.github/pull_request_template.md` now includes the Storybook update checklist for public reusable components.
- Ownership guidance now lives in:
  - `src/storybook/docs/README.md`
  - `src/app/developer/AGENTS.md`
  - `.ai/docs/portal/004-developer.md`
- Review coverage by folder during sprint planning until any remaining high-value undocumented groups are addressed.

## Phase 6 Validation Notes

- `bun run check:storybook` passed on 2026-04-06 and scanned `63` story files while reporting `0` placeholder marker files still tracked.
- `bun run build-storybook` passed on 2026-04-06 after the governance layer landed.
- `bun run build` passed on 2026-04-06 after the governance layer landed.
- Wiki verification for Phase 6 used two checks:
  - The successful production build still included `/dashboard/wiki/[slug]`.
  - `git diff --name-only -- src/app/dashboard/wiki src/components/wiki` returned only the four pre-existing widget alias files from Phase 4:
    - `src/components/wiki/widgets/bp344/RecallPractice.tsx`
    - `src/components/wiki/widgets/dsgn013/DimensionPractice.tsx`
    - `src/components/wiki/widgets/dsgn013/BodyDimensionPractice.tsx`
    - `src/components/wiki/widgets/dsgn013/SpatialQualityPractice.tsx`
- Remaining non-blocking Storybook warnings are unchanged in substance:
  - Storybook's upstream `eval` and chunk-size warnings
  - Vite browser `crypto` externalization warnings
  - the dynamic-import-vars warning caused by `Lab3DWidget` loading `@/app/dashboard/3d-lab/_config/modules/${moduleId}`

