# Storybook Audit Report

**Date:** 2026-05-04
**Branch:** codebase-modernization-batch1-2
**Tooling:** Storybook 8.6.17, @storybook/react-vite

---

## 1. Build Status

**FAILED.** `bun run build-storybook` fails with a Vite/Rollup error:

```
src/lib/actions/quiz-v2/start-session.ts (3:9):
"randomBytes" is not exported by "__vite-browser-external",
imported by "src/lib/actions/quiz-v2/start-session.ts".
```

Root cause: A `'use server'` file (`start-session.ts`) imports `randomBytes` from Node's `crypto` module. This module is pulled into the client bundle via component import chains. The fix is either (a) exclude server-action imports from the Storybook Vite resolve config, or (b) add `crypto` to the Vite externals. 11,221 modules were transformed before the failure.

The `check:storybook` script PASSES: "Storybook guard OK: 100 story file(s) scanned; 0 placeholder marker file(s) still tracked."

---

## 2. Story Count

**Total story files: 100**

| Directory                     | Stories |
|-------------------------------|---------|
| `src/components/ui/`          | 23      |
| `src/components/shared/`      | 22      |
| `src/components/wiki/blocks/` | 12      |
| `src/storybook/scenes/DesignSystem/` | 5 |
| `src/components/wiki/shared/` | 5       |
| `src/components/wiki/navigation/` | 4   |
| `src/components/developer/`   | 4       |
| `src/features/3d-lab/components/` | 3  |
| `src/components/wiki/widgets/dsgn013/` | 3 |
| `src/components/quiz-v2/`     | 3       |
| `src/components/wiki/widgets/` | 2      |
| `src/components/wiki/quiz/`   | 2       |
| `src/components/score/`       | 2       |
| `src/components/marketing/`   | 2       |
| `src/storybook/scenes/wiki/`  | 2       |
| Others (1 each)               | 6       |

---

## 3. Coverage by Component Directory

### Well-Covered (>=60%)

| Directory                | Coverage |
|--------------------------|----------|
| `score/`                 | 100% (2/2) |
| `wiki/quiz/`             | 100% (2/2) |
| `wiki/widgets/`          | 100% (2/2) |
| `wiki/shared/`           | 71% (5/7) |
| `developer/`             | 66% (4/6) |
| `ui/`                    | 63% (23/36) |
| `shared/`                | 55% (22/40) |

### Partially Covered (10-50%)

| Directory                | Coverage  |
|--------------------------|-----------|
| `wiki/blocks/`           | 44% (12/27) |
| `testing/hub/`           | 33% (1/3) |
| `wiki/widgets/dsgn013/`  | 30% (3/10) |
| `wiki/navigation/`       | 26% (4/15) |
| `wiki/article/`          | 16% (1/6) |
| `wiki/widgets/bp344/`    | 16% (1/6) |
| `portal/`                | 14% (1/7) |
| `marketing/`             | 10% (2/20+2) |
| `quiz-v2/`               | 8% (3/36+23) |
| `calculators/`           | 5% (1/17) |

### Zero Coverage (0%)

| Directory                    | Component Count |
|------------------------------|-----------------|
| `admin/` (+ subdirs)         | 31              |
| `analytics/`                 | 72              |
| `assessment/`               | 4               |
| `auth/`                     | 2               |
| `ceo/` (+ analytics/charts/skeletons) | 38    |
| `dashboard/` (+ heatmap/upgrade) | 40           |
| `dev/`                      | 9               |
| `graphics/` (icons/logos/ui) | 4              |
| `interactive-illustrations/` | 1               |
| `landing/`                  | 2               |
| `layout/`                   | 1               |
| `layouts/`                  | 1               |
| `motion/`                   | 2               |
| `notes/`                    | 8               |
| `notifications/`            | 6               |
| `quiz/`                     | 1               |
| `quiz-v2/results/`          | 15              |
| `quiz-v2/review/`           | 1               |
| `quiz-v2/setup/`            | 7               |
| `r3f/`                      | 5               |
| `settings/`                 | 1               |
| `sidebar/`                  | 9               |
| `tools/` (+ subdirs)        | 6               |
| `trails/`                   | 21              |
| `3d/`                       | 1               |

### Features Coverage

| Feature                        | Coverage             |
|--------------------------------|----------------------|
| `features/3d-lab/components/`  | 3/100+ components    |
| `features/3d-lab/DevControlsModule/` | 0/55+         |
| `features/3d-lab/scenes/`      | 0/9                 |
| `features/3d-lab/templates/`   | 0/12                |
| `features/wall-configurator/`  | 0/9                 |

---

## 4. Stale / Deleted Story Gaps

The `check:storybook` baseline shows 70 stories that previously existed as placeholders but have been "cleaned or removed." 16 of these represent components that **still exist but had their stories deleted** without replacement:

- `src/components/shared/event-badge.tsx`
- `src/components/shared/floating-panel.tsx`
- `src/components/shared/legal-citation-badge.tsx`
- `src/components/shared/mode-button.tsx`
- `src/components/shared/student-view-watermark.tsx`
- `src/components/shared/sidebar-nav.tsx`
- `src/components/shared/taxonomy-picker.tsx`
- `src/components/shared/taxonomy-tree.tsx`
- `src/components/shared/InfoTooltip.tsx`
- `src/components/shared/LogoutButton.tsx`
- `src/components/shared/NavigationProgress.tsx`
- `src/components/shared/QuickStatsRow.tsx`
- `src/components/shared/SourceBadge.tsx`
- `src/components/shared/ThemeProvider.tsx`
- `src/components/shared/ThemeToggle.tsx`
- `src/components/shared/WikiSidePanel.tsx`

These are "story regressions" -- components that once had story coverage (placeholder-level) but lost it without getting real stories.

Additionally, the following components were deleted/moved alongside their stories (no gap):
- `src/components/shared/breadcrumb.tsx` (moved to `ui/breadcrumb.tsx`)
- `src/components/shared/content-sidebar.tsx` (component also deleted)

---

## 5. Missing UI Components (ui/ directory)

These 13 `ui/` components have NO stories:

- `alert-dialog`
- `calendar`
- `close-button`
- `command`
- `eyebrow`
- `input-group`
- `label`
- `popover`
- `scroll-area`
- `slider`
- `toast`
- `toaster`
- `unified-slider`

---

## 6. High-Value Missing Stories (Priority)

### Tier 1: Critical User-Facing Components

These are heavily used across the app and have ZERO story coverage:

1. **`sidebar/Sidebar`** -- Main app navigation shell
2. **`sidebar/SidebarNavItem`** -- Core navigation building block
3. **`dashboard/DailyDoseCard`** -- Primary daily learning card
4. **`dashboard/SubjectMasteryCard`** -- Core dashboard widget
5. **`dashboard/StreakRibbon`** -- Gamification/engagement element
6. **`dashboard/ModeCard`** -- Quiz mode selector
7. **`portal/PortalLayout`** -- Portal page shell
8. **`portal/PortalSidebar`** -- Portal navigation
9. **`trails/TrailCard`** -- Learning trail card
10. **`trails/TrailLibrary`** -- Trail browser shell
11. **`quiz-v2/BaseQuizShell`** -- Quiz shell (entire quiz UX has only 3 stories)
12. **`quiz-v2/QuizBody`** -- Main quiz body
13. **`quiz-v2/StandardQuizShell`** -- Standard quiz mode
14. **`quiz-v2/SimulationShell`** -- Exam simulation UX (high complexity, zero coverage)
15. **`auth/SignInWithGoogleButton`** -- Auth entry point

### Tier 2: Design System Gaps

These shadcn/ui wrappers that ship with the system need stories:

- `alert-dialog`, `popover`, `slider`, `command`, `scroll-area` (all missing)
- `label` (commonly used primitive)
- `toast`/`toaster` (notification system)

### Tier 3: Analytics & CEO Dashboards

All 72 analytics components and all 38 CEO portal components have zero stories. These are complex data visualizations where Storybook with mock data would be extremely valuable for development velocity and visual regression testing.

Prioritize:
- `analytics/CalibrationCurve`
- `analytics/ConfidenceCalibration`
- `analytics/ForgettingCurves`
- `analytics/StudyStreakCalendar`
- `ceo/RevenueChart` / `ceo/RevenueExpenseChart`
- `ceo/RunwayGauge`

### Tier 4: Complex Widgets with No Coverage

These wiki widgets have interactive 3D or complex visualization surfaces and would benefit greatly from isolated stories:

- `bp344/DoorConfigurator`, `bp344/CorridorVisualizer`, `bp344/CubicleChecker`, `bp344/GrabBarExplainer`
- `dsgn013/BedSizeComparator`, `dsgn013/BodyDimensionExplorer`, `dsgn013/DHRatioExplorer`, `dsgn013/ReachEnvelopeDiagram`
- `r3f/WebGLErrorBoundary`, `r3f/CanvasLoadingOverlay`

---

## 7. Summary

| Metric                          | Value                |
|---------------------------------|----------------------|
| Total story files               | 100                  |
| Storybook check (governance)    | PASS                 |
| Storybook build                 | FAIL (crypto import) |
| Components with stories         | ~80                  |
| Components without stories      | ~400+                |
| Overall component coverage      | ~16%                 |
| Directories with 0% coverage    | 20+                  |
| Story regressions (deleted stories) | 16               |
| Tier-1 high-value missing stories | 15                |

The Storybook infrastructure (config, mocks, decorators) is solid. The primary issues are: (1) a build failure caused by a server-action file leaking into the Vite bundle, (2) critically low coverage in user-facing dashboard, quiz, sidebar, and trails components, and (3) 16 story regressions where components lost their story files during the placeholder cleanup without replacement.
